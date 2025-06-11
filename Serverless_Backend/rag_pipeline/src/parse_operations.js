import path from 'path';

// --- File Type Detection ---
export function getFileType(fileName) {
    const extension = path.extname(fileName).toLowerCase();
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
export function cleanTextContent(content) {
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
export function chunkText(text, maxChunkSize = 8000, overlapSize = 200) {
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
export function parseMarkdown(content) {
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

// --- JSON Parser ---
export function parseJSON(content) {
    try {
        const jsonData = JSON.parse(content);
        
        // Convert JSON to searchable text
        const extractTextFromObject = (obj, path = '') => {
            let texts = [];
            
            for (const [key, value] of Object.entries(obj)) {
                const currentPath = path ? `${path}.${key}` : key;
                
                if (typeof value === 'string') {
                    texts.push(`${currentPath}: ${value}`);
                } else if (typeof value === 'number' || typeof value === 'boolean') {
                    texts.push(`${currentPath}: ${value}`);
                } else if (Array.isArray(value)) {
                    value.forEach((item, index) => {
                        if (typeof item === 'object' && item !== null) {
                            texts.push(...extractTextFromObject(item, `${currentPath}[${index}]`));
                        } else {
                            texts.push(`${currentPath}[${index}]: ${item}`);
                        }
                    });
                } else if (typeof value === 'object' && value !== null) {
                    texts.push(...extractTextFromObject(value, currentPath));
                }
            }
            
            return texts;
        };
        
        const extractedTexts = extractTextFromObject(jsonData);
        const textContent = extractedTexts.join('\n');
        
        return {
            content: cleanTextContent(textContent),
            metadata: {
                type: 'json',
                keys: Object.keys(jsonData),
                structure: typeof jsonData === 'object' ? 'object' : Array.isArray(jsonData) ? 'array' : 'primitive'
            },
            originalData: jsonData,
            originalLength: content.length,
            processedLength: textContent.length
        };
    } catch (error) {
        console.warn('Error parsing JSON, treating as plain text:', error.message);
        return parseTextFile(content);
    }
}

// --- Code File Parser ---
export function parseCodeFile(content, extension) {
    const cleaned = cleanTextContent(content);
    
    // Extract comments and docstrings which are usually more descriptive
    let comments = [];
    let codeStructure = [];
    
    // Language-specific comment extraction
    const commentPatterns = {
        '.js': [/\/\*[\s\S]*?\*\//g, /\/\/.*$/gm],
        '.ts': [/\/\*[\s\S]*?\*\//g, /\/\/.*$/gm],
        '.py': [/"""[\s\S]*?"""/g, /#.*$/gm],
        '.html': [/<!--[\s\S]*?-->/g],
        '.css': [/\/\*[\s\S]*?\*\//g]
    };
    
    const patterns = commentPatterns[extension] || [];
    patterns.forEach(pattern => {
        const matches = cleaned.match(pattern);
        if (matches) {
            comments.push(...matches);
        }
    });
    
    // Extract function/class names for structure
    const structurePatterns = {
        '.js': [/(?:function|class|const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g],
        '.ts': [/(?:function|class|interface|type|const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g],
        '.py': [/(?:def|class)\s+([a-zA-Z_][a-zA-Z0-9_]*)/g]
    };
    
    const structPatterns = structurePatterns[extension] || [];
    structPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(cleaned)) !== null) {
            codeStructure.push(match[1]);
        }
    });
    
    // Combine comments and structure info
    const commentText = comments.map(c => c.replace(/\/\*|\*\/|\/\/|#|<!--?|-->/g, '').trim()).join('\n');
    const structureText = codeStructure.length > 0 ? `Functions/Classes: ${codeStructure.join(', ')}` : '';
    
    const processedContent = [commentText, structureText, cleaned].filter(Boolean).join('\n\n');
    
    return {
        content: cleanTextContent(processedContent),
        metadata: {
            type: 'code',
            language: extension.slice(1),
            functions: codeStructure,
            commentCount: comments.length
        },
        originalLength: content.length,
        processedLength: processedContent.length
    };
}

// --- Plain Text Parser ---
export function parseTextFile(content) {
    const cleaned = cleanTextContent(content);
    
    return {
        content: cleaned,
        metadata: {
            type: 'text',
            lineCount: cleaned.split('\n').length,
            wordCount: cleaned.split(/\s+/).filter(word => word.length > 0).length
        },
        originalLength: content.length,
        processedLength: cleaned.length
    };
}

// --- CSV Parser ---
export function parseCSV(content) {
    const lines = content.trim().split('\n');
    if (lines.length === 0) return parseTextFile(content);
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1);
    
    // Convert CSV to searchable text
    const textContent = [
        `CSV Headers: ${headers.join(', ')}`,
        ...rows.slice(0, 100).map((row, index) => { // Limit to first 100 rows
            const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
            return headers.map((header, i) => `${header}: ${values[i] || ''}`).join('; ');
        })
    ].join('\n');
    
    return {
        content: cleanTextContent(textContent),
        metadata: {
            type: 'csv',
            headers,
            rowCount: rows.length,
            columnCount: headers.length
        },
        originalLength: content.length,
        processedLength: textContent.length
    };
}

// --- Main Parse Function ---
export function parseFileContent(content, fileName) {
    if (!content || typeof content !== 'string') {
        throw new Error('Invalid content provided for parsing');
    }
    
    const fileInfo = getFileType(fileName);
    
    if (!fileInfo.isTextFile) {
        throw new Error(`Unsupported file type: ${fileInfo.extension}`);
    }
    
    let parseResult;
    
    switch (fileInfo.extension) {
        case '.md':
            parseResult = parseMarkdown(content);
            break;
        case '.json':
            parseResult = parseJSON(content);
            break;
        case '.js':
        case '.ts':
        case '.py':
        case '.html':
        case '.css':
            parseResult = parseCodeFile(content, fileInfo.extension);
            break;
        case '.csv':
            parseResult = parseCSV(content);
            break;
        default:
            parseResult = parseTextFile(content);
            break;
    }
    
    // Add common metadata
    parseResult.metadata = {
        ...parseResult.metadata,
        fileName,
        fileExtension: fileInfo.extension,
        mimeType: fileInfo.mimeType,
        parsedAt: new Date().toISOString()
    };
    
    return parseResult;
}

// --- Content Preparation for Embedding ---
export function prepareContentForEmbedding(parseResult, options = {}) {
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

// --- Utility Functions ---
export function getContentSummary(parseResult) {
    return {
        fileName: parseResult.metadata.fileName,
        fileType: parseResult.metadata.type,
        originalSize: parseResult.originalLength,
        processedSize: parseResult.processedLength,
        compressionRatio: (parseResult.processedLength / parseResult.originalLength * 100).toFixed(1) + '%',
        wordCount: parseResult.metadata.wordCount || parseResult.content.split(/\s+/).length
    };
}

export function validateParsedContent(parseResult) {
    const errors = [];
    
    if (!parseResult.content || parseResult.content.trim().length === 0) {
        errors.push('Parsed content is empty');
    }
    
    if (!parseResult.metadata || typeof parseResult.metadata !== 'object') {
        errors.push('Metadata is missing or invalid');
    }
    
    if (parseResult.content.length > 100000) {
        errors.push('Parsed content is too large (>100KB)');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}
