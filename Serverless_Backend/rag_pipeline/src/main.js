// RAG Pipeline Main Orchestrator - Optimized for 2-File Processing
// Integrates all modular components for processing Appwrite files and creating embeddings

import { CONFIG } from './config.js';
import { 
    ensureAppwriteLogCollection, 
    getProcessedFileStatus, 
    logFileProcessingStatus, 
    getAndParseFileContent,
    getFileContent,
    getAllAppwriteFiles,
    analyzeFileTypes,
    databases,
    Query
} from './appwrite_operations.js';
import { ensureQdrantCollection, upsertVectorToQdrant, getCollectionStats } from './qdrant_operations.js';
import { generateEmbedding, processAndStoreEmbedding, RATE_LIMIT_CONFIG } from './embeddings.js';
import {
    searchSimilarVectors, 
    searchByFileType,
    searchByLanguage,
    searchExcludeChunks,
    searchCodeFunctions,
    getVectorByFileId,
    getAllChunksForFile,
    deleteVectorByFileId,
    getCollectionInfo,
    findSimilarDocuments
} from './qdrant_retrival.js';

// Display configuration info on startup
console.log("✅ Configuration loaded successfully");
console.log(`📊 === RAG Pipeline - 2-File Processing System ===`);
console.log(`- Appwrite Endpoint: ${CONFIG.APPWRITE_ENDPOINT}`);
console.log(`- Qdrant URL: ${CONFIG.QDRANT_URL}`);
console.log(`- Embedding Model: ${CONFIG.GEMINI_EMBEDDING_MODEL}`);
console.log(`- Vector Dimension: ${CONFIG.VECTOR_DIMENSION}`);
console.log(`- Collection Name: ${CONFIG.QDRANT_COLLECTION_NAME}`);
console.log(`- Processing Mode: 2 files per execution`);

// --- Fixed Configuration for 2-File Processing ---
const PROCESSING_CONFIG = {
    FILES_PER_RUN: 2,           // Fixed at 2 files per execution
    PRIORITIZE_FAILED: true,    // Retry failed files first
    INTER_FILE_DELAY: 30000,    // 30 seconds between files (enhanced rate limiting)
    PROGRESS_REPORTING: true,   // Show detailed progress
    BATCH_OPTIMIZATION: true    // Optimize for 2-file batches
};

