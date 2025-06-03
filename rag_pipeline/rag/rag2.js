import { Client as AppwriteClient, Storage, Databases, ID, Query } from 'node-appwrite';
import { GoogleGenAI } from "@google/genai";
import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from 'dotenv';
import fs from 'fs';
import crypto from 'crypto'; // Add this import for UUID generation

// Load environment variables from .env file
dotenv.config();

// Check required environment variables before proceeding
const requiredEnvVars = [
  'APPWRITE_ENDPOINT',
  'APPWRITE_PROJECT_ID',
  'APPWRITE_BUCKET_ID',
  'APPWRITE_DATABASE_ID',
  'APPWRITE_COLLECTION_ID_EMBEDDING_LOGS',
  'GEMINI_API_KEY',
  'QDRANT_URL',
  'APPWRITE_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Error: Missing required environment variables:');
  missingEnvVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease check your .env file and ensure all required variables are set.');
  console.error('If you don\'t have a .env file, create one based on .env.example');
  process.exit(1); // Exit with error code
}

// Appwrite Configuration
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const APPWRITE_BUCKET_ID = process.env.APPWRITE_BUCKET_ID;
const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
const APPWRITE_COLLECTION_ID_EMBEDDING_LOGS = process.env.APPWRITE_COLLECTION_ID_EMBEDDING_LOGS;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY; // Server-side API key

// Qdrant Configuration
const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const QDRANT_COLLECTION_NAME = "gemini_embeddings_collection2";
const VECTOR_DIMENSION = 3072; // <<< !!! WARNING: Verify this matches your Gemini model's output !!!

// Gemini Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_EMBEDDING_MODEL = 'gemini-embedding-exp-03-07'; // Or your preferred model
const MAX_RETRIES = 5; // Maximum number of retries for rate limit errors
const INITIAL_RETRY_DELAY_MS = 2000; // Start with 2 second delay

// --- Initialize Appwrite Client ---
const appwriteClient = new AppwriteClient()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

if (APPWRITE_API_KEY) {
    appwriteClient.setKey(APPWRITE_API_KEY); // For server-side operations
    console.log("Appwrite client initialized with API Key.");
} else {
    // .setSession('') is for client-side anonymous or user sessions.
    // For server-to-server, an API key is generally preferred for database operations.
    // If you intend to run this purely client-side with user auth, this is okay for storage.
    // But for database writes (logging), you'll likely need an API key or a function.
    appwriteClient.setSession(''); 
    console.warn("Appwrite client initialized without API Key. Database write operations (logging) might fail without proper permissions or server-side execution with an API key.");
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
        throw error; // Re-throw to stop execution if critical
    }
}

async function ensureAppwriteLogCollection() {
    try {
        await databases.getCollection(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_EMBEDDING_LOGS);
        console.log(`Appwrite collection "embedding_logs" already exists.`);
    } catch (error) {
        if (error.code === 404 || error.message?.includes('Collection not found')) {
            console.log(`Appwrite collection "embedding_logs" does not exist. Creating it...`);
            await databases.createCollection(
                APPWRITE_DATABASE_ID,
                APPWRITE_COLLECTION_ID_EMBEDDING_LOGS,
                "Embedding Logs" // Collection Name
            );
            // Add attributes - important for schema
            await databases.createStringAttribute(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_EMBEDDING_LOGS, 'fileid', 255, true);
            await databases.createBooleanAttribute(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_EMBEDDING_LOGS, 'status', true);
            await databases.createDatetimeAttribute(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_EMBEDDING_LOGS, 'timestamp', true);
            
            // Wait a moment for attribute creation to complete
            console.log("Waiting for attribute creation to complete...");
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Create an index on fileid for faster lookups
            await databases.createIndex(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_EMBEDDING_LOGS, 'idx_fileid', 'key', ['fileid'], ['ASC']);
            console.log(`Appwrite collection "embedding_logs" and attributes created successfully.`);
        } else {
            console.error('Error checking/creating Appwrite "embedding_logs" collection:', error);
            throw error;
        }
    }
}


