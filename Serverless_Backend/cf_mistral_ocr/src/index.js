// src/worker.js (Cloudflare Worker)

import { Mistral } from '@mistralai/mistralai';
// IMPORTANT: Switched from 'node-appwrite' to 'appwrite' for Cloudflare Workers compatibility
import { Client as AppwriteClient, Storage as AppwriteStorage, ID as AppwriteID } from 'node-appwrite';
import { InputFile as AppwriteInputFile } from 'node-appwrite/file';

// --- Chunking and Content Processing Functions ---

// --- File Type Detection ---
function getFileType(fileName) {
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    const mimeTypes = {
        '.txt': 'text/plain',
        '.md': 'text/markdown',
        '.json': 'application/json',
        '.js': 'text/javascript',
        '.ts': 'text/typescript',
        '.py': 'text/python',
        '.html': 'text/html',
        '.css': 'text/css',
        '.xml': 'text/xml',
        '.csv': 'text/csv',
        '.log': 'text/plain',
        '.yml': 'text/yaml',
        '.yaml': 'text/yaml',
        '.ini': 'text/plain',
        '.conf': 'text/plain',
        '.cfg': 'text/plain'
    };
    
    return {
        extension,
        mimeType: mimeTypes[extension] || 'application/octet-stream',
        isTextFile: Object.keys(mimeTypes).includes(extension)
    };
}

// --- Content Preprocessing ---
function cleanTextContent(content) {
    if (!content || typeof content !== 'string') {
        return '';
    }
    
    return content
        // Remove excessive whitespace
        .replace(/\s+/g, ' ')
        // Remove control characters except newlines and tabs
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        // Normalize line endings
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Remove excessive newlines
        .replace(/\n{3,}/g, '\n\n')
        // Trim whitespace
        .trim();
}

// --- Text Chunking for Large Documents ---
function chunkText(text, maxChunkSize = 8000, overlapSize = 200) {
    if (!text || text.length <= maxChunkSize) {
        return [text];
    }
    
    const chunks = [];
    let start = 0;
    
    while (start < text.length) {
        let end = start + maxChunkSize;
        
        // If we're not at the end of the text, try to break at a sentence or paragraph
        if (end < text.length) {
            // Try to break at paragraph
            let lastParagraph = text.lastIndexOf('\n\n', end);
            if (lastParagraph > start + maxChunkSize * 0.5) {
                end = lastParagraph + 2;
            } else {
                // Try to break at sentence
                let lastSentence = Math.max(
                    text.lastIndexOf('. ', end),
                    text.lastIndexOf('! ', end),
                    text.lastIndexOf('? ', end)
                );
                if (lastSentence > start + maxChunkSize * 0.5) {
                    end = lastSentence + 2;
                }
            }
        }
        
        chunks.push(text.slice(start, end).trim());
        start = end - overlapSize; // Add overlap between chunks
        
        // Prevent infinite loop
        if (start >= end) {
            start = end;
        }
    }
    
    return chunks.filter(chunk => chunk.length > 0);
}

