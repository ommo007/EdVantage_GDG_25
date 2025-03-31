// Configuration settings for using Gemini API with RAG

export const GEMINI_CONFIG = {
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  apiUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
  version: "gemini-2.5-pro",
  chunkSize: 1000, // Document chunk size for indexing
  maxTokens: 1024, // Maximum tokens for response
  temperature: 0.2, // Lower temperature for more factual responses
};

// Construct a study assistant prompt template
export const createRagPrompt = (documents, question) => {
  return `
You are an AI study assistant helping students with their class materials. 
Answer the following question based ONLY on the provided document excerpts.
If the answer is not in the documents, say "I don't have enough information to answer this question from the class materials."
Always cite your sources by referring to the document names.

Document excerpts:
${documents.map(doc => `[${doc.title}]: ${doc.text}`).join('\n\n')}

Student's question: ${question}

Your answer should be comprehensive, accurate, and educational. If you're explaining a complex concept, break it down step by step.
`;
};

// Function to generate a system prompt for the Gemini API
export const getSystemPrompt = () => {
  return `
You are an educational assistant for students. Your goal is to help students learn by providing clear, accurate explanations 
based on their course materials. When answering questions:

1. Base your answers only on the provided course materials
2. Provide specific examples when helpful
3. For math or science questions, explain the steps to solve problems
4. If you don't have enough information from the course materials, say so
5. Be friendly, supportive, and encouraging
6. Maintain an educational tone appropriate for students
`;
};

// Configure the model settings
export const getModelSettings = () => {
  return {
    temperature: GEMINI_CONFIG.temperature,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: GEMINI_CONFIG.maxTokens,
  };
};

// Validation for document types that can be indexed
export const isIndexableDocument = (fileType) => {
  const indexableTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];
  
  return indexableTypes.includes(fileType);
};
