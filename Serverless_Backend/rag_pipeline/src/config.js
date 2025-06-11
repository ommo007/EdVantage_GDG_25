import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// --- Environment Variable Checks ---
const requiredEnvVars = [
  'APPWRITE_ENDPOINT',
  'APPWRITE_PROJECT_ID',
  'APPWRITE_BUCKET_ID',
  'APPWRITE_DATABASE_ID',
  'APPWRITE_COLLECTION_ID_EMBEDDING_LOGS',
  'APPWRITE_API_KEY', // Crucial for server-side database operations
  'GEMINI_API_KEY',
  'QDRANT_URL',
  // QDRANT_API_KEY is optional unless QDRANT_URL points to cloud
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Error: Missing required environment variables:');
  missingEnvVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease check your .env file and ensure all required variables are set.');
  process.exit(1); // Exit with error code
}

if (process.env.QDRANT_URL && process.env.QDRANT_URL.includes("cloud.qdrant.io") && !process.env.QDRANT_API_KEY) {
    console.error("❌ Error: QDRANT_API_KEY is required when using a Qdrant Cloud URL.");
    process.exit(1);
}

// --- Configuration Constants ---
export const CONFIG = {
  // Appwrite Configuration
  APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID: process.env.APPWRITE_PROJECT_ID,
  APPWRITE_BUCKET_ID: process.env.APPWRITE_BUCKET_ID,
  APPWRITE_DATABASE_ID: process.env.APPWRITE_DATABASE_ID,
  APPWRITE_COLLECTION_ID_EMBEDDING_LOGS: process.env.APPWRITE_COLLECTION_ID_EMBEDDING_LOGS,
  APPWRITE_API_KEY: process.env.APPWRITE_API_KEY,

  // Qdrant Configuration
  QDRANT_URL: process.env.QDRANT_URL,
  QDRANT_API_KEY: process.env.QDRANT_API_KEY,
  QDRANT_COLLECTION_NAME: "gemini_embeddings_collection2",
  VECTOR_DIMENSION: 3072, // Updated to match Gemini's actual output dimension

  // Gemini Configuration
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_EMBEDDING_MODEL: 'gemini-embedding-exp-03-07',
};

console.log('✅ Configuration loaded successfully'); 