// --- Markdown Parser ---
function parseMarkdown(content) {
    const cleaned = cleanTextContent(content);
    
    // Extract metadata from frontmatter if present
    let metadata = {};
    let textContent = cleaned;
    
    const frontmatterMatch = cleaned.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (frontmatterMatch) {
        try {
            // Simple YAML-like parsing for frontmatter
            const frontmatter = frontmatterMatch[1];
            frontmatter.split('\n').forEach(line => {
                const colonIndex = line.indexOf(':');
                if (colonIndex > 0) {
                    const key = line.slice(0, colonIndex).trim();
                    const value = line.slice(colonIndex + 1).trim().replace(/^['"]|['"]$/g, '');
                    metadata[key] = value;
                }
            });
            textContent = frontmatterMatch[2];
        } catch (error) {
            console.warn('Error parsing frontmatter:', error);
        }
    }
    
    // Remove markdown syntax but preserve structure
    const plainText = textContent
        // Remove code blocks
        .replace(/```[\s\S]*?```/g, '[CODE_BLOCK]')
        .replace(/`[^`]+`/g, '[INLINE_CODE]')
        // Remove links but keep text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // Remove images
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '[IMAGE: $1]')
        // Remove bold/italic
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        // Convert headers to plain text with structure markers
        .replace(/^#{1,6}\s+(.+)$/gm, '=== $1 ===')
        // Remove horizontal rules
        .replace(/^[-*_]{3,}$/gm, '')
        // Clean up lists
        .replace(/^[-*+]\s+/gm, '• ')
        .replace(/^\d+\.\s+/gm, '• ');
    
    return {
        content: cleanTextContent(plainText),
        metadata,
        originalLength: content.length,
        processedLength: plainText.length
    };
}

// --- Content Preparation for Embedding ---
function prepareContentForEmbedding(parseResult, options = {}) {
    const {
        includeMetadata = true,
        maxLength = 8000,
        enableChunking = true
    } = options;
    
    let content = parseResult.content;
    
    // Add metadata as context if requested
    if (includeMetadata && parseResult.metadata) {
        const metadataText = Object.entries(parseResult.metadata)
            .filter(([key, value]) => typeof value === 'string' || typeof value === 'number')
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        
        if (metadataText) {
            content = `METADATA:\n${metadataText}\n\nCONTENT:\n${content}`;
        }
    }
    
    // Handle long content with chunking
    if (enableChunking && content.length > maxLength) {
        const chunks = chunkText(content, maxLength);
        return chunks.map((chunk, index) => ({
            content: chunk,
            metadata: {
                ...parseResult.metadata,
                chunkIndex: index,
                totalChunks: chunks.length,
                isChunked: true
            }
        }));
    }
    
    return [{
        content,
        metadata: {
            ...parseResult.metadata,
            isChunked: false
        }
    }];
}

// --- Helper: Sanitize Filename ---
function sanitizeFilename(name) {
    if (typeof name !== 'string') name = String(name);
    // Decode URI components first (e.g., %20 to space)
    try {
        name = decodeURIComponent(name);
    } catch (e) {
        // If decoding fails, use the original name
        console.warn(`Could not decode URI component in filename: ${name}. Error: ${e.message}`);
    }
    name = name.replace(/[<>:"/\\|?*]/g, '_'); // Remove forbidden characters
    name = name.replace(/\s+/g, '_');        // Replace spaces with underscores
    name = name.trim('_');                   // Trim leading/trailing underscores
    return name.substring(0, 250);           // Max filename length constraint
}

// --- Helper: Extract and Clean Document URL ---
function extractDocumentUrl(requestPath, log) { // log is console.log
    log(`Original request path: ${requestPath}`);
    
    if (!requestPath || requestPath === '/') {
        return null;
    }
    
    // Remove leading slash
    let cleanPath = requestPath.startsWith('/') ? requestPath.substring(1) : requestPath;
    log(`Path after removing leading slash: ${cleanPath}`);
    
    // Handle URL encoding - decode the path
    try {
        cleanPath = decodeURIComponent(cleanPath);
        log(`Path after decoding: ${cleanPath}`);
    } catch (e) {
        log(`Could not decode path, using as-is: ${e.message}`);
    }
    
    // Check if it's a valid URL
    if (!cleanPath.toLowerCase().startsWith('http://') && !cleanPath.toLowerCase().startsWith('https://')) {
        return null;
    }
    
    // Validate the URL format
    try {
        new URL(cleanPath); // This validates the URL structure
        return cleanPath;
    } catch (e) {
        log(`Invalid URL format: ${cleanPath}. Error: ${e.message}`);
        return null;
    }
}

// --- Helper: Perform OCR ---
async function performOcr(mistralClient, documentUrlToParse, model, log, errorLogger) { // log, errorLogger are console.log, console.error
    try {
        log(`Performing OCR for URL: ${documentUrlToParse} using model: ${model}`);
        
        // Validate URL accessibility before sending to Mistral
        log(`Validating URL accessibility...`);
        try {
            const response = await fetch(documentUrlToParse, { method: 'HEAD' }); // Global fetch in CF Workers
            if (!response.ok) {
                throw new Error(`URL returned status ${response.status}: ${response.statusText}`);
            }
            log(`URL validation successful (${response.status})`);
        } catch (fetchError) {
            errorLogger(`URL validation failed: ${fetchError.message}`);
            throw new Error(`Cannot access document URL: ${fetchError.message}`);
        }
        
        const ocrResponseObject = await mistralClient.ocr.process({
            model: model,
            document: {
                type: "document_url",
                documentUrl: documentUrlToParse,
            },
            // includeImageBase64: false, // Not needed if not processing images
        });
        log("Mistral OCR processing successful.");
        return ocrResponseObject;
    } catch (e) {
        errorLogger(`Error during Mistral OCR API call: Status ${e.status || 'N/A'}, Message: ${e.message}`, e.stack);
        throw new Error(`Mistral OCR failed: ${e.message}`);
    }
}

// --- Cloudflare Worker Entry Point ---
export default {
  async fetch(request, env, ctx) {
    // Use console.log and console.error for logging in Cloudflare Workers
    const log = console.log;
    const errorLogger = console.error;

    // --- 1. Extract Document URL from Path & Validate Method ---
    const requestUrl = new URL(request.url);
    const documentUrlToParse = extractDocumentUrl(requestUrl.pathname, log);
    
    if (!documentUrlToParse) {
        log(`Invalid or missing document URL in path: '${requestUrl.pathname}'. Expected format: '/https://example.com/document.pdf'`);
        return new Response(JSON.stringify({ 
            error: 'Invalid document URL format. Path should be in format: /https://example.com/document.pdf',
            receivedPath: requestUrl.pathname,
            example: '/https://fra.cloud.appwrite.io/v1/storage/buckets/YOUR_BUCKET/files/YOUR_FILE/view?project=YOUR_PROJECT&mode=admin'
        }), { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (request.method !== 'GET') {
        log(`Invalid request method: ${request.method}. Only GET is supported for this endpoint pattern.`);
        return new Response(JSON.stringify({ error: `Method ${request.method} not allowed. Use GET.` }), { 
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    log(`Processing document URL: ${documentUrlToParse}`);

    // --- 2. Initialize Clients (Using env from CFW) ---
    const MISTRAL_API_KEY = env.MISTRAL_API_KEY;
    const MISTRAL_OCR_MODEL = env.MISTRAL_OCR_MODEL || "mistral-ocr-latest";
    const APPWRITE_ENDPOINT = env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
    const APPWRITE_PROJECT_ID = env.APPWRITE_PROJECT_ID;
    const APPWRITE_API_KEY = env.APPWRITE_API_KEY; // Worker's API key for Appwrite
    const APPWRITE_OCR_RESPONSES_BUCKET_ID = env.APPWRITE_OCR_RESPONSES_BUCKET_ID;
    const APPWRITE_MARKDOWN_BUCKET_ID = env.APPWRITE_MARKDOWN_BUCKET_ID;
    const APPWRITE_RAG_BUCKET_ID = env.APPWRITE_RAG_BUCKET_ID;

    const requiredEnvVars = {
        MISTRAL_API_KEY, APPWRITE_PROJECT_ID, APPWRITE_API_KEY,
        APPWRITE_OCR_RESPONSES_BUCKET_ID, APPWRITE_MARKDOWN_BUCKET_ID, APPWRITE_RAG_BUCKET_ID
    };

    for (const [varName, value] of Object.entries(requiredEnvVars)) {
        if (!value) {
            errorLogger(`${varName} not configured in environment variables.`);
            return new Response(JSON.stringify({ error: `Server configuration error: ${varName} missing` }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    const mistralClient = new Mistral({ apiKey: MISTRAL_API_KEY });
    const appwriteClient = new AppwriteClient()
        .setEndpoint(APPWRITE_ENDPOINT)
        .setProject(APPWRITE_PROJECT_ID)
        .setKey(APPWRITE_API_KEY);
    const appwriteStorage = new AppwriteStorage(appwriteClient);

    try {
        // --- 3. Perform OCR ---
        const ocrResponse = await performOcr(mistralClient, documentUrlToParse, MISTRAL_OCR_MODEL, log, errorLogger);

        // --- 4. Extract Markdown ---
        let combinedMarkdownContent = "";
        if (ocrResponse && ocrResponse.pages && Array.isArray(ocrResponse.pages)) {
            ocrResponse.pages.forEach((page, index) => {
                const pageNum = page.index != null ? page.index + 1 : index + 1;
                combinedMarkdownContent += `\n\n---\n\n## Page ${pageNum}\n\n---\n\n`;
                combinedMarkdownContent += (page.markdown || "");
            });
        }
        if (!combinedMarkdownContent.trim()) {
            log("No Markdown content extracted from OCR response. This might be normal for some documents.");
        }

        // --- 5. Process Markdown for Chunking ---
        let ragChunks = [];
        let chunkingMetadata = {};
        
        if (combinedMarkdownContent.trim()) {
            try {
                log("Processing markdown content for RAG chunking...");
                
                // Parse the markdown content
                const parseResult = parseMarkdown(combinedMarkdownContent);
                
                // Prepare content for embedding with chunking
                const embeddingChunks = prepareContentForEmbedding(parseResult, {
                    includeMetadata: true,
                    maxLength: 8000,
                    enableChunking: true
                });
                
                ragChunks = embeddingChunks;
                chunkingMetadata = {
                    totalChunks: ragChunks.length,
                    originalLength: parseResult.originalLength,
                    processedLength: parseResult.processedLength,
                    chunkingEnabled: ragChunks.length > 1
                };
                
                log(`Created ${ragChunks.length} RAG chunks from markdown content`);
            } catch (chunkingError) {
                errorLogger(`Error during chunking process: ${chunkingError.message}`);
                // Continue without chunking if there's an error
                chunkingMetadata = { error: chunkingError.message };
            }
        }

        // --- 6. Respond to Client with JSON Format but Markdown Content ---
        log("Sending JSON response with markdown content to client.");
        const clientResponse = new Response(JSON.stringify({
            success: true,
            message: 'OCR processing complete. Files are being uploaded to storage in the background.',
            data: {
                sourceDocumentUrl: documentUrlToParse,
                ocrModel: MISTRAL_OCR_MODEL,
                processedAt: new Date().toISOString(),
                markdownContent: combinedMarkdownContent,
                contentMetadata: {
                    contentLength: combinedMarkdownContent.length,
                    pageCount: ocrResponse?.pages?.length || 0,
                    ...chunkingMetadata
                }
            }
        }, null, 2), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

        // --- 7. Perform Appwrite Uploads in the Background (using ctx.waitUntil) ---
        const backgroundTasks = async () => {
            try {
                log("Background: Starting uploads to Appwrite Storage.");
                const timestamp = Date.now();
                
                let originalFileName = 'document'; // Default
                try {
                    const urlObject = new URL(documentUrlToParse); // documentUrlToParse is already validated
                    const pathParts = urlObject.pathname.split('/');
                    originalFileName = pathParts.pop() || 'document';
                } catch (urlParseError) {
                    // This catch block might be less likely to hit if documentUrlToParse is already validated.
                    errorLogger(`Background: Could not parse documentUrlToParse to extract original filename: ${documentUrlToParse}. Using default. Error: ${urlParseError.message}`);
                    const pathParts = documentUrlToParse.split('/'); // Fallback for non-standard URL paths
                    originalFileName = pathParts.pop() || 'document';
                }
                
                const sanitizedOriginalFileName = sanitizeFilename(originalFileName.split('?')[0]); // Remove query params
                const baseFileName = `${sanitizedOriginalFileName}_${timestamp}`;

                const uploadPromises = [];

                // Upload raw Mistral OCR JSON response
                if (ocrResponse) { 
                    const ocrJsonFileName = `${baseFileName}_ocr_response.json`;
                    log(`Background: Preparing raw OCR JSON '${ocrJsonFileName}' for bucket ${APPWRITE_OCR_RESPONSES_BUCKET_ID}`);
                    let jsonStringToUpload;
                    // Check for Pydantic-like serialization methods, fallback to standard JSON.stringify
                    if (typeof ocrResponse.model_dump_json === 'function') {
                        jsonStringToUpload = ocrResponse.model_dump_json(null, 2);
                    } else if (typeof ocrResponse.model_dump === 'function') {
                        jsonStringToUpload = JSON.stringify(ocrResponse.model_dump(), null, 2);
                    } else {
                        jsonStringToUpload = JSON.stringify(ocrResponse, null, 2);
                    }
                    uploadPromises.push(
                        appwriteStorage.createFile(
                            APPWRITE_OCR_RESPONSES_BUCKET_ID,
                            AppwriteID.unique(),
                            AppwriteInputFile.fromPlainText(jsonStringToUpload, ocrJsonFileName, 'application/json') // Added MIME type
                        ).then(file => log(`Background: Raw OCR JSON uploaded with ID: ${file.$id}`))
                         .catch(e => errorLogger(`Background: Failed to upload OCR JSON: ${e.message}`, e))
                    );
                } else {
                    log("Background: Skipping OCR JSON upload as ocrResponse is not available.");
                }

                // Upload concatenated Markdown (if content exists)
                if (combinedMarkdownContent.trim()) {
                    const markdownFileName = `${baseFileName}_full_document.md`;
                    log(`Background: Preparing combined Markdown '${markdownFileName}' for bucket ${APPWRITE_MARKDOWN_BUCKET_ID}`);
                    uploadPromises.push(
                        appwriteStorage.createFile(
                            APPWRITE_MARKDOWN_BUCKET_ID,
                            AppwriteID.unique(),
                            AppwriteInputFile.fromPlainText(combinedMarkdownContent, markdownFileName, 'text/markdown; charset=utf-8') // Added MIME type
                        ).then(file => log(`Background: Combined Markdown uploaded with ID: ${file.$id}`))
                         .catch(e => errorLogger(`Background: Failed to upload Markdown file: ${e.message}`, e))
                    );
                } else {
                    log("Background: Skipping Markdown file upload as content is empty.");
                }

                // Upload RAG chunks (if any exist)
                if (ragChunks.length > 0) {
                    log(`Background: Preparing ${ragChunks.length} RAG chunks for bucket ${APPWRITE_RAG_BUCKET_ID}`);
                    
                    ragChunks.forEach((chunk, index) => {
                        const chunkFileName = `${baseFileName}_chunk_${String(index + 1).padStart(3, '0')}.json`;
                        const chunkData = {
                            sourceDocument: documentUrlToParse,
                            originalFilename: sanitizedOriginalFileName,
                            chunkIndex: index,
                            totalChunks: ragChunks.length,
                            content: chunk.content,
                            metadata: chunk.metadata,
                            createdAt: new Date().toISOString(),
                            documentId: baseFileName
                        };
                        
                        uploadPromises.push(
                            appwriteStorage.createFile(
                                APPWRITE_RAG_BUCKET_ID,
                                AppwriteID.unique(),
                                AppwriteInputFile.fromPlainText(
                                    JSON.stringify(chunkData, null, 2), 
                                    chunkFileName, 
                                    'application/json'
                                )
                            ).then(file => log(`Background: RAG chunk ${index + 1}/${ragChunks.length} uploaded with ID: ${file.$id}`))
                             .catch(e => errorLogger(`Background: Failed to upload RAG chunk ${index + 1}: ${e.message}`, e))
                        );
                    });
                } else {
                    log("Background: No RAG chunks to upload.");
                }

                if (uploadPromises.length > 0) {
                    await Promise.all(uploadPromises);
                    log("Background: All Appwrite storage operations completed.");
                } else {
                    log("Background: No files to upload to Appwrite storage.");
                }

            } catch (uploadError) {
                errorLogger(`Background: Error during asynchronous upload process: ${uploadError.message}`, uploadError.stack);
            }
        };

        ctx.waitUntil(backgroundTasks());

        return clientResponse; // Return response to client immediately

    } catch (err) { // Catch errors from OCR or initial setup before response is sent
        errorLogger(`Error in main handler (before or during OCR): ${err.message}`, err.stack);
        // Check if response has already been constructed or sent is not strictly needed here as construction is later
        return new Response(JSON.stringify({
            success: false,
            error: `Processing failed: ${err.message}`,
            data: {
                sourceDocumentUrl: documentUrlToParse, // Provide context
                processedAt: new Date().toISOString()
            }
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
  },
};