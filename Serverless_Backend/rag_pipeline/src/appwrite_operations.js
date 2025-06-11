import { Client as AppwriteClient, Storage, Databases, ID, Query } from 'node-appwrite';
import { CONFIG } from './config.js';
import { parseFileContent, getContentSummary, validateParsedContent } from './parse_operations.js';

// --- Initialize Appwrite Client ---
const appwriteClient = new AppwriteClient()
    .setEndpoint(CONFIG.APPWRITE_ENDPOINT)
    .setProject(CONFIG.APPWRITE_PROJECT_ID);

if (CONFIG.APPWRITE_API_KEY) {
    appwriteClient.setKey(CONFIG.APPWRITE_API_KEY);
    console.log("Appwrite client initialized with API Key.");
} else {
    console.error("❌ Error: APPWRITE_API_KEY is not set. This is required for server-side database operations (logging).");
    process.exit(1);
}

const storage = new Storage(appwriteClient);
const databases = new Databases(appwriteClient);

// --- Appwrite Database Setup Functions ---
export async function ensureAppwriteLogCollection() {
    try {
        // Check if database exists
        try {
            await databases.get(CONFIG.APPWRITE_DATABASE_ID);
            console.log(`Appwrite database "${CONFIG.APPWRITE_DATABASE_ID}" already exists.`);
        } catch (dbError) {
            // @ts-ignore
            if (dbError.code === 404 || dbError.message?.includes('Database not found')) {
                console.log(`Appwrite database "${CONFIG.APPWRITE_DATABASE_ID}" does not exist. Creating it...`);
                await databases.create(CONFIG.APPWRITE_DATABASE_ID, "EmbeddingDB"); // Provide a name for your DB
                console.log(`Appwrite database "${CONFIG.APPWRITE_DATABASE_ID}" created successfully.`);
            } else {
                throw dbError; // Re-throw other errors
            }
        }

        // Check if collection exists
        try {
            const collection = await databases.getCollection(CONFIG.APPWRITE_DATABASE_ID, CONFIG.APPWRITE_COLLECTION_ID_EMBEDDING_LOGS);
            console.log(`Appwrite collection "embedding_logs" already exists.`);
            
            // Check if required attributes exist
            const hasFileIdAttr = collection.attributes.some(attr => attr.key === 'fileid');
            const hasStatusAttr = collection.attributes.some(attr => attr.key === 'status');
            const hasTimestampAttr = collection.attributes.some(attr => attr.key === 'timestamp');
            
            if (hasFileIdAttr && hasStatusAttr && hasTimestampAttr) {
                console.log(`Collection schema is correct. Preserving existing processing logs.`);
                return; // Collection is properly set up, no need to recreate
            } else {
                console.log(`Collection exists but missing required attributes. Recreating...`);
                // Only delete if schema is actually incorrect
                await databases.deleteCollection(CONFIG.APPWRITE_DATABASE_ID, CONFIG.APPWRITE_COLLECTION_ID_EMBEDDING_LOGS);
                console.log(`Deleted collection with incorrect schema.`);
            }
            
        } catch (error) {
            // @ts-ignore
            if (error.code === 404 || error.message?.includes('Collection not found')) {
                console.log(`Appwrite collection "embedding_logs" does not exist. Creating it...`);
            } else {
                console.error('Error checking collection:', error);
                throw error;
            }
        }

        // Create the collection (either it didn't exist or had wrong schema)
        console.log(`Creating collection with correct schema...`);
        await databases.createCollection(
            CONFIG.APPWRITE_DATABASE_ID,
            CONFIG.APPWRITE_COLLECTION_ID_EMBEDDING_LOGS,
            "Embedding Logs"
        );
        console.log(`Collection created. Creating attributes...`);
        
        // Wait for a moment to ensure collection is fully registered
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Create attributes with required wait time between each
        await databases.createStringAttribute(CONFIG.APPWRITE_DATABASE_ID, CONFIG.APPWRITE_COLLECTION_ID_EMBEDDING_LOGS, 'fileid', 255, true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await databases.createBooleanAttribute(CONFIG.APPWRITE_DATABASE_ID, CONFIG.APPWRITE_COLLECTION_ID_EMBEDDING_LOGS, 'status', true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await databases.createDatetimeAttribute(CONFIG.APPWRITE_DATABASE_ID, CONFIG.APPWRITE_COLLECTION_ID_EMBEDDING_LOGS, 'timestamp', true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log(`All attributes created successfully.`);
        
        // Wait for attributes to be fully registered before adding index
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
            console.log(`Creating index on 'fileid'...`);
            await databases.createIndex(CONFIG.APPWRITE_DATABASE_ID, CONFIG.APPWRITE_COLLECTION_ID_EMBEDDING_LOGS, 'idx_fileid', 'key', ['fileid'], ['ASC']);
            console.log(`Index created successfully.`);
        } catch (indexError) {
            console.error(`Error creating index: ${indexError}`);
        }
            
    } catch (error) {
        console.error('Error ensuring Appwrite log collection setup:', error);
        throw error;
    }
}

// --- File Processing Status Functions ---
export async function getProcessedFileStatus(fileId) {
    try {
        // First, make sure fileId is properly formatted as a string
        const fileIdStr = String(fileId);
        
        const response = await databases.listDocuments(
            CONFIG.APPWRITE_DATABASE_ID,
            CONFIG.APPWRITE_COLLECTION_ID_EMBEDDING_LOGS,
            [Query.equal('fileid', fileIdStr), Query.limit(1)]
        );
        if (response.total > 0 && response.documents[0].status === true) {
            console.log(`File ID ${fileId} already processed and successfully embedded.`);
            return true;
        }
        if (response.total > 0 && response.documents[0].status === false) {
            console.log(`File ID ${fileId} was previously processed but failed. Retrying.`);
            return false;
        }
        return false;
    } catch (error) {
        console.error(`Error checking processed status for file ${fileId}:`, error);
        // If it's the specific invalid query error, let's try direct API search without Query builder
        if (error.type === 'general_query_invalid' || error.message?.includes('Invalid query')) {
            console.log(`Trying alternative lookup method for file ${fileId}...`);
            try {
                // Just fetch all documents and filter in-memory (not ideal but can work for small collections)
                const allDocs = await databases.listDocuments(
                    CONFIG.APPWRITE_DATABASE_ID, 
                    CONFIG.APPWRITE_COLLECTION_ID_EMBEDDING_LOGS,
                    [Query.limit(100)]
                );
                
                const matchDoc = allDocs.documents.find(doc => doc.fileid === String(fileId));
                if (matchDoc && matchDoc.status === true) {
                    console.log(`Found file ${fileId} in the database, status is success.`);
                    return true;
                }
                console.log(`File ${fileId} either not found or status is not success.`);
                return false;
            } catch (altError) {
                console.error(`Alternative lookup also failed:`, altError);
                return false;
            }
        }
        return false; // Treat errors as "not processed" to be safe
    }
}

export async function logFileProcessingStatus(fileId, wasSuccessful) {
    try {
        // Ensure fileId is a string
        const fileIdStr = String(fileId);
        
        try {
            const existingDocs = await databases.listDocuments(
                CONFIG.APPWRITE_DATABASE_ID,
                CONFIG.APPWRITE_COLLECTION_ID_EMBEDDING_LOGS,
                [Query.equal('fileid', fileIdStr), Query.limit(1)]
            );

            const dataToStore = {
                fileid: fileIdStr,
                status: wasSuccessful,
                timestamp: new Date().toISOString(),
            };

            if (existingDocs.total > 0) {
                const documentId = existingDocs.documents[0].$id;
                await databases.updateDocument(
                    CONFIG.APPWRITE_DATABASE_ID,
                    CONFIG.APPWRITE_COLLECTION_ID_EMBEDDING_LOGS,
                    documentId,
                    dataToStore
                );
                console.log(`Updated log for file ID: ${fileId} with status: ${wasSuccessful}`);
            } else {
                await databases.createDocument(
                    CONFIG.APPWRITE_DATABASE_ID,
                    CONFIG.APPWRITE_COLLECTION_ID_EMBEDDING_LOGS,
                    ID.unique(),
                    dataToStore
                );
                console.log(`Logged file ID: ${fileId} with status: ${wasSuccessful}`);
            }
        } catch (queryError) {
            // If query fails, just create a new document
            if (queryError.type === 'general_query_invalid' || queryError.message?.includes('Invalid query')) {
                console.log(`Could not query for existing document, creating new one for ${fileId}...`);
                const dataToStore = {
                    fileid: fileIdStr,
                    status: wasSuccessful,
                    timestamp: new Date().toISOString(),
                };
                await databases.createDocument(
                    CONFIG.APPWRITE_DATABASE_ID,
                    CONFIG.APPWRITE_COLLECTION_ID_EMBEDDING_LOGS,
                    ID.unique(),
                    dataToStore
                );
                console.log(`Created new log for file ID: ${fileId} with status: ${wasSuccessful}`);
            } else {
                throw queryError;
            }
        }
    } catch (error) {
        console.error(`Error logging processed file ${fileId}:`, error);
    }
}

// --- Enhanced File Content Functions ---
export async function getFileContent(fileId, fileName) {
    try {
        console.log(`Fetching content for file: ${fileName} (ID: ${fileId})`);
        const fileDataArrayBuffer = await storage.getFileView(CONFIG.APPWRITE_BUCKET_ID, fileId);
        const textDecoder = new TextDecoder('utf-8'); // Assuming UTF-8 text files
        const rawContent = textDecoder.decode(fileDataArrayBuffer);
        console.log(`Successfully fetched raw content for file: ${fileName}`);
        return rawContent;
    } catch (error) {
        console.error(`Error fetching content for file ${fileName} (ID: ${fileId}):`, error);
        return null;
    }
}

export async function getAndParseFileContent(fileId, fileName) {
    try {
        console.log(`Fetching and parsing content for file: ${fileName} (ID: ${fileId})`);
        
        // Get raw content
        const rawContent = await getFileContent(fileId, fileName);
        if (!rawContent) {
            return null;
        }
        
        // Parse content based on file type
        const parseResult = parseFileContent(rawContent, fileName);
        
        // Validate parsed content
        const validation = validateParsedContent(parseResult);
        if (!validation.isValid) {
            console.warn(`Validation warnings for ${fileName}:`, validation.errors);
        }
        
        // Get content summary
        const summary = getContentSummary(parseResult);
        console.log(`📊 Content Summary for ${fileName}:`, summary);
        
        return parseResult;
    } catch (error) {
        console.error(`Error parsing content for file ${fileName} (ID: ${fileId}):`, error);
        
        // Fallback to raw content if parsing fails
        const rawContent = await getFileContent(fileId, fileName);
        if (rawContent) {
            return {
                content: rawContent,
                metadata: {
                    fileName,
                    type: 'fallback',
                    parseError: error.message,
                    parsedAt: new Date().toISOString()
                },
                originalLength: rawContent.length,
                processedLength: rawContent.length
            };
        }
        
        return null;
    }
}

export async function getAllAppwriteFiles() {
    try {
        const appwriteFiles = await storage.listFiles(CONFIG.APPWRITE_BUCKET_ID);
        console.log(`Found ${appwriteFiles.total} files in Appwrite bucket "${CONFIG.APPWRITE_BUCKET_ID}".`);
        return appwriteFiles;
    } catch (error) {
        console.error('Error fetching Appwrite files:', error);
        throw error;
    }
}

// --- File Analysis Functions ---
export async function analyzeFileTypes() {
    try {
        const files = await getAllAppwriteFiles();
        const analysis = {};
        
        files.files.forEach(file => {
            const extension = file.name.split('.').pop()?.toLowerCase() || 'no-extension';
            analysis[extension] = (analysis[extension] || 0) + 1;
        });
        
        console.log(`📈 File Type Analysis:`, analysis);
        return analysis;
    } catch (error) {
        console.error('Error analyzing file types:', error);
        return {};
    }
}

export { appwriteClient, storage, databases, Query };