// --- Core Processing Function ---
async function processAndStoreEmbeddingOriginalStyle(fileId, fileName, fileContent) {
    console.log(`🔄 Generating embedding for: "${fileName}" (ID: ${fileId})`);
    
    try {
        const embeddingValues = await generateEmbedding(fileContent);
        console.log(`✅ Embedding generated successfully for ${fileName}.`);

        const qdrantSuccess = await upsertVectorToQdrant(
            embeddingValues, 
            fileId, 
            fileName, 
            fileContent,
            {
                embedded_with_model: CONFIG.GEMINI_EMBEDDING_MODEL,
                file_type: 'text',
                content_length: fileContent.length,
                processing_timestamp: new Date().toISOString(),
                batch_processing: true
            }
        );

        if (qdrantSuccess) {
            console.log(`✅ Successfully stored ${fileName} in vector database`);
            return true;
        } else {
            console.error(`❌ Failed to store ${fileName} in Qdrant`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error processing embedding for ${fileName}:`, error);
        await logFileProcessingStatus(fileId, false);
        return false;
    }
}

// --- Optimized Queue Analysis for 2-File Processing ---
async function analyzeProcessingQueue(allFiles) {
    console.log(`\n📋 === 2-File Queue Analysis ===`);
    console.log(`🔍 Analyzing ${allFiles.total} total files...`);
    
    const analysis = {
        total: allFiles.total,
        processed: 0,
        failed: 0,
        pending: 0,
        failedFiles: [],
        pendingFiles: [],
        nextBatch: [],
        progressPercent: 0
    };

    try {
        // Batch fetch all processing logs for efficiency
        const response = await databases.listDocuments(
            CONFIG.APPWRITE_DATABASE_ID,
            CONFIG.APPWRITE_COLLECTION_ID_EMBEDDING_LOGS,
            [Query.limit(100)]
        );
        
        const logMap = new Map();
        response.documents.forEach(doc => {
            logMap.set(doc.fileid, doc.status);
        });

        // Categorize files
        for (const file of allFiles.files) {
            const fileId = String(file.$id);
            const status = logMap.get(fileId);
            
            if (status === true) {
                analysis.processed++;
            } else if (status === false) {
                analysis.failed++;
                analysis.failedFiles.push({
                    id: fileId,
                    name: file.name,
                    size: file.sizeOriginal
                });
            } else {
                analysis.pending++;
                analysis.pendingFiles.push({
                    id: fileId,
                    name: file.name,
                    size: file.sizeOriginal
                });
            }
        }

        analysis.progressPercent = ((analysis.processed / analysis.total) * 100).toFixed(1);

        // Select next 2 files for processing
        if (PROCESSING_CONFIG.PRIORITIZE_FAILED && analysis.failedFiles.length > 0) {
            // Take up to 2 failed files first
            analysis.nextBatch = analysis.failedFiles.slice(0, PROCESSING_CONFIG.FILES_PER_RUN);
            console.log(`🔄 Prioritizing ${analysis.nextBatch.length} failed files for retry`);
        }

        // Fill remaining slots with pending files
        const remainingSlots = PROCESSING_CONFIG.FILES_PER_RUN - analysis.nextBatch.length;
        if (remainingSlots > 0 && analysis.pendingFiles.length > 0) {
            const additionalFiles = analysis.pendingFiles.slice(0, remainingSlots);
            analysis.nextBatch.push(...additionalFiles);
            console.log(`📝 Adding ${additionalFiles.length} new files to complete 2-file batch`);
        }

        // Display summary
        console.log(`📊 Queue Analysis Results:`);
        console.log(`   ✅ Processed: ${analysis.processed} files`);
        console.log(`   ❌ Failed: ${analysis.failed} files`);
        console.log(`   ⏳ Pending: ${analysis.pending} files`);
        console.log(`   📈 Progress: ${analysis.progressPercent}%`);
        console.log(`   🎯 Next batch: ${analysis.nextBatch.length} files ready`);

        return analysis;

    } catch (error) {
        console.error('❌ Error analyzing queue:', error);
        
        // Fallback: just take first 2 files
        analysis.nextBatch = allFiles.files.slice(0, PROCESSING_CONFIG.FILES_PER_RUN).map(file => ({
            id: file.$id,
            name: file.name,
            size: file.sizeOriginal
        }));
        
        return analysis;
    }
}

// --- Main 2-File Processing Function ---
async function processTwoFiles() {
    console.log("🚀 Starting 2-File RAG Processing Pipeline...");
    const startTime = Date.now();

    try {
        // Initialize collections
        await ensureQdrantCollection();
        await ensureAppwriteLogCollection();

        // Get all files from Appwrite
        const allFiles = await getAllAppwriteFiles();
        console.log(`📁 Total files in bucket: ${allFiles.total}`);

        if (allFiles.files.length === 0) {
            console.log('❌ No files found in Appwrite bucket');
            return;
        }

        // Analyze queue and select 2 files
        const queueAnalysis = await analyzeProcessingQueue(allFiles);

        if (queueAnalysis.nextBatch.length === 0) {
            if (queueAnalysis.processed === queueAnalysis.total) {
                console.log(`🎉 All ${queueAnalysis.total} files have been processed!`);
            } else {
                console.log(`⏸️ No files ready for processing in this run`);
            }
            return;
        }

        // Process exactly 2 files (or whatever is available)
        const filesToProcess = queueAnalysis.nextBatch.slice(0, PROCESSING_CONFIG.FILES_PER_RUN);
        console.log(`\n🎯 Processing ${filesToProcess.length} files in this 2-file batch:`);
        
        filesToProcess.forEach((file, index) => {
            const sizeKB = (file.size / 1024).toFixed(1);
            console.log(`   ${index + 1}. ${file.name} (${sizeKB} KB)`);
        });

        let successCount = 0;
        let failCount = 0;

        // Process each file in the 2-file batch
        for (let i = 0; i < filesToProcess.length; i++) {
            const fileInfo = filesToProcess[i];
            const fileId = fileInfo.id;
            const fileName = fileInfo.name;

            console.log(`\n--- Processing File ${i + 1}/${filesToProcess.length}: ${fileName} ---`);

            // Get file content with enhanced parsing
            let fileContent;
            let parseResult;
            
            try {
                parseResult = await getAndParseFileContent(fileId, fileName);
                if (parseResult && parseResult.content) {
                    fileContent = parseResult.content;
                    console.log(`📄 Enhanced parsing successful (Type: ${parseResult.metadata.type})`);
                } else {
                    fileContent = await getFileContent(fileId, fileName);
                    console.log(`📄 Basic content retrieval successful`);
                }
            } catch (error) {
                console.error(`❌ Content retrieval failed for ${fileName}:`, error.message);
                await logFileProcessingStatus(fileId, false);
                failCount++;
                continue;
            }

            if (!fileContent) {
                console.warn(`❌ Empty content for ${fileName}, skipping`);
                await logFileProcessingStatus(fileId, false);
                failCount++;
                continue;
            }

            // Process with embeddings
            let success = false;
            try {
                if (parseResult) {
                    success = await processAndStoreEmbedding(fileId, fileName, parseResult);
                } else {
                    success = await processAndStoreEmbeddingOriginalStyle(fileId, fileName, fileContent);
                }
            } catch (error) {
                console.error(`❌ Processing failed for ${fileName}:`, error.message);
                success = false;
            }

            // Log result
            if (success) {
                await logFileProcessingStatus(fileId, true);
                successCount++;
                console.log(`✅ File ${i + 1}/${filesToProcess.length} completed successfully`);
            } else {
                await logFileProcessingStatus(fileId, false);
                failCount++;
                console.log(`❌ File ${i + 1}/${filesToProcess.length} failed`);
            }

            // Inter-file delay (only between files, not after the last one)
            if (i < filesToProcess.length - 1) {
                console.log(`⏳ Waiting ${PROCESSING_CONFIG.INTER_FILE_DELAY / 1000}s before next file...`);
                await new Promise(resolve => setTimeout(resolve, PROCESSING_CONFIG.INTER_FILE_DELAY));
            }
        }

        // Batch completion summary
        const totalTime = Date.now() - startTime;
        console.log(`\n🏁 === 2-File Batch Complete ===`);
        console.log(`✅ Successfully processed: ${successCount} files`);
        console.log(`❌ Failed: ${failCount} files`);
        console.log(`⏱️ Total batch time: ${(totalTime / 1000).toFixed(1)} seconds`);
        console.log(`⚡ Average time per file: ${((totalTime / 1000) / filesToProcess.length).toFixed(1)} seconds`);
        console.log(`🎯 Batch efficiency: ${((successCount / filesToProcess.length) * 100).toFixed(1)}%`);

        // Updated progress
        const updatedAnalysis = await analyzeProcessingQueue(allFiles);
        console.log(`\n📈 === Updated Progress ===`);
        console.log(`🎯 Overall completion: ${updatedAnalysis.progressPercent}% (${updatedAnalysis.processed}/${updatedAnalysis.total})`);
        
        if (updatedAnalysis.pending > 0 || updatedAnalysis.failed > 0) {
            const remaining = updatedAnalysis.pending + updatedAnalysis.failed;
            const estimatedRuns = Math.ceil(remaining / PROCESSING_CONFIG.FILES_PER_RUN);
            console.log(`⏭️ Remaining files: ${remaining}`);
            console.log(`🔄 Estimated 2-file runs needed: ${estimatedRuns}`);
            console.log(`💡 Run the script again to process the next ${Math.min(PROCESSING_CONFIG.FILES_PER_RUN, remaining)} files`);
        } else {
            console.log(`🎉 All files have been processed successfully!`);
        }

        // Collection statistics
        try {
            const stats = await getCollectionStats();
            console.log(`\n🗄️ === Collection Statistics ===`);
            console.log(`📊 Total vectors: ${stats.vectorsCount}`);
            console.log(`📈 Indexed: ${stats.indexedVectorsCount}`);
            console.log(`📁 File types: ${Object.keys(stats.fileTypes).length}`);
        } catch (error) {
            console.warn('Could not fetch collection stats:', error.message);
        }

    } catch (error) {
        console.error('❌ Critical error in 2-file processing pipeline:', error);
    }
}

// --- Utility Functions for 2-File System ---
function getProcessingConfiguration() {
    return { ...PROCESSING_CONFIG };
}

async function testTwoFileSelection() {
    try {
        console.log(`\n🧪 === Testing 2-File Selection ===`);
        
        const allFiles = await getAllAppwriteFiles();
        const analysis = await analyzeProcessingQueue(allFiles);
        
        console.log(`Test Results:`);
        console.log(`- Files available: ${allFiles.total}`);
        console.log(`- Next batch size: ${analysis.nextBatch.length}`);
        console.log(`- Batch files:`, analysis.nextBatch.map(f => f.name));
        
        return analysis;
    } catch (error) {
        console.error('❌ Error testing file selection:', error);
    }
}

// --- Enhanced Testing Functions ---
export async function testVectorSearch(query, limit = 3, options = {}) {
    try {
        console.log(`\n🔍 === Vector Search Test ===`);
        console.log(`Query: "${query}"`);
        console.log(`Limit: ${limit}`);
        
        const results = await searchSimilarVectors(query, limit, options.scoreThreshold || 0.7);
        
        if (results.length === 0) {
            console.log('❌ No similar documents found.');
            return;
        }
        
        console.log(`✅ Found ${results.length} similar documents:`);
        results.forEach((result, index) => {
            console.log(`\n${index + 1}. 📄 ${result.fileName}`);
            console.log(`   🎯 Score: ${result.score.toFixed(4)}`);
            console.log(`   🆔 File ID: ${result.fileId}`);
            console.log(`   📝 Preview: ${result.textPreview?.substring(0, 200)}...`);
        });
        
        return results;
    } catch (error) {
        console.error('❌ Error testing vector search:', error);
    }
}

export async function testSearchByFileType(query, fileType, limit = 3) {
    try {
        console.log(`\n🔍 === File Type Search: ${fileType} ===`);
        const results = await searchByFileType(query, fileType, limit, 0.6);
        
        if (results.length === 0) {
            console.log('❌ No documents found for this file type.');
            return;
        }
        
        console.log(`✅ Found ${results.length} documents of type ${fileType}:`);
        results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.fileName} (Score: ${result.score.toFixed(4)})`);
        });
        
        return results;
    } catch (error) {
        console.error('❌ Error in file type search:', error);
    }
}

