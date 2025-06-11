# RAG Pipeline - Enhanced Modular Architecture

A comprehensive, modular Retrieval-Augmented Generation (RAG) pipeline that processes documents from Appwrite, generates embeddings using Google Gemini AI, and stores them in Qdrant vector database for semantic search. Features advanced parsing operations for multiple file types, content chunking, and intelligent metadata extraction.

## 🏗️ Architecture

The codebase has been completely modularized into specialized files for maximum maintainability and extensibility:

### 📁 File Structure

```
src/
├── config.js                 # Environment configuration and validation
├── parse_operations.js       # Advanced file parsing and content processing
├── appwrite_operations.js    # Appwrite client and file operations
├── qdrant_operations.js      # Qdrant client and vector operations
├── embeddings.js            # Gemini AI embedding generation
├── qdrant_retrival.js       # Vector search and retrieval functions
└── main.js                  # Main orchestrator and execution
```

### 🧩 Enhanced Module Breakdown

#### **config.js**
- Environment variable validation with detailed error messages
- Configuration constants export
- Startup checks for required API keys and cloud configurations

#### **parse_operations.js** ⭐ **NEW**
- **Multi-format parsing**: Markdown, JSON, CSV, Code files (JS/TS/PY), HTML, CSS
- **Intelligent content extraction**: Comments, function names, metadata
- **Content preprocessing**: Text cleaning, normalization, structure preservation
- **Smart chunking**: Context-aware text splitting with overlap
- **Metadata enrichment**: File type detection, language identification
- **Content validation**: Parsing error handling and fallback mechanisms

#### **appwrite_operations.js**
- Enhanced Appwrite client initialization
- Advanced database and collection management
- **Intelligent file parsing** integration
- File type analysis and statistics
- Processing status logging with comprehensive error handling

#### **qdrant_operations.js**
- Qdrant client setup with cloud compatibility
- **Enhanced metadata storage** with parsing information
- Batch vector operations for performance
- **Advanced filtering capabilities** by file type, language, chunks
- Collection statistics and performance metrics

#### **embeddings.js**
- Gemini AI client with enhanced error handling
- **Chunking-aware embedding generation**
- Batch processing capabilities
- **Content validation** before embedding
- Embedding statistics and quality metrics

#### **qdrant_retrival.js**
- **Multi-dimensional search**: By file type, language, content type
- **Chunk-aware retrieval**: Full documents vs. chunked content
- **Specialized searches**: Code functions, similar documents
- Advanced filtering and metadata-based queries

#### **main.js**
- **Enhanced orchestration** with detailed progress tracking
- **Performance analytics** and processing statistics
- **Comprehensive testing utilities**
- Detailed logging with emojis for better readability

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file with the following variables:

```env
# Appwrite Configuration
APPWRITE_ENDPOINT=https://your-appwrite-endpoint
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_BUCKET_ID=your-bucket-id
APPWRITE_DATABASE_ID=your-database-id
APPWRITE_COLLECTION_ID_EMBEDDING_LOGS=your-logs-collection-id
APPWRITE_API_KEY=your-api-key

# Qdrant Configuration
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your-qdrant-api-key  # Optional for local instance

# Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Run the Enhanced Pipeline
```bash
npm start
```

## 🔧 Advanced Usage

### Process All Files with Enhanced Parsing
```javascript
import { processAllAppwriteFiles } from './src/main.js';
await processAllAppwriteFiles();
```

### Advanced Search Capabilities
```javascript
import { 
    testVectorSearch, 
    testSearchByFileType,
    analyzePipelinePerformance 
} from './src/main.js';

// General semantic search
const results = await testVectorSearch("machine learning algorithms", 5);

// Search by file type
const codeResults = await testSearchByFileType("function optimization", "code");

// Performance analysis
const stats = await analyzePipelinePerformance();
```

### Specialized Search Functions
```javascript
import { 
    searchByFileType,
    searchByLanguage,
    searchCodeFunctions,
    searchExcludeChunks 
} from './src/qdrant_retrival.js';

// Search only in Python files
const pythonResults = await searchByLanguage("data processing", "python");

// Search for code functions
const functionResults = await searchCodeFunctions("authentication");

// Search excluding chunked content
const fullDocResults = await searchExcludeChunks("project overview");
```

### Content Parsing Operations
```javascript
import { 
    parseFileContent,
    prepareContentForEmbedding,
    getContentSummary 
} from './src/parse_operations.js';

// Parse any supported file type
const parseResult = parseFileContent(rawContent, "example.md");

// Prepare content for embedding with chunking
const embeddingParts = prepareContentForEmbedding(parseResult, {
    includeMetadata: true,
    maxLength: 8000,
    enableChunking: true
});

