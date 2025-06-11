# 🤖 balmitra AI Assistant - Cloudflare Workers

A friendly AI study companion powered by Gemini AI, deployed on Cloudflare Workers. balmitra helps students with their studies through intelligent search capabilities and personalized assistance.

## ✨ Features

- **🧠 Smart AI Assistant**: Powered by Google Gemini 2.0 Flash
- **📚 RAG Knowledge Search**: Access to curated academic content
- **🌐 Web Search**: Real-time information via Tavily API
- **📹 YouTube Integration**: Educational video recommendations
- **⚡ Fast & Scalable**: Deployed on Cloudflare Workers
- **🎯 Student-Focused**: Designed specifically for educational support

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd balmitra_gemini
npm install
```

### 2. Set Environment Variables

Set your API keys as Cloudflare Worker secrets:

```bash
# Set Gemini API Key
npx wrangler secret put GEMINI_API_KEY

# Set Tavily API Key
npx wrangler secret put TAVILY_API_KEY
```

### 3. Deploy to Cloudflare Workers

```bash
# Deploy to production
npm run deploy

# Or for development
npm run dev
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | ✅ |
| `TAVILY_API_KEY` | Tavily search API key | ✅ |

### Get API Keys

1. **Gemini API**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Tavily API**: Get from [Tavily](https://tavily.com/)

## 📡 API Endpoints

### POST `/api/chat`

Send a message to balmitra AI assistant.

**Request:**
```json
{
  "message": "Hi balmitra! Can you help me with quantum physics?",
  "role": "student"
}
```

**Response:**
```json
{
  "response": "Hello, I'm balmitra, an AI assistant. What's up, bro? 🤗 I'd love to help you with quantum physics! What specific concepts are you struggling with? 📚"
}
```

### GET `/`
Health check endpoint.

### GET `/healthz`
Service health status.

## 🎯 Frontend Integration

Update your frontend to use the Cloudflare Workers URL:

```javascript
const response = await fetch("https://your-worker.workers.dev/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ 
    message: userMessage, 
    role: "student" 
  })
});

const data = await response.json();
console.log(data.response); // AI response
```

## 🛠️ Development

### Local Development

```bash
# Start local development server
npm run dev

# Test locally at http://localhost:8787
```

### Deploy

```bash
# Deploy to production
npm run deploy

# Deploy to development environment
npx wrangler deploy --env development
```

## 🧪 Testing

Test the deployed worker:

```bash
# Test health endpoint
curl https://your-worker.workers.dev/

# Test chat endpoint
curl -X POST https://your-worker.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello balmitra!", "role": "student"}'
```

## 🎯 Features in Detail

### 🤖 AI Personality
- Friendly, supportive mentor personality
- Greeting detection and proper introductions
- Student-focused responses with emojis
- Educational guidance and encouragement

### 🔍 Search Capabilities
- **RAG Search**: Academic content from curated knowledge base
- **Web Search**: Current information and factual data
- **YouTube Search**: Educational videos and tutorials
- **Smart Routing**: AI automatically chooses the best search method

### 📚 Student Support
- Homework and assignment help
- Exam preparation assistance
- Concept explanations with step-by-step reasoning
- Resource recommendations (videos, books, articles)

## 🔒 Security

- API keys stored as Cloudflare Worker secrets
- CORS enabled for frontend integration
- Input validation and error handling
- Rate limiting via Cloudflare's built-in protection

## 📈 Monitoring

Monitor your Worker in the Cloudflare dashboard:
- Request analytics
- Error rates
- Performance metrics
- Usage statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

If you encounter issues:
1. Check Cloudflare Workers logs
2. Verify API keys are set correctly
3. Ensure all dependencies are installed
4. Check the console for detailed error messages

---

Made with ❤️ for students everywhere 📚✨ 