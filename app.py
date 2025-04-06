import base64
import os
import json  # added import
from flask import Flask, request, jsonify
from flask_cors import CORS
from pydantic import BaseModel
from typing import Dict, Any
from google import genai
from google.genai import types
from dotenv import load_dotenv
from tavily import TavilyClient  # Add the missing import

# Load environment variables
load_dotenv()

# Initialize Flask app and enable CORS
app = Flask(__name__)
CORS(app)  # Allow all origins; adjust for production as needed

# To install: pip install tavily-python
def searchYouTube(query):
    tavily_client = TavilyClient(os.environ.get("TAVILY_API_KEY"))
    if not tavily_client:
        return jsonify({"error": "Tavily API key not found in environment"}), 500
    response = tavily_client.search(
        query=query,
        include_answer="basic",
        include_domains=["https://www.youtube.com/"]
    )
    return response


def generate(user_input: str):
    """Generate a response from Gemini model based on user input"""
    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return jsonify({"error": "Gemini API key not found in environment"}), 500
        
        client = genai.Client(api_key=api_key)
        model = "gemini-2.5-pro-preview-03-25"
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=user_input),
                ],
            ),
        ]
        search_youtube_function = {
            "name": "searchYouTube",
            "description": "searches YouTube for videos based on a query",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query for YouTube videos"
                    },
                },
                "required": ["query"],
            },
        }
        
        # Set up the tools configuration
        tools = types.Tool(function_declarations=[search_youtube_function])
        generate_content_config = types.GenerateContentConfig(
            tools=[tools],
            response_mime_type="text/plain",
            system_instruction=[
                types.Part.from_text(text="""You are an AI assistant named balmitra. When the user's message starts with a greeting word or phrase (such as 'Hi', 'Hello', 'Good morning', 'Good afternoon', 'Good evening', 'Hey', 'Hey there', 'What's up', 'How are you', etc.), you should introduce yourself by saying 'Hello, I'm balmitra, an AI assistant.' Then, respond to the user's message as appropriate. For messages that do not start with a greeting, you should respond without introducing yourself. Your job is to solve doubts, suggest YouTube video links, and reference books. Help with their assignments. Help with their preparations for exams. Ask the student what they are up to and how you can help them. Ask them to share their doubts or questions if any. You should be respectful towards the student; act like a big brother/friend or a helpful mentor who would guide them in their study. Use emojis to mimic brotherhood/friendship or being the best helpful study buddy for the student. Focus on helping the student, answering their question and helping them find resources. Utilize Wikipedia using Google Search by googledorking techniques for factual questions. Answer using ncert_books by searching for any doubt related to textbooks. Use step-by-step reasoning. Strictly adhere to study-related use cases. For youtube recommendation of video you can use Youtube search and then recommend the youtube videos to the user """),
            ],
        )
        
        response_text = ""
        try:
            for chunk in client.models.generate_content_stream(
                model=model,
                contents=contents,
                config=generate_content_config,
            ):
                if chunk.text is not None:
                    response_text += chunk.text
                elif chunk.function_calls is not None:
                    function_call = chunk.function_calls[0]
                    if function_call.name == "searchYouTube":
                        # Parse the arguments and execute the function
                        args = json.loads(function_call.args)
                        search_results = searchYouTube(args.get("query", ""))
                        if "results" in search_results and len(search_results["results"]) > 0:
                            response_text += "\n\nHere are some YouTube videos that might help:\n"
                            for idx, result in enumerate(search_results["results"][:5], 1):
                                response_text += f"{idx}. {result.get('title', 'No title')}: {result.get('url', 'No URL')}\n"
                        elif "error" in search_results:
                            response_text += f"\n\nI tried to search for videos but encountered an error: {search_results['error']}"
                        else:
                            response_text += "\n\nI searched for videos but couldn't find any relevant results."
        except Exception as stream_error:
            app.logger.warning(f"Streaming failed, falling back to non-streaming approach: {str(stream_error)}")
            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=generate_content_config,
            )
            if response.candidates and response.candidates[0].content.parts:
                candidate = response.candidates[0]
                response_text = ""
                for part in candidate.content.parts:
                    # Append any text parts
                    if hasattr(part, "text") and part.text:
                        response_text += part.text
                    # Process function_call parts
                    if hasattr(part, "function_call") and part.function_call:
                        function_call = part.function_call
                        app.logger.info(f"Function to call: {function_call.name}")
                        app.logger.info(f"Arguments: {function_call.args}")
                        if function_call.name == "searchYouTube":
                            args = json.loads(function_call.args) if isinstance(function_call.args, str) else function_call.args
                            search_results = searchYouTube(args.get("query", ""))
                            if "results" in search_results and len(search_results["results"]) > 0:
                                response_text += "\n\nHere are some YouTube videos that might help:\n"
                                for idx, result in enumerate(search_results["results"][:5], 1):
                                    response_text += f"{idx}. {result.get('title', 'No title')}: {result.get('url', 'No URL')}\n"
                            elif "error" in search_results:
                                response_text += f"\n\nI tried to search for videos but encountered an error: {search_results['error']}"
                            else:
                                response_text += "\n\nI searched for videos but couldn't find any relevant results."
            else:
                response_text = "I couldn't process your request. Please try again."
        return response_text
    except Exception as e:
        app.logger.error(f"Error generating content: {str(e)}")
        return jsonify({"error": f"Error generating content: {str(e)}"}), 500


@app.route("/api/chat", methods=["POST"])
def chat():
    """
    Chat with Gemini model
    
    - **message**: The user message to send to Gemini
    """
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "No message provided"}), 400
    try:
        response_text = generate(data["message"])
        if isinstance(response_text, tuple):  # error tuple returned from generate
            return response_text
        return jsonify({"response": response_text})
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

@app.route("/", methods=["GET"])
def root():
    """Root endpoint to check if the API is running"""
    return jsonify({"message": "Gemini Chat API is running. Send requests to /api/chat"})

@app.route("/healthz", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)