import { QdrantClient } from "@qdrant/js-client-rest";
import { CONFIG } from './config.js';
import { v4 as uuidv4 } from 'uuid';

// --- Initialize Qdrant Client ---
const qdrantClientOptions = { 
    url: CONFIG.QDRANT_URL, 
    apiKey: CONFIG.QDRANT_API_KEY,
    checkCompatibility: false, 
};

if (CONFIG.QDRANT_URL && CONFIG.QDRANT_URL.includes("cloud.qdrant.io") && !CONFIG.QDRANT_URL.match(/:\d+/)) {
    qdrantClientOptions.port = null; 
}

const qdrantClient = new QdrantClient(qdrantClientOptions);
console.log(`Qdrant client initialized. Target: ${CONFIG.QDRANT_URL}, Port: ${qdrantClientOptions.port === null ? 'default HTTPS (443)' : (qdrantClientOptions.port || 'default HTTP (80)')}`);

// --- Qdrant Collection Management ---
export async function ensureQdrantCollection() {
    try {
        const collections = await qdrantClient.getCollections();
        const collectionExists = collections.collections.some(
            (collection) => collection.name === CONFIG.QDRANT_COLLECTION_NAME
        );

        if (!collectionExists) {
            console.log(`Qdrant Collection "${CONFIG.QDRANT_COLLECTION_NAME}" does not exist. Creating it...`);
            await qdrantClient.createCollection(CONFIG.QDRANT_COLLECTION_NAME, {
                vectors: {
                    size: CONFIG.VECTOR_DIMENSION,
                    distance: "Cosine",
                },
            });
            console.log(`Qdrant Collection "${CONFIG.QDRANT_COLLECTION_NAME}" created successfully.`);
        } else {
            console.log(`Qdrant Collection "${CONFIG.QDRANT_COLLECTION_NAME}" already exists.`);
        }
    } catch (error) {
        console.error("Error managing Qdrant collection:", error);
        throw error;
    }
}

