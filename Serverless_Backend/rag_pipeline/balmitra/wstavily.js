import { tavily } from "@tavily/core";
// import dotenv from 'dotenv';
import fs from 'fs';
// dotenv.config();

// Function to get environment variables with Cloudflare Workers support
function getEnvVar(key, env = null) {
  // Try Cloudflare Workers env first
  if (env && env[key]) {
    return env[key];
  }
  
  // Fallback to process.env (works with dotenv if available)
  if (process.env[key]) {
    return process.env[key];
  }
  
  return undefined;
}

// Initialize environment variables for non-Cloudflare environments
let isDotenvAvailable = false;
try {
  // Try to dynamically import dotenv only if not in Cloudflare Workers
  if (typeof process !== 'undefined' && process.env && !process.env.CF_WORKER) {
    const dotenv = await import('dotenv');
    dotenv.config();
    isDotenvAvailable = true;
  }
} catch (error) {
  // dotenv not available or we're in Cloudflare Workers, continue without it
  console.log('Using Cloudflare Workers environment or dotenv not available');
}

// Main function that accepts env parameter for Cloudflare Workers compatibility
async function runTavilySearch(env = null) {
  const tavily_api_key = getEnvVar('TAVILY_API_KEY', env) || getEnvVar('tavily_api_key', env);
  
  if (!tavily_api_key) {
    console.error('❌ Error: TAVILY_API_KEY not found in environment variables');
    return;
  }

  const tvly = tavily({ apiKey: tavily_api_key });
  const response = await tvly.search("Who is harshalmore31?");

  // console.log(response); // Original console log

  if (response && response.results) {
    console.log("Query:", response.query);
    console.log("Response Time:", response.responseTime);
    console.log("\nResults:");
    response.results.forEach((result, index) => {
      console.log(`\n--- Result ${index + 1} ---`);
      console.log("Title:", result.title);
      console.log("URL:", result.url);
      console.log("Content:", result.content);
      console.log("Score:", result.score);
    });
  } else {
    console.log("No results found or an error occurred.");
    console.log("Full response:", response);
  }
}

// Run the search - can be called with env parameter in Cloudflare Workers
// or without parameters in regular Node.js environment
runTavilySearch().catch(console.error);