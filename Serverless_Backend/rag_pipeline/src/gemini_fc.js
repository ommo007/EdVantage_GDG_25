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
  
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const tavily_api_key = process.env.tavily_api_key;
  
  const tvly = tavily({ apiKey: tavily_api_key });
  
  // Function to handle Tavily search
  async function searchTavily(query) {
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
  
  // Function to handle weather (placeholder)
  async function getWeather(city) {
    // This is a placeholder function - you would implement actual weather API call here
    return {
      city: city,
      temperature: "22°C",
      condition: "Sunny",
      humidity: "65%"
    };
  }
  
  async function main() {
    const ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    });
    const tools = [
      {
        functionDeclarations: [
          {
            name: 'getWeather',
            description: 'gets the weather for a requested city',
            parameters: {
              type: Type.OBJECT,
              properties: {
                city: {
                  type: Type.STRING,
                  description: 'The name of the city to get weather for',
                },
              },
              required: ['city'],
            },
          },
          {
            name: 'searchTavily',
            description: 'searches the web using Tavily API to find information about any topic',
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
        ],
      }
    ];
    const config = {
      tools,
      responseMimeType: 'text/plain',
      systemInstruction: [
          {
            text: `You are a helpful assistant that can get weather information and search the web for any topic. When users ask for weather, use the getWeather function. When users ask questions that require web search or current information, use the searchTavily function. Always provide a comprehensive and helpful response based on the function results.`,
          }
      ],
    };
    const model = 'gemini-2.0-flash';
    
    // Initial conversation with user query
    let contents = [
      {
        role: 'user',
        parts: [
          {
            text: `Search for information about harshalmore31`,
          },
        ],
      },
    ];
  
    try {
      // First call to get function calls
      let response = await ai.models.generateContent({
        model,
        config,
        contents,
      });
  
      console.log('Initial response:', response);
  
      // Process function calls if any
      if (response.candidates && response.candidates[0].content.parts) {
        const parts = response.candidates[0].content.parts;
        
        // Add assistant's response to conversation
        contents.push({
          role: 'model',
          parts: parts
        });
  
        // Process each function call
        for (const part of parts) {
          if (part.functionCall) {
            const functionCall = part.functionCall;
            console.log('Function called:', functionCall.name);
            console.log('Arguments:', functionCall.args);
            
            let functionResult;
            
            if (functionCall.name === 'getWeather') {
              functionResult = await getWeather(functionCall.args.city);
            } else if (functionCall.name === 'searchTavily') {
              functionResult = await searchTavily(functionCall.args.query);
            }
            
            if (functionResult) {
              console.log('Function result:', JSON.stringify(functionResult, null, 2));
              
              // Add function response to conversation
              contents.push({
                role: 'function',
                parts: [
                  {
                    functionResponse: {
                      name: functionCall.name,
                      response: functionResult
                    }
                  }
                ]
              });
            }
          }
        }
  
        // Get final response from Gemini after processing function results
        const finalResponse = await ai.models.generateContent({
          model,
          config,
          contents,
        });
  
        console.log('\n=== Final Response from Gemini ===');
        if (finalResponse.candidates && finalResponse.candidates[0].content.parts) {
          finalResponse.candidates[0].content.parts.forEach(part => {
            if (part.text) {
              console.log(part.text);
            }
          });
        }
      } else {
        // Handle direct text response without function calls
        console.log('Direct response:', response.candidates[0].content.parts[0].text);
      }
      
    } catch (error) {
      console.error('Error in main function:', error);
    }
  }
  
  main().catch(console.error);
  