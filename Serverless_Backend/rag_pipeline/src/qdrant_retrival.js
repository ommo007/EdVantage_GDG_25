import { qdrantClient, searchVectorsWithFilter } from './qdrant_operations.js';
import { CONFIG } from './config.js';
import { generateEmbedding } from './embeddings.js';

// --- Enhanced Vector Search Functions ---
export async function searchSimilarVectors(query, limit = 5, scoreThreshold = 0.7, filters = {}) {
    try {
        console.log(`🔍 Searching for similar vectors with query: "${query}"`);
        
        // Generate embedding for the query
        const queryEmbedding = await generateEmbedding(query);
        
        // Use enhanced search with filters if provided
        if (Object.keys(filters).length > 0) {
            console.log(`🎯 Applying filters:`, filters);
            const results = await searchVectorsWithFilter(queryEmbedding, {
                limit,
                scoreThreshold,
                ...filters
            });
            console.log(`✅ Found ${results.length} filtered results`);
            return results;
        }
        
        // Standard search without filters
        const searchResult = await qdrantClient.search(CONFIG.QDRANT_COLLECTION_NAME, {
            vector: queryEmbedding,
            limit: limit,
            score_threshold: scoreThreshold,
            with_payload: true,
        });

        console.log(`✅ Found ${searchResult.length} similar vectors`);
        
        return searchResult.map(point => ({
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
                totalChunks: point.payload?.total_chunks,
                contentLength: point.payload?.content_length,
                wordCount: point.payload?.word_count
            }
        }));
        
    } catch (error) {
        console.error('❌ Error searching similar vectors:', error);
        throw error;
    }
}

// --- Specialized Search Functions ---
export async function searchByFileType(query, fileType, limit = 5, scoreThreshold = 0.7) {
    try {
        console.log(`🔍 Searching in ${fileType} files for: "${query}"`);
        
        return await searchSimilarVectors(query, limit, scoreThreshold, {
            fileType: fileType
        });
    } catch (error) {
        console.error(`❌ Error searching by file type ${fileType}:`, error);
        throw error;
    }
}

export async function searchByLanguage(query, language, limit = 5, scoreThreshold = 0.7) {
    try {
        console.log(`🔍 Searching in ${language} files for: "${query}"`);
        
        return await searchSimilarVectors(query, limit, scoreThreshold, {
            language: language
        });
    } catch (error) {
        console.error(`❌ Error searching by language ${language}:`, error);
        throw error;
    }
}

export async function searchExcludeChunks(query, limit = 5, scoreThreshold = 0.7) {
    try {
        console.log(`🔍 Searching full documents (excluding chunks) for: "${query}"`);
        
        return await searchSimilarVectors(query, limit, scoreThreshold, {
            excludeChunks: true
        });
    } catch (error) {
        console.error('❌ Error searching excluding chunks:', error);
        throw error;
    }
}

export async function searchCodeFunctions(query, limit = 5, scoreThreshold = 0.6) {
    try {
        console.log(`🔍 Searching for code functions: "${query}"`);
        
        const results = await searchSimilarVectors(query, limit, scoreThreshold, {
            fileType: 'code'
        });
        
        // Filter results that have function information
        return results.filter(result => 
            result.payload?.functions && result.payload.functions.length > 0
        );
    } catch (error) {
        console.error('❌ Error searching code functions:', error);
        throw error;
    }
}

// --- Advanced Retrieval Functions ---
export async function getVectorByFileId(fileId) {
    try {
        console.log(`🔍 Searching for vector with file ID: ${fileId}`);
        
        const searchResult = await qdrantClient.scroll(CONFIG.QDRANT_COLLECTION_NAME, {
            filter: {
                must: [
                    {
                        key: "source_appwrite_file_id",
                        match: {
                            value: fileId
                        }
                    }
                ]
            },
            limit: 1,
            with_payload: true,
            with_vector: true,
        });

        if (searchResult.points && searchResult.points.length > 0) {
            const point = searchResult.points[0];
            return {
                id: point.id,
                vector: point.vector,
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
            };
        }
        
        return null;
    } catch (error) {
        console.error(`❌ Error getting vector by file ID ${fileId}:`, error);
        throw error;
    }
}