// --- Enhanced Vector Operations ---
export async function upsertVectorToQdrant(embeddingValues, fileId, fileName, content, metadata = {}) {
    try {
        const qdrantPointId = uuidv4(); // Generate a UUID for Qdrant point ID

        // Create enhanced payload with parsing metadata
        const payload = {
            // Basic file information
            source_appwrite_file_id: fileId,
            source_appwrite_file_name: fileName,
            qdrant_id: qdrantPointId,
            
            // Content information
            original_text_preview: content.substring(0, 1000) + (content.length > 1000 ? "..." : ""),
            content_length: content.length,
            
            // Embedding information
            embedded_with_model: CONFIG.GEMINI_EMBEDDING_MODEL,
            embedded_at: new Date().toISOString(),
            
            // Parsing metadata
            file_type: metadata.type || 'unknown',
            file_extension: metadata.fileExtension || 'unknown',
            mime_type: metadata.mimeType || 'unknown',
            parsed_at: metadata.parsedAt || new Date().toISOString(),
            
            // Chunking information
            is_chunked: metadata.isChunked || false,
            chunk_index: metadata.chunkIndex || 0,
            total_chunks: metadata.totalChunks || 1,
            
            // Content-specific metadata
            line_count: metadata.lineCount || null,
            word_count: metadata.wordCount || null,
            language: metadata.language || null,
            
            // Additional searchable fields
            searchable_content: content.substring(0, 2000), // First 2KB for quick text search
        };

        // Add specific metadata based on file type
        if (metadata.type === 'code') {
            payload.functions = metadata.functions || [];
            payload.comment_count = metadata.commentCount || 0;
        } else if (metadata.type === 'csv') {
            payload.headers = metadata.headers || [];
            payload.row_count = metadata.rowCount || 0;
            payload.column_count = metadata.columnCount || 0;
        } else if (metadata.type === 'json') {
            payload.json_keys = metadata.keys || [];
            payload.json_structure = metadata.structure || 'unknown';
        }

        const pointsToUpsert = [
            {
                id: qdrantPointId, 
                vector: embeddingValues,
                payload: payload,
            },
        ];

        console.log(`Upserting point for ${fileName} (Qdrant ID: ${qdrantPointId}) into Qdrant collection "${CONFIG.QDRANT_COLLECTION_NAME}"...`);
        await qdrantClient.upsert(CONFIG.QDRANT_COLLECTION_NAME, {
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

// --- Batch Vector Operations ---
export async function upsertVectorBatch(vectorData) {
    try {
        if (!Array.isArray(vectorData) || vectorData.length === 0) {
            throw new Error("Vector data array is empty or invalid");
        }

        console.log(`🔄 Batch upserting ${vectorData.length} vectors...`);
        
        const batchSize = 10; // Adjust based on Qdrant limits
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < vectorData.length; i += batchSize) {
            const batch = vectorData.slice(i, i + batchSize);
            
            try {
                const points = batch.map(data => ({
                    id: uuidv4(),
                    vector: data.embedding,
                    payload: {
                        ...data.metadata,
                        qdrant_id: uuidv4(),
                        embedded_at: new Date().toISOString(),
                    }
                }));

                await qdrantClient.upsert(CONFIG.QDRANT_COLLECTION_NAME, {
                    wait: true,
                    points: points,
                });

                successCount += batch.length;
                console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} completed: ${batch.length} vectors`);

            } catch (error) {
                failCount += batch.length;
                console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, error);
            }

            // Small delay between batches
            if (i + batchSize < vectorData.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        console.log(`📊 Batch upsert complete: ${successCount} successful, ${failCount} failed`);
        return { successCount, failCount };

    } catch (error) {
        console.error('Error in batch vector upsert:', error);
        throw error;
    }
}

// --- Collection Statistics ---
export async function getCollectionStats() {
    try {
        const info = await qdrantClient.getCollection(CONFIG.QDRANT_COLLECTION_NAME);
        
        // Get sample points to analyze metadata
        const sampleResult = await qdrantClient.scroll(CONFIG.QDRANT_COLLECTION_NAME, {
            limit: 100,
            with_payload: true,
        });

        const stats = {
            name: info.name,
            status: info.status,
            vectorsCount: info.vectors_count,
            indexedVectorsCount: info.indexed_vectors_count,
            
            // Analyze file types
            fileTypes: {},
            chunkInfo: {
                chunkedFiles: 0,
                totalChunks: 0,
                avgChunksPerFile: 0
            },
            
            // Content analysis
            contentStats: {
                avgContentLength: 0,
                totalWords: 0,
                languages: {}
            }
        };

        // Analyze sample points
        if (sampleResult.points && sampleResult.points.length > 0) {
            let totalContentLength = 0;
            let totalWords = 0;
            let chunkedFiles = 0;
            let totalChunks = 0;

            sampleResult.points.forEach(point => {
                const payload = point.payload;
                
                // File type analysis
                const fileType = payload.file_type || 'unknown';
                stats.fileTypes[fileType] = (stats.fileTypes[fileType] || 0) + 1;
                
                // Chunk analysis
                if (payload.is_chunked) {
                    chunkedFiles++;
                    totalChunks += payload.total_chunks || 1;
                }
                
                // Content analysis
                if (payload.content_length) {
                    totalContentLength += payload.content_length;
                }
                if (payload.word_count) {
                    totalWords += payload.word_count;
                }
                if (payload.language) {
                    const lang = payload.language;
                    stats.contentStats.languages[lang] = (stats.contentStats.languages[lang] || 0) + 1;
                }
            });

            // Calculate averages
            const sampleSize = sampleResult.points.length;
            stats.chunkInfo.chunkedFiles = chunkedFiles;
            stats.chunkInfo.totalChunks = totalChunks;
            stats.chunkInfo.avgChunksPerFile = chunkedFiles > 0 ? (totalChunks / chunkedFiles).toFixed(2) : 0;
            stats.contentStats.avgContentLength = Math.round(totalContentLength / sampleSize);
            stats.contentStats.totalWords = totalWords;
        }

        return stats;
    } catch (error) {
        console.error('Error getting collection statistics:', error);
        throw error;
    }
}

// --- Vector Search with Enhanced Filters ---
export async function searchVectorsWithFilter(queryVector, options = {}) {
    try {
        const {
            limit = 5,
            scoreThreshold = 0.7,
            fileType = null,
            language = null,
            isChunked = null,
            excludeChunks = false
        } = options;

        // Build filter conditions
        const filterConditions = [];

        if (fileType) {
            filterConditions.push({
                key: "file_type",
                match: { value: fileType }
            });
        }

        if (language) {
            filterConditions.push({
                key: "language",
                match: { value: language }
            });
        }

        if (isChunked !== null) {
            filterConditions.push({
                key: "is_chunked",
                match: { value: isChunked }
            });
        }

        if (excludeChunks) {
            filterConditions.push({
                key: "is_chunked",
                match: { value: false }
            });
        }

        const searchParams = {
            vector: queryVector,
            limit: limit,
            score_threshold: scoreThreshold,
            with_payload: true,
        };

        // Add filter if conditions exist
        if (filterConditions.length > 0) {
            searchParams.filter = {
                must: filterConditions
            };
        }

        const results = await qdrantClient.search(CONFIG.QDRANT_COLLECTION_NAME, searchParams);
        
        return results.map(point => ({
            id: point.id,
            score: point.score,
            payload: point.payload,
            fileId: point.payload?.source_appwrite_file_id,
            fileName: point.payload?.source_appwrite_file_name,
            textPreview: point.payload?.original_text_preview,
            metadata: {
                fileType: point.payload?.file_type,
                language: point.payload?.language,
                isChunked: point.payload?.is_chunked,
                chunkIndex: point.payload?.chunk_index,
                totalChunks: point.payload?.total_chunks
            }
        }));

    } catch (error) {
        console.error('Error in filtered vector search:', error);
        throw error;
    }
}

export { qdrantClient };
