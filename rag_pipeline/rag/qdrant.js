import { GoogleGenAI } from "@google/genai";
import { QdrantClient } from "@qdrant/js-client-rest"; // Import Qdrant client
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333"; // Default for local Qdrant
const QDRANT_API_KEY = process.env.QDRANT_API_KEY; // Optional, for Qdrant Cloud or secured instances

// Load environment variables from .env file

const COLLECTION_NAME = "gemini_embeddings_collection2";
// The embedding dimension for 'gemini-embedding-exp-03-07' is 1024.
// It's crucial this matches the output of your embedding model.
const VECTOR_DIMENSION = 3072; 

async function main() {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
        console.error("Error: GEMINI_API_KEY environment variable is not set");
        console.log("Please create a .env file with your GEMINI_API_KEY or set it in your environment");
        return;
    }

    // ---------------- Initialize Gemini Client ----------------
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    // ---------------- Initialize Qdrant Client ----------------
    // Check if using cloud URL and avoid adding port number
    const qdrantClient = new QdrantClient({ 
        url: QDRANT_URL, 
        apiKey: QDRANT_API_KEY,
        checkCompatibility: false
    });
    
    console.log(`Connecting to Qdrant at: ${QDRANT_URL}`);
    console.log("Qdrant client initialized.");
    // ---------------- 1. Ensure Qdrant Collection Exists ----------------
    try {
        const collections = await qdrantClient.getCollections();
        const collectionExists = collections.collections.some(
            (collection) => collection.name === COLLECTION_NAME
        );

        if (!collectionExists) {
            console.log(`Collection "${COLLECTION_NAME}" does not exist. Creating it...`);
            await qdrantClient.createCollection(COLLECTION_NAME, {
                vectors: {
                    size: VECTOR_DIMENSION, // Dimension of vectors from your Gemini model
                    distance: "Cosine",     // Or "Dot", "Euclid" depending on your preference/embeddings
                },
            });
            console.log(`Collection "${COLLECTION_NAME}" created successfully.`);
        } else {
            console.log(`Collection "${COLLECTION_NAME}" already exists.`);
        }
    } catch (error) {
        console.error("Error managing Qdrant collection:", error);
        return; // Stop if we can't ensure collection exists
    }
    
    // ---------------- 2. Generate Embedding with Gemini ----------------
    const textToEmbed = "What is the meaning of life?";
    console.log(`Generating embedding for: "${textToEmbed}"`);
    
    let geminiResponse;
    try {
        geminiResponse = await ai.models.embedContent({
            model: 'gemini-embedding-exp-03-07', // Ensure this model outputs 1024-dim vectors
            contents: textToEmbed,
            config: {
                taskType: "SEMANTIC_SIMILARITY",
            }
        });
    } catch (error) {
        console.error("Error generating embedding from Gemini:", error);
        return;
    }

    if (!geminiResponse || !geminiResponse.embeddings || geminiResponse.embeddings.length === 0) {
        console.error("Gemini did not return any embeddings.");
        return;
    }

    const embeddingValues = geminiResponse.embeddings[0]?.values;

    if (!embeddingValues || embeddingValues.length !== VECTOR_DIMENSION) {
        console.error(`Embedding dimension mismatch. Expected ${VECTOR_DIMENSION}, got ${embeddingValues?.length || 0}`);
        return;
    }

    console.log("Embedding generated successfully.");
    // console.log("Embedding values:", embeddingValues.slice(0, 5), "..."); // Log first 5 for brevity

    // ---------------- 3. Prepare data for Qdrant ----------------
    const pointsToUpsert = [
        {
            id: 1, // You'll need a strategy for unique IDs in a real application
            vector: embeddingValues,
            payload: { 
                text: textToEmbed,
                source: "example_document_1" 
                // Add any other metadata you want to store and filter on
            },
        },
        // You can add more points here if you embed multiple texts
    ];

    // ---------------- 4. Upsert (Insert/Update) Points into Qdrant ----------------
    try {
        console.log(`Upserting ${pointsToUpsert.length} point(s) into Qdrant collection "${COLLECTION_NAME}"...`);
        const upsertResult = await qdrantClient.upsert(COLLECTION_NAME, {
            wait: true, // Wait for the operation to complete
            points: pointsToUpsert,
        });
        console.log("Upsert operation successful:", upsertResult);

        // Optional: Verify the point was inserted
        const retrievedPoints = await qdrantClient.retrieve(COLLECTION_NAME, {
            ids: [1],
            with_payload: true,
            with_vector: false // Typically don't need the vector back on retrieve unless debugging
        });
        console.log("Retrieved point (for verification):", retrievedPoints);

    } catch (error) {
        console.error("Error upserting points to Qdrant:", error);
    }

    // --------------- (Optional) Save embeddings to file (your original code) ---------------
    const outputDir = './embeddings_output'; // Changed path to be relative for easier execution
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = `${outputDir}/embedding_${timestamp}.json`;
    
    try {
        fs.writeFileSync(outputPath, JSON.stringify(geminiResponse.embeddings, null, 2));
        console.log(`Gemini embeddings saved to: ${outputPath}`);
    } catch (error) {
        console.error(`Failed to save Gemini embeddings: ${error.message}`);
    }
}

main().catch(error => {
    console.error("Unhandled Error in main:", error);
});