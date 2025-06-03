// main.js
import { GoogleGenerativeAI, TaskType } from "@google/genai"; // Updated import
import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables from .env file
dotenv.config();

// --- Configuration ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

// IMPORTANT: Verify this model name and its output dimension.
// The 'models/' prefix is often required.
// If 'gemini-embedding-exp-03-07' doesn't need 'models/', remove it.
// If this model's dimension is NOT 1024, update VECTOR_DIMENSION.
const GEMINI_EMBEDDING_MODEL_ID = "models/gemini-embedding-exp-03-07"; // Or "models/embedding-001" for 768 dimensions
const VECTOR_DIMENSION = 1024; // MUST match the output dimension of GEMINI_EMBEDDING_MODEL_ID
const COLLECTION_NAME = "gemini_embeddings_v2"; // Changed collection name slightly

// --- Initialize Clients ---
let genAI;
if (GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

const qdrantClient = new QdrantClient({
    url: QDRANT_URL,
    apiKey: QDRANT_API_KEY,
});

// --- Helper Functions ---

async function ensureCollectionExists() {
    try {
        await qdrantClient.getCollection(COLLECTION_NAME);
        console.log(`Collection "${COLLECTION_NAME}" (dim: ${VECTOR_DIMENSION}) already exists.`);
    } catch (error) {
        // @ts-ignore
        if (error.status === 404 || error.message?.includes('Not found')) {
            console.log(`Collection "${COLLECTION_NAME}" does not exist. Creating with dimension ${VECTOR_DIMENSION}...`);
            await qdrantClient.createCollection(COLLECTION_NAME, {
                vectors: {
                    size: VECTOR_DIMENSION,
                    distance: "Cosine",
                },
            });
            console.log(`Collection "${COLLECTION_NAME}" created successfully.`);
        } else {
            console.error(`Error checking/creating collection in Qdrant:`);
            // @ts-ignore
            if (error.data && error.data.status && error.data.status.error) {
                // @ts-ignore
                console.error(error.data.status.error);
            } else {
                console.error(error);
            }
            throw error;
        }
    }
}

async function getGeminiEmbedding(text) {
    if (!genAI) {
        console.error("Error: Gemini AI client is not initialized. Check GEMINI_API_KEY.");
        return null;
    }
    try {
        // Using the direct embedContent method on the genAI instance
        const result = await genAI.embedContent({
            model: GEMINI_EMBEDDING_MODEL_ID,
            content: { parts: [{ text: text }] },
            taskType: TaskType.SEMANTIC_SIMILARITY, // Or RETRIEVAL_DOCUMENT / RETRIEVAL_QUERY as needed
            // If you need to reduce dimensionality (and the model supports it):
            // outputDimensionality: 256,
        });

        const embedding = result.embedding;
        if (embedding && embedding.values) {
            if (embedding.values.length !== VECTOR_DIMENSION) {
                console.warn(
                    `Warning: Gemini embedding dimension (${embedding.values.length}) ` +
                    `does not match Qdrant collection dimension (${VECTOR_DIMENSION}). ` +
                    `This will cause an error during upsert if VECTOR_DIMENSION is not updated.`
                );
            }
            return embedding.values;
        }
        console.error("Gemini API did not return embedding values in the expected structure.");
        return null;
    } catch (error) {
        console.error(`Error generating Gemini embedding for text "${text}":`, error);
        return null;
    }
}

function saveEmbeddingToFile(originalText, embeddingValues) {
    const outputDir = path.join(process.cwd(), 'embeddings_output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = path.join(outputDir, `embedding_${timestamp}.json`);

    try {
        const dataToSave = {
            text: originalText,
            embedding: embeddingValues,
            model: GEMINI_EMBEDDING_MODEL_ID,
            dimension: embeddingValues.length, // Actual dimension of the generated embedding
        };
        fs.writeFileSync(outputPath, JSON.stringify(dataToSave, null, 2));
        console.log(`Embedding (and text) saved to: ${outputPath}`);
    } catch (error) {
        // @ts-ignore
        console.error(`Failed to save embedding to file: ${error.message}`);
    }
}

async function main() {
    if (!GEMINI_API_KEY) {
        console.error("Error: GEMINI_API_KEY environment variable is not set.");
        return;
    }

    await ensureCollectionExists();

    const textsToEmbed = [
        { id: uuidv4(), text: "What is the meaning of life?" },
        { id: uuidv4(), text: "Qdrant is a vector database for AI applications." },
        { id: uuidv4(), text: "The quick brown fox jumps over the lazy dog." }
    ];

    const pointsToUpsert = [];

    for (const item of textsToEmbed) {
        console.log(`\nGenerating embedding for: "${item.text}"`);
        const embeddingValues = await getGeminiEmbedding(item.text);

        if (embeddingValues) {
            console.log(`Generated embedding with dimension: ${embeddingValues.length}.`);
            // saveEmbeddingToFile(item.text, embeddingValues); // Optional: save each embedding

            // Crucial: Ensure the vector length matches Qdrant's collection dimension
            if (embeddingValues.length !== VECTOR_DIMENSION) {
                console.error(
                    `CRITICAL ERROR: Embedding dimension mismatch! Model output: ${embeddingValues.length}, Qdrant expected: ${VECTOR_DIMENSION}. ` +
                    `Skipping upsert for "${item.text}". Please correct VECTOR_DIMENSION.`
                );
                continue; // Skip this point
            }

            pointsToUpsert.push({
                id: item.id,
                vector: embeddingValues,
                payload: {
                    original_text: item.text,
                    source: "gemini_qdrant_script_v2",
                    embedded_at: new Date().toISOString(),
                },
            });
        } else {
            console.warn(`Skipping upsert for "${item.text}" due to embedding generation failure.`);
        }
    }

    if (pointsToUpsert.length > 0) {
        console.log(`\nUpserting ${pointsToUpsert.length} point(s) to Qdrant collection "${COLLECTION_NAME}"...`);
        try {
            const upsertResponse = await qdrantClient.upsert(COLLECTION_NAME, {
                wait: true,
                points: pointsToUpsert,
            });
            console.log("Qdrant upsert response:", JSON.stringify(upsertResponse, null, 2));
            console.log("Successfully embedded and stored points in Qdrant.");
        } catch (error) {
            console.error("Error upserting points to Qdrant:");
             // @ts-ignore
            if (error.data && error.data.status && error.data.status.error) {
                 // @ts-ignore
                console.error("Qdrant API Error:", error.data.status.error);
            } else {
                console.error(error);
            }
        }
    } else {
        console.log("No points were successfully embedded to upsert to Qdrant.");
    }

    if (pointsToUpsert.length > 0) {
        try {
            const pointIdToRetrieve = pointsToUpsert[0].id;
            console.log(`\nRetrieving point with ID ${pointIdToRetrieve} from Qdrant...`);
            const retrievedPoint = await qdrantClient.retrieve(COLLECTION_NAME, {
                ids: [pointIdToRetrieve],
                with_payload: true,
                with_vector: false,
            });
            console.log("Retrieved point:", JSON.stringify(retrievedPoint, null, 2));
        } catch (error) {
            console.error("Error retrieving point from Qdrant:", error);
        }
    }
}

main().catch(error => {
    console.error("Unhandled error in main function:", error);
    process.exit(1);
});