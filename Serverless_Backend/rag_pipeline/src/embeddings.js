import { GoogleGenAI } from "@google/genai";
import { CONFIG } from './config.js';
import { upsertVectorToQdrant } from './qdrant_operations.js';
import { logFileProcessingStatus } from './appwrite_operations.js';
import { prepareContentForEmbedding } from './parse_operations.js';

// --- Initialize Gemini Client ---
const geminiAI = new GoogleGenAI({ apiKey: CONFIG.GEMINI_API_KEY });

// Enhanced rate limiting configuration based on API behavior analysis
const RATE_LIMIT_CONFIG = {
    baseDelay: 3000,           // Increased base delay between requests (3 seconds)
    maxRetries: 6,             // Increased maximum retry attempts
    backoffMultiplier: 2,      // Exponential backoff multiplier
    maxBackoffDelay: 60000,    // Increased maximum backoff delay (60 seconds)
    batchDelay: 2500,          // Increased delay between chunks in same file (2.5 seconds)
    fileDelay: 10000,          // Delay between files (10 seconds)
    chunkGroupDelay: 5000,     // Extra delay every 10 chunks (5 seconds)
    aggressiveMode: true,      // Enable aggressive rate limiting after 429 errors
    adaptiveDelays: true       // Enable adaptive delay increases during processing
};

// Global state for adaptive rate limiting
let consecutiveRateLimits = 0;
let lastRateLimitTime = 0;
let adaptiveDelayMultiplier = 1;

// Sleep utility function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Adaptive delay calculation
function getAdaptiveDelay(baseDelay) {
    if (!RATE_LIMIT_CONFIG.adaptiveDelays) return baseDelay;
    
    // Increase delays if we've had recent rate limits
    const timeSinceLastRateLimit = Date.now() - lastRateLimitTime;
    const recentRateLimits = timeSinceLastRateLimit < 60000; // Within last minute
    
    if (recentRateLimits) {
        adaptiveDelayMultiplier = Math.min(adaptiveDelayMultiplier * 1.5, 4); // Max 4x increase
    } else if (timeSinceLastRateLimit > 300000) { // 5 minutes without issues
        adaptiveDelayMultiplier = Math.max(adaptiveDelayMultiplier * 0.9, 1); // Gradually reduce
    }
    
    return Math.round(baseDelay * adaptiveDelayMultiplier);
}

// --- Enhanced Embedding Generation with Aggressive Rate Limiting ---
export async function generateEmbedding(content, retryCount = 0, chunkIndex = 0, totalChunks = 1) {
    // Validate input first
    const validation = validateEmbeddingInput(content);
    if (!validation.isValid) {
        throw new Error(`Invalid embedding input: ${validation.errors.join(', ')}`);
    }

    try {
        console.log(`🔄 Generating embedding (attempt ${retryCount + 1}/${RATE_LIMIT_CONFIG.maxRetries + 1})...`);
        
        // Calculate adaptive delays
        const adaptiveBaseDelay = getAdaptiveDelay(RATE_LIMIT_CONFIG.baseDelay);
        const adaptiveBatchDelay = getAdaptiveDelay(RATE_LIMIT_CONFIG.batchDelay);
        
        // Add enhanced pre-request delay
        if (retryCount === 0) {
            // Base delay between all requests
            await sleep(adaptiveBaseDelay);
            
            // Extra delay every 10 chunks to be more conservative
            if (chunkIndex > 0 && chunkIndex % 10 === 0) {
                console.log(`⏳ Extra cooling period after 10 chunks (${RATE_LIMIT_CONFIG.chunkGroupDelay / 1000}s)...`);
                await sleep(RATE_LIMIT_CONFIG.chunkGroupDelay);
            }
            
            // Show adaptive delay info if enabled
            if (RATE_LIMIT_CONFIG.adaptiveDelays && adaptiveDelayMultiplier > 1) {
                console.log(`📊 Adaptive delay active: ${adaptiveDelayMultiplier.toFixed(1)}x (${adaptiveBaseDelay}ms base delay)`);
            }
        }

        const geminiResponse = await geminiAI.models.embedContent({
            model: CONFIG.GEMINI_EMBEDDING_MODEL,
            contents: content,
            config: {
                taskType: "RETRIEVAL_DOCUMENT", 
            }
        });

        if (!geminiResponse || !geminiResponse.embeddings || geminiResponse.embeddings.length === 0) {
            throw new Error("Gemini did not return any embeddings");
        }

        const embeddingValues = geminiResponse.embeddings[0]?.values;

        if (!embeddingValues || embeddingValues.length !== CONFIG.VECTOR_DIMENSION) {
            throw new Error(`Embedding dimension mismatch. Expected ${CONFIG.VECTOR_DIMENSION}, got ${embeddingValues?.length || 0}`);
        }

        // Reset consecutive rate limits on success
        if (consecutiveRateLimits > 0) {
            console.log(`✅ API calls normalized after ${consecutiveRateLimits} rate limits`);
            consecutiveRateLimits = 0;
        }

        console.log(`✅ Embedding generated successfully (${embeddingValues.length} dimensions)`);
        return embeddingValues;
        
    } catch (error) {
        console.error(`❌ Error generating embedding (attempt ${retryCount + 1}):`, error.message);
        
        // Handle rate limiting errors with enhanced exponential backoff
        if (error.message?.includes('429') || error.message?.includes('Too Many Requests') || 
            error.message?.includes('RESOURCE_EXHAUSTED') || error.cause?.includes('429')) {
            
            // Update rate limit tracking
            consecutiveRateLimits++;
            lastRateLimitTime = Date.now();
            
            if (retryCount < RATE_LIMIT_CONFIG.maxRetries) {
                // Enhanced backoff calculation
                let backoffDelay = RATE_LIMIT_CONFIG.baseDelay * Math.pow(RATE_LIMIT_CONFIG.backoffMultiplier, retryCount);
                
                // Add extra delay for consecutive rate limits
                if (consecutiveRateLimits > 3) {
                    backoffDelay *= (1 + consecutiveRateLimits * 0.5); // Increase delay based on consecutive limits
                }
                
                // Apply adaptive multiplier
                backoffDelay = getAdaptiveDelay(backoffDelay);
                
                // Cap at maximum delay
                backoffDelay = Math.min(backoffDelay, RATE_LIMIT_CONFIG.maxBackoffDelay);
                
                console.log(`⏳ Rate limit hit (${consecutiveRateLimits} consecutive). Waiting ${backoffDelay / 1000}s before retry ${retryCount + 2}/${RATE_LIMIT_CONFIG.maxRetries + 1}...`);
                await sleep(backoffDelay);
                
                return generateEmbedding(content, retryCount + 1, chunkIndex, totalChunks);
            } else {
                throw new Error(`Rate limit exceeded after ${RATE_LIMIT_CONFIG.maxRetries + 1} attempts. API may be overloaded. Please wait longer before retrying.`);
            }
        }
        
        // Handle other API errors
        if (error.message?.includes('INVALID_ARGUMENT')) {
            throw new Error(`Invalid content for embedding: ${error.message}`);
        }
        
        if (error.message?.includes('PERMISSION_DENIED')) {
            throw new Error(`API permission denied. Please check your Gemini API key and permissions.`);
        }
        
        // Re-throw other errors
        throw error;
    }
}

