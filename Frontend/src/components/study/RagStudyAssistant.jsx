import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MessageSquare, ExternalLink, Book, Loader, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Mock `queryRagSystem` function for frontend testing
const queryRagSystem = async (input, classId, userId, userRole) => {
  console.log("Mock queryRagSystem called with:", { input, classId, userId, userRole });

  // Simulate a delay to mimic API response time
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return a mock response
  return {
    answer: `This is a mock response for your query: "${input}".`,
    sources: [
      { title: "Mock Source 1", url: "https://example.com/source1" },
      { title: "Mock Source 2", url: "https://example.com/source2" },
    ],
  };
};

const RagStudyAssistant = () => {
  const { classId } = useParams();
  const { currentUser, userRole } = useAuth();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState([
    {
      role: 'assistant',
      content: 'Hello! I can help you find information from your study materials. What would you like to know?',
      sources: []
    }
  ]);

  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    // Add user message to conversation
    const userMessage = { role: 'user', content: input };
    setConversation((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Query the mock RAG system
      const response = await queryRagSystem(input, classId, currentUser.uid, userRole);

      // Add assistant response to conversation
      const assistantMessage = {
        role: 'assistant',
        content: response.answer,
        sources: response.sources || []
      };

      setConversation((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("RAG query failed:", error);

      // Add error message to conversation
      setConversation((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I encountered an error while searching through the materials. Please try again.',
          sources: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-indigo-100 bg-indigo-50 flex items-center">
        <Book className="h-5 w-5 text-indigo-600 mr-2" />
        <h2 className="text-lg font-semibold text-indigo-900">Study Assistant (RAG)</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 text-indigo-800'
              }`}
            >
              <p>{message.content}</p>

              {/* Sources section */}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-indigo-200">
                  <p className="text-xs font-medium mb-2">Sources:</p>
                  <ul className="space-y-1">
                    {message.sources.map((source, idx) => (
                      <li key={idx} className="text-xs flex items-start">
                        <ExternalLink className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          {source.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-indigo-50 text-indigo-800 rounded-xl px-4 py-3 flex items-center">
              <Loader className="h-4 w-4 animate-spin mr-2" />
              Searching study materials...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-indigo-100 bg-indigo-50">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-4 w-4" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your study materials..."
              className="w-full pl-10 pr-4 py-2 border border-indigo-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default RagStudyAssistant;