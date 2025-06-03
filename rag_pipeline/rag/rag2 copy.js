import { Client as AppwriteClient, Storage, Databases, ID, Query } from 'node-appwrite';
import { GoogleGenAI } from "@google/genai";
import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from 'dotenv';
import fs from 'fs'; // Only needed if you still want to save Gemini output locally
import { v4 as uuidv4 } from 'uuid'; // For generating Qdrant point IDs
import path from 'path'; // For creating the output directory

// Load environment variables from .env file
dotenv.config();

// --- Environment Variable Checks ---
const requiredEnvVars = [
  'APPWRITE_ENDPOINT',
  'APPWRITE_PROJECT_ID',
  'APPWRITE_BUCKET_ID',
  'APPWRITE_DATABASE_ID',
  'APPWRITE_COLLECTION_ID_EMBEDDING_LOGS',
  'APPWRITE_API_KEY', // Crucial for server-side database operations
  'GEMINI_API_KEY',
  'QDRANT_URL',
  // QDRANT_API_KEY is optional unless QDRANT_URL points to cloud
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Error: Missing required environment variables:');
  missingEnvVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease check your .env file and ensure all required variables are set.');
  process.exit(1); // Exit with error code
}

if (process.env.QDRANT_URL && process.env.QDRANT_URL.includes("cloud.qdrant.io") && !process.env.QDRANT_API_KEY) {
    console.error("❌ Error: QDRANT_API_KEY is required when using a Qdrant Cloud URL.");
    process.exit(1);
}

// --- Appwrite Configuration ---
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const APPWRITE_BUCKET_ID = process.env.APPWRITE_BUCKET_ID;
const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
const APPWRITE_COLLECTION_ID_EMBEDDING_LOGS = process.env.APPWRITE_COLLECTION_ID_EMBEDDING_LOGS;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;

// --- Qdrant Configuration ---
const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const QDRANT_COLLECTION_NAME = "gemini_embeddings_collection2"; // Or your desired name
const VECTOR_DIMENSION = 3072; // Updated to match Gemini's actual output dimension
                               // The model 'gemini-embedding-exp-03-07' is outputting 3072-dimensional vectors

// --- Gemini Configuration ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_EMBEDDING_MODEL = 'gemini-embedding-exp-03-07';

// --- Initialize Appwrite Client ---
const appwriteClient = new AppwriteClient()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

if (APPWRITE_API_KEY) {
    appwriteClient.setKey(APPWRITE_API_KEY);
    console.log("Appwrite client initialized with API Key.");
} else {
    console.error("❌ Error: APPWRITE_API_KEY is not set. This is required for server-side database operations (logging).");
    process.exit(1);
}

const storage = new Storage(appwriteClient);
const databases = new Databases(appwriteClient);

// --- Initialize Gemini Client ---
const geminiAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// --- Initialize Qdrant Client ---
const qdrantClientOptions = { 
    url: QDRANT_URL, 
    apiKey: QDRANT_API_KEY,
    checkCompatibility: false, 
};
if (QDRANT_URL && QDRANT_URL.includes("cloud.qdrant.io") && !QDRANT_URL.match(/:\d+/)) {
    qdrantClientOptions.port = null; 
}
const qdrantClient = new QdrantClient(qdrantClientOptions);
console.log(`Qdrant client initialized. Target: ${QDRANT_URL}, Port: ${qdrantClientOptions.port === null ? 'default HTTPS (443)' : (qdrantClientOptions.port || 'default HTTP (80)')}`);


async function ensureQdrantCollection() {
    try {
        const collections = await qdrantClient.getCollections();
        const collectionExists = collections.collections.some(
            (collection) => collection.name === QDRANT_COLLECTION_NAME
        );

        if (!collectionExists) {
            console.log(`Qdrant Collection "${QDRANT_COLLECTION_NAME}" does not exist. Creating it...`);
            await qdrantClient.createCollection(QDRANT_COLLECTION_NAME, {
                vectors: {
                    size: VECTOR_DIMENSION,
                    distance: "Cosine",
                },
            });
            console.log(`Qdrant Collection "${QDRANT_COLLECTION_NAME}" created successfully.`);
        } else {
            console.log(`Qdrant Collection "${QDRANT_COLLECTION_NAME}" already exists.`);
        }
    } catch (error) {
        console.error("Error managing Qdrant collection:", error);
        throw error;
    }
}