// --- Enhanced Processing Functions with Aggressive Rate Limiting ---
export async function processAndStoreEmbedding(fileId, fileName, parseResult) {
    console.log(`📝 Processing embeddings for: "${fileName}" (ID: ${fileId})`);
    
    try {
        // Prepare content for embedding (handles chunking if needed)
        const embeddingParts = prepareContentForEmbedding(parseResult, {
            includeMetadata: true,
            maxLength: 8000,
            enableChunking: true
        });

        console.log(`📦 Content prepared: ${embeddingParts.length} part(s) for embedding`);
        
        // Show estimated processing time
        const estimatedTime = embeddingParts.length * (RATE_LIMIT_CONFIG.baseDelay + RATE_LIMIT_CONFIG.batchDelay) / 1000;
        console.log(`⏱️ Estimated processing time: ${Math.round(estimatedTime)} seconds (with rate limiting)`);
        
        let successCount = 0;
        let failCount = 0;
        let rateLimitHits = 0;

        // Process each part (chunk) separately with enhanced rate limiting
        for (let i = 0; i < embeddingParts.length; i++) {
            const part = embeddingParts[i];
            
            try {
                console.log(`🔄 Processing part ${i + 1}/${embeddingParts.length} of ${fileName}...`);
                
                // Enhanced delay between chunks
                if (i > 0) {
                    const adaptiveBatchDelay = getAdaptiveDelay(RATE_LIMIT_CONFIG.batchDelay);
                    console.log(`⏳ Waiting ${adaptiveBatchDelay / 1000}s between chunks...`);
                    await sleep(adaptiveBatchDelay);
                }
                
                // Track rate limits for this chunk
                const rateLimitsBefore = consecutiveRateLimits;
                
                // Generate embedding for this part with enhanced retry logic
                const embeddingValues = await generateEmbedding(part.content, 0, i, embeddingParts.length);
                console.log(`✅ Embedding generated for part ${i + 1}/${embeddingParts.length}`);

                // Track if this chunk hit rate limits
                if (consecutiveRateLimits > rateLimitsBefore) {
                    rateLimitHits++;
                }

                // Create a unique identifier for this chunk
                const chunkId = part.metadata.isChunked ? `${fileId}_chunk_${i}` : fileId;
                const chunkFileName = part.metadata.isChunked ? `${fileName} (Part ${i + 1}/${embeddingParts.length})` : fileName;

                // Store embedding in Qdrant
                const qdrantSuccess = await upsertVectorToQdrant(
                    embeddingValues, 
                    chunkId, 
                    chunkFileName, 
                    part.content,
                    {
                        ...part.metadata,
                        processing_timestamp: new Date().toISOString(),
                        retry_count: 0,
                        rate_limit_hits: rateLimitHits
                    }
                );

                if (qdrantSuccess) {
                    successCount++;
                    console.log(`✅ Part ${i + 1}/${embeddingParts.length} stored successfully in Qdrant`);
                } else {
                    failCount++;
                    console.error(`❌ Failed to store part ${i + 1}/${embeddingParts.length} in Qdrant`);
                }

            } catch (error) {
                failCount++;
                console.error(`❌ Error processing part ${i + 1}/${embeddingParts.length} of ${fileName}:`, error.message);
                
                // If it's a persistent rate limit error, we should pause longer before continuing
                if (error.message?.includes('Rate limit exceeded')) {
                    console.error(`🛑 Persistent rate limits detected for ${fileName}. Taking extended break...`);
                    await sleep(60000); // 1 minute pause
                    rateLimitHits++;
                }
            }
        }

        // Determine overall success
        const overallSuccess = successCount > 0 && failCount === 0;
        const partialSuccess = successCount > 0 && failCount > 0;
        
        console.log(`📊 Processing summary for ${fileName}:`);
        console.log(`   ✅ Successful parts: ${successCount}`);
        console.log(`   ❌ Failed parts: ${failCount}`);
        console.log(`   🚦 Rate limit hits: ${rateLimitHits}`);
        console.log(`   📈 Overall status: ${overallSuccess ? 'SUCCESS' : partialSuccess ? 'PARTIAL SUCCESS' : 'FAILED'}`);
        
        // Show adaptive delay status
        if (RATE_LIMIT_CONFIG.adaptiveDelays) {
            console.log(`   🔧 Current delay multiplier: ${adaptiveDelayMultiplier.toFixed(1)}x`);
        }

        return overallSuccess;

    } catch (error) {
        console.error(`❌ Error in processing pipeline for ${fileName}:`, error.message);
        await logFileProcessingStatus(fileId, false);
        return false;
    }
}