// Get content analysis
const summary = getContentSummary(parseResult);
```

## 📊 Enhanced Features

### 🔍 **Advanced File Type Support**
- ✅ **Markdown**: Frontmatter extraction, structure preservation
- ✅ **JSON**: Hierarchical data extraction, key-value mapping
- ✅ **Code Files**: Comment extraction, function/class detection
- ✅ **CSV**: Header analysis, row sampling
- ✅ **Plain Text**: Word count, line analysis
- ✅ **Configuration Files**: YAML, INI, XML support

### 🧠 **Intelligent Content Processing**
- ✅ **Smart Chunking**: Context-aware text splitting
- ✅ **Metadata Enrichment**: File type, language, structure detection
- ✅ **Content Validation**: Parsing error handling and recovery
- ✅ **Text Preprocessing**: Cleaning, normalization, encoding handling

### 🎯 **Advanced Search Capabilities**
- ✅ **Multi-dimensional Filtering**: File type, language, content structure
- ✅ **Chunk-aware Search**: Full documents vs. chunked content
- ✅ **Semantic Similarity**: Document-to-document comparison
- ✅ **Code-specific Search**: Function and class discovery

### 📈 **Performance & Analytics**
- ✅ **Processing Statistics**: Content analysis, compression ratios
- ✅ **Collection Metrics**: Vector counts, indexing status
- ✅ **Performance Monitoring**: Success rates, error tracking
- ✅ **Content Insights**: Language distribution, file type analysis

## 🛠️ Configuration

### Vector Dimensions & Models
```javascript
// config.js
export const CONFIG = {
    GEMINI_EMBEDDING_MODEL: 'gemini-embedding-exp-03-07',
    VECTOR_DIMENSION: 3072, // Matches Gemini model output
    QDRANT_COLLECTION_NAME: "gemini_embeddings_collection2"
};
```

### Parsing Options
```javascript
// Customize parsing behavior
const parseOptions = {
    includeMetadata: true,
    maxLength: 8000,
    enableChunking: true,
    chunkOverlap: 200
};
```

### Search Parameters
```javascript
// Fine-tune search behavior
const searchOptions = {
    limit: 10,
    scoreThreshold: 0.7,
    fileType: "markdown",
    language: "javascript",
    excludeChunks: false
};
```

## 📝 Comprehensive API Reference

### Main Functions

| Function | Description | Parameters |
|----------|-------------|------------|
| `processAllAppwriteFiles()` | Process all files with enhanced parsing | None |
| `testVectorSearch(query, limit, options)` | Advanced semantic search | query: string, limit: number, options: object |
| `testSearchByFileType(query, type, limit)` | Search within specific file types | query: string, type: string, limit: number |
| `analyzePipelinePerformance()` | Get comprehensive performance metrics | None |

### Parsing Functions

| Function | Description | Parameters |
|----------|-------------|------------|
| `parseFileContent(content, fileName)` | Parse any supported file type | content: string, fileName: string |
| `prepareContentForEmbedding(parseResult, options)` | Prepare content with chunking | parseResult: object, options: object |
| `chunkText(text, maxSize, overlap)` | Smart text chunking | text: string, maxSize: number, overlap: number |
| `cleanTextContent(content)` | Text preprocessing and cleaning | content: string |

### Search Functions

| Function | Description | Parameters |
|----------|-------------|------------|
| `searchByFileType(query, type, limit, threshold)` | Type-specific search | query: string, type: string, limit: number, threshold: number |
| `searchByLanguage(query, language, limit, threshold)` | Language-specific search | query: string, language: string, limit: number, threshold: number |
| `searchCodeFunctions(query, limit, threshold)` | Search for code functions | query: string, limit: number, threshold: number |
| `findSimilarDocuments(fileId, limit, threshold)` | Find similar documents | fileId: string, limit: number, threshold: number |

## 🎛️ Supported File Types

| Extension | Type | Features |
|-----------|------|----------|
| `.md` | Markdown | Frontmatter extraction, structure parsing |
| `.json` | JSON | Hierarchical extraction, key mapping |
| `.js/.ts` | Code | Function/class detection, comment extraction |
| `.py` | Python | Function/class detection, docstring extraction |
| `.html` | HTML | Comment extraction, structure preservation |
| `.css` | CSS | Comment extraction, rule analysis |
| `.csv` | CSV | Header detection, row sampling |
| `.txt` | Text | Word/line counting, content analysis |
| `.yml/.yaml` | YAML | Key-value extraction |
| `.xml` | XML | Structure preservation |

## 🐛 Troubleshooting

### Common Issues

1. **Missing Environment Variables**: 
   - Check console for specific missing variables
   - Verify `.env` file format and values

2. **Parsing Errors**: 
   - Check file encoding (UTF-8 expected)
   - Verify file format matches extension
   - Review parsing error logs for specific issues

3. **API Rate Limits**: 
   - Increase delays in `main.js` and `embeddings.js`
   - Consider batch processing options

4. **Vector Dimension Mismatch**: 
   - Ensure `VECTOR_DIMENSION` matches your embedding model
   - Check Gemini model documentation for current dimensions

5. **Qdrant Connection Issues**: 
   - Verify `QDRANT_URL` and API key for cloud instances
   - Check local Qdrant service status

### Enhanced Logging
The application provides comprehensive logging with:
- 🚀 Configuration validation and startup
- 📊 File type analysis and statistics
- 🔄 Detailed processing progress
- 📈 Content parsing summaries
- 🎯 Search results and performance
- ❌ Error tracking and recovery

## 🔬 Performance Optimization

### Chunking Strategy
- **Smart Boundaries**: Breaks at sentences/paragraphs
- **Context Preservation**: Overlapping chunks maintain context
- **Size Optimization**: Configurable chunk sizes for optimal embedding

### Batch Processing
- **Rate Limit Compliance**: Built-in delays and batch sizing
- **Memory Efficiency**: Streaming processing for large files
- **Error Recovery**: Individual chunk failure handling

### Metadata Optimization
- **Rich Context**: Comprehensive file and content metadata
- **Search Efficiency**: Indexed fields for fast filtering
- **Storage Efficiency**: Optimized payload structure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch following the modular architecture
3. Add appropriate tests for new parsing operations
4. Update documentation for new features
5. Submit a pull request with detailed description

## 📄 License

MIT License - see LICENSE file for details.

---

*This enhanced RAG pipeline provides enterprise-grade document processing with intelligent parsing, advanced search capabilities, and comprehensive analytics for production use.*