export async function testSearchByLanguage(query, language, limit = 3) {
    try {
        console.log(`\n🔍 === Language Search: ${language} ===`);
        const results = await searchByLanguage(query, language, limit, 0.6);
        
        if (results.length === 0) {
            console.log('❌ No documents found for this language.');
            return;
        }
        
        console.log(`✅ Found ${results.length} documents in ${language}:`);
        results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.fileName} (Score: ${result.score.toFixed(4)})`);
        });
        
        return results;
    } catch (error) {
        console.error('❌ Error in language search:', error);
    }
}

export async function testCodeSearch(query, limit = 3) {
    try {
        console.log(`\n🔍 === Code Function Search ===`);
        const results = await searchCodeFunctions(query, limit, 0.6);
        
        if (results.length === 0) {
            console.log('❌ No code functions found.');
            return;
        }
        
        console.log(`✅ Found ${results.length} code functions:`);
        results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.fileName} (Score: ${result.score.toFixed(4)})`);
        });
        
        return results;
    } catch (error) {
        console.error('❌ Error in code search:', error);
    }
}

export async function testSimilarDocuments(fileId, limit = 3) {
    try {
        console.log(`\n🔍 === Similar Documents Test ===`);
        const results = await findSimilarDocuments(fileId, limit, 0.7);
        
        if (results.length === 0) {
            console.log('❌ No similar documents found.');
            return;
        }
        
        console.log(`✅ Found ${results.length} similar documents:`);
        results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.fileName} (Similarity: ${result.similarity.toFixed(4)})`);
        });
        
        return results;
    } catch (error) {
        console.error('❌ Error finding similar documents:', error);
    }
}

export async function analyzePipelinePerformance() {
    try {
        console.log(`\n📊 === 2-File Pipeline Performance ===`);
        
        const stats = await getCollectionStats();
        
        console.log(`Performance Metrics:`);
        console.log(`- Total vectors: ${stats.vectorsCount}`);
        console.log(`- Processing efficiency: 2 files per run`);
        console.log(`- File types: ${Object.keys(stats.fileTypes).length}`);
        console.log(`- Average content length: ${stats.contentStats?.avgContentLength || 'N/A'} chars`);
        
        return stats;
    } catch (error) {
        console.error('❌ Error analyzing performance:', error);
    }
}

// --- Main Execution ---
console.log("🚀 2-File RAG Pipeline Starting...");
processTwoFiles().catch(error => {
    console.error("💥 Critical Error in 2-File Pipeline:", error);
});

// Export main function and utilities
export { 
    processTwoFiles, 
    testTwoFileSelection,
    getProcessingConfiguration
};