async function getFileContent(fileId) {
    try {
        console.log(`Fetching content for file ID: ${fileId}`);
        const fileDataArrayBuffer = await storage.getFileView(APPWRITE_BUCKET_ID, fileId);
        const textDecoder = new TextDecoder('utf-8'); // Assuming UTF-8 text files
        const fileContentString = textDecoder.decode(fileDataArrayBuffer);
        console.log(`Successfully fetched content for file ID: ${fileId} (first 100 chars: ${fileContentString.substring(0,100)}...)`);
        return fileContentString;
    } catch (error) {
        console.error(`Error fetching content for file ${fileId}:`, error);
        return null;
    }
}

async function getProcessedFileStatus(fileId) {
    try {
        // Convert fileId to a string to ensure it's properly stored/retrieved
        const response = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            APPWRITE_COLLECTION_ID_EMBEDDING_LOGS,
            [Query.equal('fileid', [fileId]), Query.limit(1)]
        );
        if (response.total > 0 && response.documents[0].status === true) {
            console.log(`File ID ${fileId} already processed.`);
            return true;
        }
        return false;
    } catch (error) {
        if (error.code === 404 || error.message?.includes('Collection not found')) {
            console.warn(`Embedding logs collection not found. Assuming file ${fileId} is not processed.`);
            return false;
        }
        console.error(`Error checking processed status for file ${fileId}:`, error);
        return false; // Treat errors as "not processed" to be safe, or handle more gracefully
    }
}

async function logFileAsProcessed(fileId) {
    try {
        // Check if a document for this fileId already exists to decide between create and update
        const existingDocs = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            APPWRITE_COLLECTION_ID_EMBEDDING_LOGS,
            [Query.equal('fileid', fileId), Query.limit(1)]
        );

        const dataToStore = {
            fileid: fileId,
            status: true,
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
            console.log(`Updated log for processed file ID: ${fileId}`);
        } else {
            await databases.createDocument(
                APPWRITE_DATABASE_ID,
                APPWRITE_COLLECTION_ID_EMBEDDING_LOGS,
                ID.unique(),
                dataToStore
            );
            console.log(`Logged processed file ID: ${fileId}`);
        }
    } catch (error) {
        console.error(`Error logging processed file ${fileId}:`, error);
    }
}


async function processAndStoreEmbedding(fileId, fileName, fileContent) {
    console.log(`Generating embedding for: "${fileName}" (ID: ${fileId})`);
    
    let geminiResponse;
    let retries = 0;
    let retryDelay = INITIAL_RETRY_DELAY_MS;
    let success = false;
    
    while (retries <= MAX_RETRIES && !success) {
        try {
            if (retries > 0) {
                console.log(`Retry attempt ${retries}/${MAX_RETRIES} for ${fileName} after waiting ${retryDelay}ms...`);
            }
            
            geminiResponse = await geminiAI.models.embedContent({
                model: GEMINI_EMBEDDING_MODEL,
                contents: fileContent, // Embed the actual file content
                config: {
                    taskType: "RETRIEVAL_DOCUMENT", // More appropriate for RAG
                }
            });
            
            success = true; // If we get here without error, we succeeded
        } catch (error) {
            if (error.message?.includes("429") || 
                error.message?.includes("Too Many Requests") || 
                error.message?.includes("RESOURCE_EXHAUSTED")) {
                
                retries++;
                if (retries <= MAX_RETRIES) {
                    console.warn(`Rate limit hit for ${fileName}. Retrying in ${retryDelay}ms...`);
                    await sleep(retryDelay);
                    // Exponential backoff with jitter
                    retryDelay = retryDelay * 2 * (0.8 + 0.4 * Math.random());
                } else {
                    console.error(`Maximum retries (${MAX_RETRIES}) exceeded for ${fileName}.`);
                    return false;
                }
            } else {
                console.error(`Error generating embedding from Gemini for ${fileName}:`, error);
                return false;
            }
        }
    }

    if (!geminiResponse || !geminiResponse.embeddings || geminiResponse.embeddings.length === 0) {
        console.error(`Gemini did not return any embeddings for ${fileName}.`);
        return false;
    }

    const embeddingValues = geminiResponse.embeddings[0]?.values;

    if (!embeddingValues || embeddingValues.length !== VECTOR_DIMENSION) {
        console.error(`Embedding dimension mismatch for ${fileName}. Expected ${VECTOR_DIMENSION}, got ${embeddingValues?.length || 0}`);
        console.warn(`Please ensure your Gemini model ('${GEMINI_EMBEDDING_MODEL}') outputs ${VECTOR_DIMENSION}-dimensional vectors.`);
        return false;
    }
    console.log(`Embedding generated successfully for ${fileName}.`);

    // Generate a UUID for Qdrant instead of using the Appwrite fileId
    const qdrantPointId = crypto.randomUUID();
    
    const pointsToUpsert = [
        {
            id: qdrantPointId, // Use UUID for Qdrant
            vector: embeddingValues,
            payload: { 
                original_text_preview: fileContent.substring(0, 500) + (fileContent.length > 500 ? "..." : ""), // Store a preview
                source_appwrite_file_id: fileId, // Keep the original fileId in payload for reference
                source_appwrite_file_name: fileName,
            },
        },
    ];

    try {
        console.log(`Upserting point for ${fileName} into Qdrant collection "${QDRANT_COLLECTION_NAME}" with ID: ${qdrantPointId}...`);
        await qdrantClient.upsert(QDRANT_COLLECTION_NAME, {
            wait: true,
            points: pointsToUpsert,
        });
        console.log(`Upsert operation successful for ${fileName}.`);
        return true;
    } catch (error) {
        console.error(`Error upserting point for ${fileName} to Qdrant:`, error);
        return false;
    }
}