async function ensureAppwriteLogCollection() {
    try {
        // Check if database exists
        try {
            await databases.get(APPWRITE_DATABASE_ID);
            console.log(`Appwrite database "${APPWRITE_DATABASE_ID}" already exists.`);
        } catch (dbError) {
            // @ts-ignore
            if (dbError.code === 404 || dbError.message?.includes('Database not found')) {
                console.log(`Appwrite database "${APPWRITE_DATABASE_ID}" does not exist. Creating it...`);
                await databases.create(APPWRITE_DATABASE_ID, "EmbeddingDB"); // Provide a name for your DB
                console.log(`Appwrite database "${APPWRITE_DATABASE_ID}" created successfully.`);
            } else {
                throw dbError; // Re-throw other errors
            }
        }

        // Check if collection exists
        try {
            await databases.getCollection(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_EMBEDDING_LOGS);
            console.log(`Appwrite collection "embedding_logs" already exists.`);
            
            // Let's recreate the collection to ensure correct attribute types
            try {
                console.log(`Deleting existing collection to recreate with proper schema...`);
                await databases.deleteCollection(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_EMBEDDING_LOGS);
                console.log(`Successfully deleted old collection.`);
            } catch (delError) {
                console.log(`Error deleting collection, it might not exist: ${delError}`);
            }
            
            console.log(`Creating fresh collection with correct schema...`);
            await databases.createCollection(
                APPWRITE_DATABASE_ID,
                APPWRITE_COLLECTION_ID_EMBEDDING_LOGS,
                "Embedding Logs"
            );
            console.log(`Collection created. Creating attributes...`);
            
            // Wait for a moment to ensure collection is fully registered
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Create attributes with required wait time between each
            await databases.createStringAttribute(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_EMBEDDING_LOGS, 'fileid', 255, true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            await databases.createBooleanAttribute(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_EMBEDDING_LOGS, 'status', true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            await databases.createDatetimeAttribute(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_EMBEDDING_LOGS, 'timestamp', true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            console.log(`All attributes created successfully.`);
            
            // Wait for attributes to be fully registered before adding index
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            try {
                console.log(`Creating index on 'fileid'...`);
                await databases.createIndex(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_EMBEDDING_LOGS, 'idx_fileid', 'key', ['fileid'], ['ASC']);
                console.log(`Index created successfully.`);
            } catch (indexError) {
                console.error(`Error creating index: ${indexError}`);
            }
            
        } catch (error) {
            // @ts-ignore
            if (error.code === 404 || error.message?.includes('Collection not found')) {
                console.log(`Appwrite collection "embedding_logs" does not exist. Creating it with attributes and index...`);
                await databases.createCollection(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_COLLECTION_ID_EMBEDDING_LOGS,
                    "Embedding Logs" // Collection Name for display
                );
                console.log(`Appwrite collection "embedding_logs" created. Creating attributes...`);
                
                // Wait for a moment to ensure collection is fully registered
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                await databases.createStringAttribute(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_EMBEDDING_LOGS, 'fileid', 255, true);
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                await databases.createBooleanAttribute(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_EMBEDDING_LOGS, 'status', true);
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                await databases.createDatetimeAttribute(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_EMBEDDING_LOGS, 'timestamp', true);
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                console.log(`Attributes created. Creating index on 'fileid'...`);
                await databases.createIndex(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_EMBEDDING_LOGS, 'idx_fileid', 'key', ['fileid'], ['ASC']);
                console.log(`Appwrite collection "embedding_logs", attributes, and index created successfully.`);
            } else {
                console.error('Error checking/creating Appwrite "embedding_logs" collection:', error);
                throw error;
            }
        }
    } catch (error) {
        console.error('Error ensuring Appwrite log collection setup:', error);
        throw error;
    }
}

// Update functions that query the collection to handle the Appwrite error
async function getProcessedFileStatus(fileId) {
    try {
        // First, make sure fileId is properly formatted as a string
        const fileIdStr = String(fileId);
        
        const response = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            APPWRITE_COLLECTION_ID_EMBEDDING_LOGS,
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
                    APPWRITE_DATABASE_ID, 
                    APPWRITE_COLLECTION_ID_EMBEDDING_LOGS,
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

async function logFileProcessingStatus(fileId, wasSuccessful) {
    try {
        // Ensure fileId is a string
        const fileIdStr = String(fileId);
        
        try {
            const existingDocs = await databases.listDocuments(
                APPWRITE_DATABASE_ID,
                APPWRITE_COLLECTION_ID_EMBEDDING_LOGS,
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
                    APPWRITE_DATABASE_ID,
                    APPWRITE_COLLECTION_ID_EMBEDDING_LOGS,
                    documentId,
                    dataToStore
                );
                console.log(`Updated log for file ID: ${fileId} with status: ${wasSuccessful}`);
            } else {
                await databases.createDocument(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_COLLECTION_ID_EMBEDDING_LOGS,
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
                    APPWRITE_DATABASE_ID,
                    APPWRITE_COLLECTION_ID_EMBEDDING_LOGS,
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


async function processAndStoreEmbedding(fileId, fileName, fileContent) {
    console.log(`Generating embedding for: "${fileName}" (ID: ${fileId})`);
    
    let geminiResponse;
    try {
        geminiResponse = await geminiAI.models.embedContent({
            model: GEMINI_EMBEDDING_MODEL,
            contents: fileContent,
            config: {
                taskType: "RETRIEVAL_DOCUMENT", 
            }
        });
    } catch (error) {
        console.error(`Error generating embedding from Gemini for ${fileName}:`, error);
        await logFileProcessingStatus(fileId, false); // Log failure
        return false;
    }

    if (!geminiResponse || !geminiResponse.embeddings || geminiResponse.embeddings.length === 0) {
        console.error(`Gemini did not return any embeddings for ${fileName}.`);
        await logFileProcessingStatus(fileId, false); // Log failure
        return false;
    }

    const embeddingValues = geminiResponse.embeddings[0]?.values;

    if (!embeddingValues || embeddingValues.length !== VECTOR_DIMENSION) {
        console.error(`Embedding dimension mismatch for ${fileName}. Expected ${VECTOR_DIMENSION}, got ${embeddingValues?.length || 0}`);
        console.warn(`Please ensure your Gemini model ('${GEMINI_EMBEDDING_MODEL}') outputs ${VECTOR_DIMENSION}-dimensional vectors.`);
        await logFileProcessingStatus(fileId, false); // Log failure
        return false;
    }
    console.log(`Embedding generated successfully for ${fileName}.`);

    const qdrantPointId = uuidv4(); // Generate a UUID for Qdrant point ID

    const pointsToUpsert = [
        {
            id: qdrantPointId, 
            vector: embeddingValues,
            payload: { 
                original_text_preview: fileContent.substring(0, 1000) + (fileContent.length > 1000 ? "..." : ""), // Store a longer preview
                source_appwrite_file_id: fileId,
                source_appwrite_file_name: fileName,
                embedded_with_model: GEMINI_EMBEDDING_MODEL,
                qdrant_id: qdrantPointId
            },
        },
    ];

    try {
        console.log(`Upserting point for ${fileName} (Qdrant ID: ${qdrantPointId}) into Qdrant collection "${QDRANT_COLLECTION_NAME}"...`);
        await qdrantClient.upsert(QDRANT_COLLECTION_NAME, {
            wait: true,
            points: pointsToUpsert,
        });
        console.log(`Upsert operation successful for ${fileName}.`);
        return true; 
    } catch (error) {
        console.error(`Error upserting point for ${fileName} to Qdrant:`, error);
        // Don't log Appwrite failure here, as Gemini embedding was successful. 
        // The main loop will still log it as a general processing failure for this file.
        return false;
    }
}

async function getFileContent(fileId, fileName) {
  try {
    console.log(`Fetching content for file: ${fileName} (ID: ${fileId})`);
    const fileDataArrayBuffer = await storage.getFileView(APPWRITE_BUCKET_ID, fileId);
    const textDecoder = new TextDecoder('utf-8'); // Assuming UTF-8 text files
    const fileContentString = textDecoder.decode(fileDataArrayBuffer);
    console.log(`Successfully fetched content for file: ${fileName}`);
    return fileContentString;
  } catch (error) {
    console.error(`Error fetching content for file ${fileName} (ID: ${fileId}):`, error);
    return null;
  }
}

async function processAllAppwriteFiles() {
    console.log("Starting RAG process for Appwrite files...");

    try {
        await ensureQdrantCollection();
        await ensureAppwriteLogCollection(); 

        const appwriteFiles = await storage.listFiles(APPWRITE_BUCKET_ID);
        console.log(`Found ${appwriteFiles.total} files in Appwrite bucket "${APPWRITE_BUCKET_ID}".`);

        if (appwriteFiles.files.length === 0) {
            console.log('No files found in the Appwrite bucket to process.');
            return;
        }

        let successCount = 0;
        let skippedCount = 0;
        let failCount = 0;

        for (const file of appwriteFiles.files) {
            const fileId = file.$id;
            const fileName = file.name;

            console.log(`\n--- Processing file: ${fileName} (ID: ${fileId}) ---`);

            const alreadyProcessedSuccessfully = await getProcessedFileStatus(fileId);
            if (alreadyProcessedSuccessfully) {
                skippedCount++;
                continue;
            }

            const fileContent = await getFileContent(fileId, fileName);
            if (!fileContent) {
                console.warn(`Could not fetch content for ${fileName}. Skipping.`);
                await logFileProcessingStatus(fileId, false); // Log as failed if content fetch fails
                failCount++;
                continue;
            }

            const processingSuccessful = await processAndStoreEmbedding(fileId, fileName, fileContent);

            if (processingSuccessful) {
                await logFileProcessingStatus(fileId, true); // Log success
                successCount++;
            } else {
                // Failure was already logged within processAndStoreEmbedding for Gemini errors,
                // or will be logged here if Qdrant upsert failed *after* Gemini success
                if (!geminiAI) { // A bit of a proxy to see if Gemini part failed earlier
                     await logFileProcessingStatus(fileId, false);
                }
                failCount++;
            }
            
            // Adjust delay as needed based on API rate limits
            console.log("Waiting before next file to avoid rate limits...");
            await new Promise(resolve => setTimeout(resolve, 5000)); // Increased delay
        }
        
        console.log(`\n--- RAG Process Complete ---`);
        console.log(`✅ Successfully processed and embedded: ${successCount} files`);
        console.log(`⏩ Skipped (already processed successfully): ${skippedCount} files`);
        console.log(`❌ Failed to process: ${failCount} files`);
        
    } catch (error) {
        console.error('Error during main Appwrite file processing workflow:', error);
    }
}

// --- Main Execution ---
console.log("Script starting...");
processAllAppwriteFiles().catch(error => {
    console.error("Unhandled Error in Appwrite processing:", error);
});