// --- Batch Processing Functions with Enhanced Rate Limiting ---
export async function generateEmbeddingBatch(contents) {
    try {
        if (!Array.isArray(contents) || contents.length === 0) {
            throw new Error("Contents array is empty or invalid");
        }

        console.log(`🔄 Generating embeddings for ${contents.length} content items with rate limiting...`);
        
        const embeddings = [];
        const batchSize = 3; // Reduced batch size to be more conservative
        
        for (let i = 0; i < contents.length; i += batchSize) {
            const batch = contents.slice(i, i + batchSize);
            
            console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(contents.length / batchSize)}`);
            
            const batchPromises = batch.map(async (content, index) => {
                try {
                    // Add staggered delay for batch requests
                    await sleep(index * 500); // 500ms stagger between items in batch
                    const embedding = await generateEmbedding(content);
                    return { success: true, embedding, index: i + index };
                } catch (error) {
                    console.error(`Error in batch item ${i + index}:`, error.message);
                    return { success: false, error: error.message, index: i + index };
                }
            });

            const batchResults = await Promise.all(batchPromises);
            embeddings.push(...batchResults);

            // Longer delay between batches
            if (i + batchSize < contents.length) {
                console.log(`⏳ Waiting between batches...`);
                await sleep(RATE_LIMIT_CONFIG.baseDelay * 2);
            }
        }

        const successful = embeddings.filter(r => r.success);
        const failed = embeddings.filter(r => !r.success);
        
        console.log(`📊 Batch processing complete: ${successful.length} successful, ${failed.length} failed`);
        
        return {
            embeddings: successful.map(r => r.embedding),
            errors: failed,
            successRate: (successful.length / contents.length * 100).toFixed(1) + '%'
        };

    } catch (error) {
        console.error('Error in batch embedding generation:', error);
        throw error;
    }
}

// --- Utility Functions ---
export function validateEmbeddingInput(content) {
    const errors = [];
    
    if (!content || typeof content !== 'string') {
        errors.push('Content must be a non-empty string');
    }
    
    if (content && content.trim().length === 0) {
        errors.push('Content cannot be only whitespace');
    }
    
    if (content && content.length > 100000) {
        errors.push('Content is too large (>100KB)');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

export function getEmbeddingStats(embeddingValues) {
    if (!embeddingValues || !Array.isArray(embeddingValues)) {
        return null;
    }
    
    const sum = embeddingValues.reduce((acc, val) => acc + val, 0);
    const mean = sum / embeddingValues.length;
    const variance = embeddingValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / embeddingValues.length;
    
    return {
        dimension: embeddingValues.length,
        mean: mean.toFixed(6),
        variance: variance.toFixed(6),
        standardDeviation: Math.sqrt(variance).toFixed(6),
        min: Math.min(...embeddingValues).toFixed(6),
        max: Math.max(...embeddingValues).toFixed(6)
    };
}

// Export rate limiting configuration for external use
export { RATE_LIMIT_CONFIG };

export { geminiAI }; 