// Helper function for delay with exponential backoff
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function processAllAppwriteFiles() {
    // Ensure critical components are available
    if (!GEMINI_API_KEY || !QDRANT_URL || !APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_BUCKET_ID || !APPWRITE_DATABASE_ID || !APPWRITE_COLLECTION_ID_EMBEDDING_LOGS || (QDRANT_URL.includes("cloud.qdrant.io") && !QDRANT_API_KEY) || (APPWRITE_API_KEY === undefined && !APPWRITE_ENDPOINT.includes("localhost")) ) { // For server-side, API key is usually needed for non-local Appwrite
        console.error("Missing one or more critical environment variables. Please check your .env file.");
        console.log({ GEMINI_API_KEY, QDRANT_URL, APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_BUCKET_ID, APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID_EMBEDDING_LOGS, APPWRITE_API_KEY, QDRANT_API_KEY });
        return;
    }
    
    console.log("Starting RAG process for Appwrite files...");

    try {
        await ensureQdrantCollection();
        await ensureAppwriteLogCollection(); // Ensure log collection exists

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

            const alreadyProcessed = await getProcessedFileStatus(fileId);
            if (alreadyProcessed) {
                skippedCount++;
                continue;
            }

            const fileContent = await getFileContent(fileId);
            if (!fileContent) {
                console.warn(`Could not fetch content for ${fileName}. Skipping.`);
                failCount++;
                continue;
            }

            const processingSuccessful = await processAndStoreEmbedding(fileId, fileName, fileContent);

            if (processingSuccessful) {
                await logFileAsProcessed(fileId);
                successCount++;
            } else {
                failCount++;
            }
            
            // More gentle delay between files to prevent rate limiting
            console.log(`Waiting before processing the next file...`);
            await sleep(3000 + Math.random() * 2000); // 3-5 seconds randomized delay
        }
        
        console.log(`\n--- RAG Process Complete ---`);
        console.log(`Successfully processed and embedded: ${successCount} files`);
        console.log(`Skipped (already processed): ${skippedCount} files`);
        console.log(`Failed to process: ${failCount} files`);
        
    } catch (error) {
        console.error('Error during main Appwrite file processing:', error);
    }
}

// Execute the function
processAllAppwriteFiles().catch(error => {
    console.error("Unhandled Error in Appwrite processing:", error);
});