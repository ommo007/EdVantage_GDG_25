import { Client, Storage, Databases } from 'node-appwrite';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from "@google/genai";
import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from 'dotenv';

dotenv.config();

// Appwrite Configuration
const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('683073a1002d010defbb')
    .setSession('');

const storage = new Storage(client);
const databases = new Databases(client);
const bucketId = '6835aad80024a2754e5e';
const databaseId = '68384895000fd2a13f03';
const collectionId = 'embedding_logs';

// Gemini & Qdrant Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const COLLECTION_NAME = "gemini_embeddings_collection2";
const VECTOR_DIMENSION = 3072;

// Initialize Gemini and Qdrant clients
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const qdrantClient = new QdrantClient({ 
    url: QDRANT_URL, 
    apiKey: QDRANT_API_KEY,
    checkCompatibility: false
});

// Ensure collection exists in Qdrant
async function ensureQdrantCollection() {
    try {
        const collections = await qdrantClient.getCollections();
        const collectionExists = collections.collections.some(
            (collection) => collection.name === COLLECTION_NAME
        );

        if (!collectionExists) {
            console.log(`Collection "${COLLECTION_NAME}" does not exist. Creating it...`);
            await qdrantClient.createCollection(COLLECTION_NAME, {
                vectors: {
                    size: VECTOR_DIMENSION,
                    distance: "Cosine",
                },
            });
            console.log(`Collection "${COLLECTION_NAME}" created successfully.`);
        } else {
            console.log(`Collection "${COLLECTION_NAME}" already exists.`);
        }
        return true;
    } catch (error) {
        console.error("Error managing Qdrant collection:", error);
        return false;
    }
}

async function listFiles() {
    try {
        const result = await storage.listFiles(bucketId);
        console.log(`Found ${result.total} files in bucket`);
        return result.files;
    } catch (error) {
        console.error('Error fetching files:', error);
        return [];
    }
}

// Check if a file has already been processed
async function checkFileProcessingStatus(fileId) {
    try {
        const result = await databases.listDocuments(
            databaseId,
            collectionId,
            [
                // Query where fileId matches and check its status
                databases.createQuery().equal('fileid', fileId)
            ]
        );

        if (result.total > 0) {
            // File exists in database
            return result.documents[0].status;
        } else {
            // File doesn't exist in database
            return false;
        }
    } catch (error) {
        console.error(`Error checking file status for ${fileId}:`, error);
        return null; // Return null to indicate error
    }
}

// Update or create document after processing
async function updateFileStatus(fileId, status = true) {
    try {
        // Check if document exists first
        const result = await databases.listDocuments(
            databaseId,
            collectionId,
            [databases.createQuery().equal('fileid', fileId)]
        );

        const timestamp = new Date().toISOString();

        if (result.total > 0) {
            // Document exists, update it
            const docId = result.documents[0].$id;
            await databases.updateDocument(
                databaseId,
                collectionId,
                docId,
                {
                    status: status,
                    timestamp: timestamp
                }
            );
        } else {
            // Document doesn't exist, create it
            await databases.createDocument(
                databaseId,
                collectionId,
                'unique()',
                {
                    fileid: fileId,
                    status: status,
                    timestamp: timestamp
                }
            );
        }
        console.log(`Database updated for file ${fileId}, status: ${status}`);
        return true;
    } catch (error) {
        console.error(`Error updating database for file ${fileId}:`, error);
        return false;
    }
}

async function processFileContent(fileId, fileName, fileContent) {
    try {
        console.log(`Processing file: ${fileName} (ID: ${fileId})`);
        
        // Generate embedding using Gemini
        const geminiResponse = await ai.models.embedContent({
            model: 'gemini-embedding-exp-03-07',
            contents: fileContent,
            config: {
                taskType: "SEMANTIC_SIMILARITY",
            }
        });
        
        if (!geminiResponse || !geminiResponse.embeddings || geminiResponse.embeddings.length === 0) {
            console.error("Gemini did not return any embeddings.");
            return false;
        }

        const embeddingValues = geminiResponse.embeddings[0]?.values;

        if (!embeddingValues || embeddingValues.length !== VECTOR_DIMENSION) {
            console.error(`Embedding dimension mismatch. Expected ${VECTOR_DIMENSION}, got ${embeddingValues?.length || 0}`);
            return false;
        }

        console.log(`Generated embeddings for ${fileName}`);
        
        // Prepare data for Qdrant
        const pointId = fileId.replace(/[^a-zA-Z0-9]/g, ''); // Clean ID for Qdrant
        const pointsToUpsert = [{
            id: pointId,
            vector: embeddingValues,
            payload: { 
                text: fileContent,
                filename: fileName,
                fileId: fileId,
                source: "appwrite_bucket" 
            },
        }];

        // Upsert points into Qdrant
        await qdrantClient.upsert(COLLECTION_NAME, {
            wait: true,
            points: pointsToUpsert,
        });
        
        console.log(`Successfully embedded file: ${fileName}`);
        return true;
    } catch (error) {
        console.error(`Error processing file ${fileName}:`, error);
        return false;
    }
}

async function getFileContent(fileId, fileName) {
    try {
        console.log(`Getting content of file: ${fileName} (ID: ${fileId})`);
        
        // Get file contents as ArrayBuffer
        const fileData = await storage.getFileDownload(bucketId, fileId);
        
        // Convert ArrayBuffer to Buffer
        const buffer = Buffer.from(fileData);
        
        // Convert Buffer to String (assuming text files)
        const content = buffer.toString('utf-8');
        
        return content;
    } catch (error) {
        console.error(`Error getting file content ${fileName}:`, error);
        return null;
    }
}

async function processAllFiles() {
    try {
        // First ensure Qdrant collection exists
        const collectionReady = await ensureQdrantCollection();
        if (!collectionReady) {
            console.error('Failed to setup Qdrant collection. Aborting.');
            return;
        }
        
        // Get all files in the bucket
        const files = await listFiles();
        
        if (files.length === 0) {
            console.log('No files found in the bucket');
            return;
        }
        
        console.log(`Starting processing of ${files.length} files...`);
        
        // Process each file sequentially
        let successCount = 0;
        let skipCount = 0;
        let failCount = 0;
        
        for (const file of files) {
            const fileId = file.$id;
            const fileName = file.name;
            
            // Check if file has already been processed
            const fileStatus = await checkFileProcessingStatus(fileId);
            
            if (fileStatus === true) {
                console.log(`Skipping ${fileName} - already processed`);
                skipCount++;
                continue;
            }
            
            // Get file content
            const fileContent = await getFileContent(fileId, fileName);
            if (!fileContent) {
                console.error(`Failed to get content for ${fileName}`);
                failCount++;
                continue;
            }
            
            // Process file for embeddings
            const success = await processFileContent(fileId, fileName, fileContent);
            
            if (success) {
                // Update database to mark file as processed
                await updateFileStatus(fileId, true);
                successCount++;
            } else {
                failCount++;
            }
            
            // Small delay between requests to prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log(`\nProcessing complete!`);
        console.log(`Successfully processed: ${successCount} files`);
        console.log(`Skipped (already processed): ${skipCount} files`);
        console.log(`Failed: ${failCount} files`);
        
    } catch (error) {
        console.error('Error processing files:', error);
    }
}

// Execute the function to process all files
processAllFiles();
