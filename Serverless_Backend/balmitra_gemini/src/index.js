// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node
// npm install @tavily/core

import {
    GoogleGenAI,
    Type,
  } from '@google/genai';
  
  import { tavily } from "@tavily/core";
  import dotenv from 'dotenv';
  import fs from 'fs';
  
  dotenv.config();

  // Function to get environment variables with process.env priority
  function getEnvVar(key, env) {
    // Try process.env first (for local development and most deployments)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
    
    // Fallback to Cloudflare Workers env
    if (env && env[key]) {
      return env[key];  
    }
    
    return undefined;
  }

  // Function to get API keys
  function getApiKeys(env) {
    return {
      GEMINI_API_KEY: getEnvVar('GEMINI_API_KEY', env),
      TAVILY_API_KEY: getEnvVar('TAVILY_API_KEY', env)
    };
  }

  // Function to handle Tavily search
  async function searchTavily(query, env) {
    const { TAVILY_API_KEY } = getApiKeys(env);
    
    if (!TAVILY_API_KEY) {
      return { error: "TAVILY_API_KEY not found in environment variables" };
    }
    
    const tvly = tavily({ apiKey: TAVILY_API_KEY });
    
    try {
      const response = await tvly.search(query);
      
      if (response && response.results) {
        return {
          query: response.query,
          responseTime: response.responseTime,
          results: response.results.map((result, index) => ({
            title: result.title,
            url: result.url,
            content: result.content,
            score: result.score
          }))
        };
      } else {
        return { error: "No results found or an error occurred.", fullResponse: response };
      }
    } catch (error) {
      return { error: `Search failed: ${error.message}` };
    }
  }

  // Function to handle YouTube search using Tavily API
  async function searchYouTube(query, env) {
    const { TAVILY_API_KEY } = getApiKeys(env);
    
    if (!TAVILY_API_KEY) {
      return { error: "TAVILY_API_KEY not found in environment variables" };
    }
    
    const tvly = tavily({ apiKey: TAVILY_API_KEY });
    
    try {
      // Use the correct Tavily API format for YouTube search
      const response = await tvly.search(query, {
        search_depth: "basic",
        include_domains: ["youtube.com"]
      });
      
      if (response && response.results) {
        return {
          query: response.query,
          responseTime: response.responseTime,
          results: response.results.map((result, index) => ({
            title: result.title,
            url: result.url,
            content: result.content,
            score: result.score
          }))
        };
      } else {
        return { error: "No YouTube videos found or an error occurred.", fullResponse: response };
      }
    } catch (error) {
      return { error: `YouTube search failed: ${error.message}` };
    }
  }

  // Function to handle RAG search
  async function searchRAG(query, limit = 5) {
    const ragEndpoint = 'https://rag-pipeline.harshalmore.dev/search';
    
    try {
      const url = new URL(ragEndpoint);
      url.searchParams.append('q', query);
      url.searchParams.append('limit', limit.toString());
      
      console.log('RAG search URL:', url.toString());
      
      const response = await fetch(url.toString());
      
      console.log('RAG API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('RAG API error response:', errorText);
        throw new Error(`RAG API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('RAG API response data:', JSON.stringify(data, null, 2));
      
      if (data.success && data.results) {
        return {
          success: true,
          query: data.query,
          limit: data.limit,
          count: data.count,
          timestamp: data.timestamp,
          results: data.results.map(result => ({
            id: result.id,
            score: result.score,
            textPreview: result.textPreview,
            fileName: result.fileName,
            fileId: result.fileId,
            metadata: result.metadata,
            searchableContent: result.payload?.searchable_content || result.textPreview
          }))
        };
      } else {
        console.log('RAG API returned unsuccessful result or no results');
        return { 
          success: false, 
          error: "No results found in RAG collection", 
          fullResponse: data 
        };
      }
    } catch (error) {
      console.error('RAG search error:', error);
      return { 
        success: false, 
        error: `RAG search failed: ${error.message}` 
      };
    }
  }
  
  // Main AI processing function
  async function processMessage(userMessage, env) {
    const { GEMINI_API_KEY } = getApiKeys(env);
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    const ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    });

    const tools = [
      {
        functionDeclarations: [
          {
            name: 'searchTavily',
            description: 'searches the web using Tavily API to find additional information about any topic when RAG context is insufficient',
            parameters: {
              type: Type.OBJECT,
              properties: {
                query: {
                  type: Type.STRING,
                  description: 'The search query to find information about',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'searchYouTube',
            description: 'searches YouTube for educational videos based on a query to help students with visual learning and tutorials',
            parameters: {
              type: Type.OBJECT,
              properties: {
                query: {
                  type: Type.STRING,
                  description: 'The search query for YouTube educational videos',
                },
              },
              required: ['query'],
            },
          },
        ],
      }
    ];

    const config = {
      tools,
      responseMimeType: 'text/plain',
      systemInstruction: [
        {
          text: `You are an AI assistant named balmitra 🤖. When the user's message starts with a greeting word or phrase (such as 'Hi', 'Hello', 'Good morning', 'Good afternoon', 'Good evening', 'Hey', 'Hey there', 'What's up', 'How are you', etc.), you should introduce yourself by saying 'Hello, I'm balmitra, an AI assistant.' Then, respond to the user's message as appropriate.

For messages that do not start with a greeting, you should respond without introducing yourself.

**Your Role & Personality:**
- Act like a big brother/friend or a helpful mentor who guides students in their studies 👨‍🎓
- Be respectful towards students and use emojis to mimic brotherhood/friendship 😊
- Be the best helpful study buddy for students 📚
- Focus on helping students, answering their questions, and helping them find resources

**Primary Information Source:**
You have access to a knowledge base containing textbook notes, lecture materials, and academic content. ALWAYS prioritize this information when answering questions. This context will be provided to you automatically with each query.

**Your Capabilities:**
1. **Primary**: Use the provided RAG context (textbook notes and lectures) to answer questions accurately
2. **Secondary**: Use searchTavily function for additional current information when RAG context needs supplementation
3. **Visual Learning**: Use searchYouTube function for finding educational videos and tutorials

**Your Mission:**
- Answer questions primarily using the provided textbook and lecture notes context
- Solve student doubts and questions based on their study materials ❓
- Suggest relevant YouTube video links for visual learning when helpful 📹
- Provide additional web resources only when the textbook context is insufficient 🌐
- Help with assignments and homework based on course materials 📝
- Assist with exam preparations using the available notes 🎯
- Use step-by-step reasoning for complex problems 🔢
- Strictly adhere to study-related use cases

**Response Guidelines:**
- Always reference the source of information (textbook notes, lectures, etc.)
- If the RAG context doesn't contain sufficient information, then use additional tools
- Encourage students in their learning journey and relate answers to their course materials
- Provide comprehensive explanations based on the available academic content

Always provide helpful responses that encourage students in their learning journey! 🌟`,
        }
      ],
    };

    const model = 'gemini-2.0-flash';
    
    try {
      // STEP 1: Always search RAG collection first for relevant context
      console.log('Searching RAG collection for context...');
      const ragContext = await searchRAG(userMessage, 5);
      
      console.log('RAG search result:', JSON.stringify(ragContext, null, 2));
      
      // Prepare the context information
      let contextInfo = '';
      let hasValidContext = false;
      
      if (ragContext.success && ragContext.results && ragContext.results.length > 0) {
        hasValidContext = true;
        contextInfo = '\n\n**AVAILABLE CONTEXT FROM TEXTBOOK NOTES AND LECTURES:**\n\n';
        ragContext.results.forEach((result, index) => {
          contextInfo += `**Source ${index + 1}** (${result.fileName}):\n`;
          contextInfo += `${result.searchableContent}\n\n`;
        });
        contextInfo += '**END OF CONTEXT**\n\n';
        console.log('RAG context prepared successfully with', ragContext.results.length, 'results');
      } else {
        console.log('RAG search failed or returned no results:', ragContext);
        contextInfo = '\n\n**NOTE:** No relevant context found in the textbook notes and lectures for this query.\n\n';
      }

      // STEP 2: Create the enhanced prompt with RAG context
      let contents = [
        {
          role: 'user',
          parts: [
            {
              text: `${contextInfo}**USER QUESTION:** ${userMessage}

${hasValidContext ? 
  'Please answer this question primarily using the provided context from textbook notes and lectures above. Only use additional tools if the context is insufficient or if you need to provide supplementary visual learning resources (YouTube videos).' : 
  'Since no relevant context was found in the textbook notes, please search for information to help answer this question and provide educational resources.'
}`,
            },
          ],
        },
      ];

      console.log('Sending request to Gemini with context...');

      // STEP 3: Get initial response from Gemini with RAG context
      let response = await ai.models.generateContent({
        model,
        config,
        contents,
      });

      console.log('Received initial response from Gemini');

      // STEP 4: Process any additional function calls if needed
      if (response.candidates && response.candidates[0].content.parts) {
        const parts = response.candidates[0].content.parts;
        
        // Check if there are function calls
        const functionCalls = [];
        for (const part of parts) {
          if (part.functionCall) {
            functionCalls.push(part.functionCall);
          }
        }

        console.log('Function calls found:', functionCalls.length);

        // If there are function calls, process them
        if (functionCalls.length > 0) {
          // Add assistant's response to conversation
          contents.push({
            role: 'model',
            parts: parts
          });

          // Process all function calls and collect results
          const functionResponses = [];
          
          for (const functionCall of functionCalls) {
            console.log('Function called:', functionCall.name);
            console.log('Arguments:', functionCall.args);
            
            let functionResult = null;
            
            try {
              if (functionCall.name === 'searchTavily') {
                functionResult = await searchTavily(functionCall.args.query, env);
              } else if (functionCall.name === 'searchYouTube') {
                functionResult = await searchYouTube(functionCall.args.query, env);
              }
            } catch (error) {
              console.error(`Error in function ${functionCall.name}:`, error);
              functionResult = { error: `Function ${functionCall.name} failed: ${error.message}` };
            }
            
            // Ensure we always have a result, even if it's an error
            if (!functionResult) {
              functionResult = { error: `Function ${functionCall.name} returned no result` };
            }
            
            console.log('Function result:', JSON.stringify(functionResult, null, 2));
            
            functionResponses.push({
              functionResponse: {
                name: functionCall.name,
                response: functionResult
              }
            });
          }

          // Add all function responses at once
          if (functionResponses.length > 0) {
            contents.push({
              role: 'function',
              parts: functionResponses
            });
          }

          console.log('Getting final response from Gemini...');

          // Get final response from Gemini after processing function results
          const finalResponse = await ai.models.generateContent({
            model,
            config,
            contents,
          });

          if (finalResponse.candidates && finalResponse.candidates[0].content.parts) {
            let responseText = '';
            finalResponse.candidates[0].content.parts.forEach(part => {
              if (part.text) {
                responseText += part.text;
              }
            });
            console.log('Final response generated successfully');
            return responseText;
          }
        } else {
          // No function calls, return direct response
          let responseText = '';
          parts.forEach(part => {
            if (part.text) {
              responseText += part.text;
            }
          });
          console.log('Direct response (no function calls)');
          return responseText;
        }
      } else {
        // Fallback response
        console.log('No valid response candidates found');
        return "I'm sorry, I couldn't process your request. Please try again.";
      }
      
    } catch (error) {
      console.error('Error in processing message:', error);
      throw new Error(`Failed to process message: ${error.message}`);
    }
  }

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Main Cloudflare Workers export
  export default {
    async fetch(request, env, ctx) {
      // Handle CORS preflight requests
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 200,
          headers: corsHeaders,
        });
      }

      const url = new URL(request.url);
      
      // Handle root endpoint
      if (url.pathname === "/" && request.method === "GET") {
        return new Response(
          JSON.stringify({ 
            message: "balmitra AI Assistant API is running. Send requests to /api/chat",
            status: "healthy"
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }

      // Handle health check
      if (url.pathname === "/healthz" && request.method === "GET") {
        return new Response(
          JSON.stringify({ status: "healthy" }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }

      // Handle chat endpoint
      if (url.pathname === "/api/chat" && request.method === "POST") {
        try {
          const requestData = await request.json();
          
          if (!requestData || !requestData.message) {
            return new Response(
              JSON.stringify({ error: "No message provided" }),
              {
                status: 400,
                headers: {
                  "Content-Type": "application/json",
                  ...corsHeaders,
                },
              }
            );
          }

          // Process the message with balmitra AI
          const aiResponse = await processMessage(requestData.message, env);
          
          return new Response(
            JSON.stringify({ response: aiResponse }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );

        } catch (error) {
          console.error('Error processing chat request:', error);
          return new Response(
            JSON.stringify({ 
              error: `Error processing request: ${error.message}` 
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }
      }

      // Handle 404 for other routes
      return new Response(
        JSON.stringify({ error: "Not Found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    },
  };
  