export async function getAllChunksForFile(fileId) {
    try {
        console.log(`🔍 Getting all chunks for file ID: ${fileId}`);
        
        const searchResult = await qdrantClient.scroll(CONFIG.QDRANT_COLLECTION_NAME, {
            filter: {
                should: [
                    // Original file
                    {
                        key: "source_appwrite_file_id",
                        match: { value: fileId }
                    },
                    // Chunks of the file
                    {
                        key: "source_appwrite_file_id",
                        match: { value: `${fileId}_chunk_` }
                    }
                ]
            },
            limit: 100,
            with_payload: true,
        });

        if (searchResult.points && searchResult.points.length > 0) {
            return searchResult.points.map(point => ({
                id: point.id,
                payload: point.payload,
                fileId: point.payload?.source_appwrite_file_id,
                fileName: point.payload?.source_appwrite_file_name,
                textPreview: point.payload?.original_text_preview,
                chunkIndex: point.payload?.chunk_index || 0,
                totalChunks: point.payload?.total_chunks || 1,
                isChunked: point.payload?.is_chunked || false
            })).sort((a, b) => a.chunkIndex - b.chunkIndex);
        }
        
        return [];
    } catch (error) {
        console.error(`❌ Error getting chunks for file ID ${fileId}:`, error);
        throw error;
    }
}

// --- Vector Management Functions ---
export async function deleteVectorByFileId(fileId) {
    try {
        console.log(`🗑️ Deleting vector with file ID: ${fileId}`);
        
        // Get all chunks for this file
        const chunks = await getAllChunksForFile(fileId);
        
        if (chunks.length === 0) {
            console.log(`❌ No vectors found for file ID: ${fileId}`);
            return false;
        }
        
        // Delete all chunks
        const pointIds = chunks.map(chunk => chunk.id);
        await qdrantClient.delete(CONFIG.QDRANT_COLLECTION_NAME, {
            points: pointIds
        });
        
        console.log(`✅ Successfully deleted ${pointIds.length} vector(s) for file ID: ${fileId}`);
        return true;
    } catch (error) {
        console.error(`❌ Error deleting vector by file ID ${fileId}:`, error);
        throw error;
    }
}

// --- Collection Information ---
export async function getCollectionInfo() {
    try {
        const info = await qdrantClient.getCollection(CONFIG.QDRANT_COLLECTION_NAME);
        return {
            name: info.name,
            status: info.status,
            vectorsCount: info.vectors_count,
            indexedVectorsCount: info.indexed_vectors_count,
            payloadSchemaCount: info.payload_schema ? Object.keys(info.payload_schema).length : 0,
        };
    } catch (error) {
        console.error('❌ Error getting collection info:', error);
        throw error;
    }
}

// --- Semantic Search Utilities ---
export async function findSimilarDocuments(fileId, limit = 5, scoreThreshold = 0.8) {
    try {
        console.log(`🔍 Finding documents similar to file ID: ${fileId}`);
        
        // Get the vector for the given file
        const sourceVector = await getVectorByFileId(fileId);
        if (!sourceVector) {
            throw new Error(`File ID ${fileId} not found in vector database`);
        }
        
        // Search for similar vectors
        const searchResult = await qdrantClient.search(CONFIG.QDRANT_COLLECTION_NAME, {
            vector: sourceVector.vector,
            limit: limit + 1, // +1 to account for the source document itself
            score_threshold: scoreThreshold,
            with_payload: true,
            filter: {
                must_not: [
                    {
                        key: "source_appwrite_file_id",
                        match: { value: fileId }
                    }
                ]
            }
        });

        console.log(`✅ Found ${searchResult.length} similar documents`);
        
        return searchResult.map(point => ({
            id: point.id,
            score: point.score,
            payload: point.payload,
            fileId: point.payload?.source_appwrite_file_id,
            fileName: point.payload?.source_appwrite_file_name,
            textPreview: point.payload?.original_text_preview,
            similarity: point.score
        }));
    } catch (error) {
        console.error(`❌ Error finding similar documents for ${fileId}:`, error);
        throw error;
    }
}

// --- Export all functions ---
// Note: All functions are already exported as named exports above
