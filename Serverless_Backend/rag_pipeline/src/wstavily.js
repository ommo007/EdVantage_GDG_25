import { tavily } from "@tavily/core";
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const tavily_api_key = process.env.tavily_api_key;

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