import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronDown,
  User,
  LogOut,
  Calendar,
  MessageSquare,
  Edit,
  Menu,
  Settings,
  BookOpen,
  ArrowLeft,
  PanelRight,
  Database,
  FileText,
  ListChecks,
  Mic
} from "lucide-react";
import { Link as LinkIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Whiteboard from "./Whiteboard";
import Logo from "./Logo";
// import RagStudyAssistant from "./study/RagStudyAssistant";

// Static chapters for each subject
const subjectChapters = {
  mathematics: [
    "Number Systems",
    "Algebraic Expressions",
    "Linear Equations",
    "Geometry",
    "Mensuration"
  ],
  science: [
    "Matter in Our Surroundings",
    "Cell Structure",
    "Motion",
    "Light",
    "Electricity"
  ],
  history: [
    "The French Revolution",
    "Colonialism",
    "Nationalism in India"
  ],
  civics: [
    "Democracy",
    "Constitution",
    "Rights and Duties"
  ],
  economics: [
    "The Story of Village Palampur",
    "People as Resource"
  ],
  english: [
    "Prose: The Fun They Had",
    "Poem: The Road Not Taken"
  ],
  geography: [
    "India: Size and Location",
    "Physical Features of India"
  ]
};

const StudentStudySpace = () => {
  const { subjectId } = useParams(); // subjectName from URL
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedTool, setSelectedTool] = useState('video');
  const [isToolbarOpen, setIsToolbarOpen] = useState(true);
  const [isAssistantOpen, setIsAssistantOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello, I'm balmitra, an AI assistant. 👋 What are you up to today? 🤔", sender: "bot" },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [useRagAssistant, setUseRagAssistant] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [materials, setMaterials] = useState([]);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();

  // Get chapters for the selected subject
   const chapters = subjectChapters[decodeURIComponent(subjectId)] || [];

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message to AI assistant
  const handleSendMessage = async () => {
  if (!inputMessage.trim()) return;

  const newUserMessage = {
    id: messages.length + 1,
    text: inputMessage,
    sender: "user",
  };
  setMessages((prev) => [...prev, newUserMessage]);
  const currentMessage = inputMessage;
  setInputMessage("");
  setIsLoading(true);

  try {
    console.log("📤 Sending to AI API:", currentMessage);

    const response = await fetch("https://balmitra-ai-assistant.harshalmore2468.workers.dev/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: currentMessage, role: "student" })
    });

    const raw = await response.text();
    console.log("📥 Raw AI response:", raw);

    const data = JSON.parse(raw);

    const botMessage = {
      id: messages.length + 2,
      text: data.response || "⚠️ No response received.",
      sender: "bot"
    };

    setMessages(prev => [...prev, botMessage]);

  } catch (err) {
    console.error("❌ AI API failed:", err);
    setMessages(prev => [...prev, { id: messages.length + 2, text: "Sorry, the assistant is not responding.", sender: "bot" }]);
  } finally {
    setIsLoading(false);
  }
};

  const handleVoiceInput = () => {
  // Check for browser support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    setIsLoading(true);
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setInputMessage(transcript);
    setIsLoading(false);
  };

  recognition.onerror = (event) => {
    setIsLoading(false);
    alert("Voice input error: " + event.error);
  };

  recognition.onend = () => {
    setIsLoading(false);
  };

  recognition.start();
};

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVideoLinkClick = (message) => {
    const urlMatch = message.text.match(/https?:\/\/[\w./?=&%-]+/);
    if (urlMatch) {
      setVideoUrl(urlMatch[0]);
      setSelectedTool('video');
    }
  };

  const toggleWhiteboard = () => {
    setSelectedTool('whiteboard');
  };

  const toggleRagAssistant = () => {
    setUseRagAssistant(!useRagAssistant);
  };

  const fetchAIForChapter = async (subjectId, chapter) => {
  setIsLoading(true);
  try {
    const response = await fetch("https://edvantage-gdg-25.onrender.com/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "student",
        subject: subjectId,
        chapter: chapter
      })
    });
    const raw = await response.text();
    const data = JSON.parse(raw);

    // Extract video URL from the response text (if present)
    const urlMatch = data.response.match(/https?:\/\/[\w./?=&%-]+/);
    if (urlMatch) {
      setVideoUrl(urlMatch[0]);
      setSelectedTool('video'); // Optionally switch to video tab
    } else {
      setVideoUrl(""); // No video found
    }

    const botMessage = {
      id: messages.length + 1,
      text: data.response || "⚠️ No response received.",
      sender: "bot"
    };
    setMessages(prev => [...prev, botMessage]);
  } catch (err) {
    setMessages(prev => [...prev, { id: messages.length + 1, text: "Sorry, the assistant is not responding.", sender: "bot" }]);
  } finally {
    setIsLoading(false);
  }
};

  // When a chapter is clicked, set it as selected and (optionally) fetch videos/materials for it
 const handleChapterClick = (chapter) => {
  setSelectedChapter(chapter);
  fetchAIForChapter(subjectId, chapter);
};

  console.log("subjectId:", subjectId);
console.log("chapters:", chapters);

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-gradient-to-br from-indigo-50 to-white">
      {/* Header */}
      <header className="flex-shrink-0 bg-white shadow-sm border-b border-indigo-100 h-14">
        <nav className="container mx-auto px-4 h-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo />
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/student")}
              className="px-4 py-2 text-indigo-600 rounded-md hover:bg-indigo-50 flex items-center"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Dashboard
            </button>
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-indigo-700 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md transition duration-300"
              >
                <User className="h-5 w-5" />
                <span>Student</span>
                <ChevronDown
                  className={`h-4 w-4 transform transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-indigo-100">
                  <button className="block w-full text-left px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 focus:outline-none focus:bg-indigo-100">
                    <User className="inline-block w-4 h-4 mr-2" />
                    Profile
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 focus:outline-none focus:bg-indigo-100">
                    <Settings className="inline-block w-4 h-4 mr-2" />
                    Settings
                  </button>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('userRole');
                      navigate('/');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 focus:outline-none focus:bg-red-100"
                  >
                    <LogOut className="inline-block w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Toolbar */}
      <div className="flex-shrink-0 bg-indigo-50 border-b border-indigo-100 py-1 px-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsToolbarOpen(!isToolbarOpen)}
            className="p-1.5 hover:bg-indigo-100 rounded-md transition duration-300"
          >
            <Menu className="h-5 w-5 text-indigo-600" />
          </button>
          <button
            onClick={() => setSelectedTool("video")}
            className={`p-2 rounded-md ${selectedTool === "video" ? "bg-indigo-200" : "hover:bg-indigo-100"}`}
            title="Lecture Space"
          >
            <BookOpen className="h-5 w-5 text-indigo-600" />
          </button>
          <button
            onClick={toggleWhiteboard}
            className={`p-2 rounded-md ${selectedTool === "whiteboard" ? "bg-indigo-200" : "hover:bg-indigo-100"}`}
            title="Study Notes"
          >
            <Edit className="h-5 w-5 text-indigo-600" />
          </button>
          <button
            onClick={() => setSelectedTool("quiz")}
            className={`p-2 rounded-md ${selectedTool === "quiz" ? "bg-indigo-200" : "hover:bg-indigo-100"}`}
            title="Quiz"
          >
            <ListChecks className="h-5 w-5 text-indigo-600" />
          </button>
          <button
            onClick={() => setSelectedTool("materials")}
            className={`p-2 rounded-md ${selectedTool === "materials" ? "bg-indigo-200" : "hover:bg-indigo-100"}`}
            title="Lecture Materials"
          >
            <FileText className="h-5 w-5 text-indigo-600" />
          </button>
          <button
            onClick={toggleRagAssistant}
            className={`p-2 rounded-md ${useRagAssistant ? "bg-teal-200" : "hover:bg-indigo-100"}`}
            title="AI Study Assistant"
          >
            <Database className="h-5 w-5 text-teal-600" />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-indigo-100" />

      {/* Main Content Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar: Chapters */}
        {isToolbarOpen && (
          <aside className="w-64 bg-white border-r border-indigo-100 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-indigo-100 flex-shrink-0">
              <h3 className="font-medium text-indigo-800">Chapters</h3>
            </div>
            <div className="p-2 flex-1 overflow-y-auto">
              <div className="space-y-1">
                {chapters.map((chapter, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChapterClick(chapter)}
                    className={`w-full flex items-center px-3 py-2 rounded-md transition duration-300 ${
                      selectedChapter === chapter
                        ? 'bg-indigo-100 text-indigo-800 font-bold'
                        : 'text-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold rounded mr-2">
      {idx + 1}
    </span>
    <span>{chapter}</span>
  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Main Content: Workspace */}
        <div
          className={`flex-1 flex flex-col overflow-hidden relative
            ${isToolbarOpen ? "border-l border-indigo-100" : ""}
            ${isAssistantOpen ? "border-r border-indigo-100" : ""}
          `}
        >
          {/* Button to open assistant if closed */}
          {!isAssistantOpen && (
            <button
              className="absolute top-1.5 right-4 z-30 bg-indigo-600 text-white rounded-full shadow-lg p-2 hover:bg-indigo-700 transition"
              onClick={() => setIsAssistantOpen(true)}
              title="Open Study Assistant"
            >
              <PanelRight className="h-5 w-5" />
            </button>
          )}
          {/* Section Title */}
          <div className="px-4 py-2.5 bg-white flex-shrink-0 border-b border-indigo-100">
            <h1 className="text-xl font-bold text-indigo-900">
              {selectedTool === 'video' && 'Lecture Space'}
              {selectedTool === 'whiteboard' && 'Study Notes'}
              {selectedTool === 'quiz' && 'Quiz'}
              {selectedTool === 'materials' && 'Lecture Materials'}
              {useRagAssistant && selectedTool !== 'quiz' && selectedTool !== 'materials' && selectedTool !== 'video' && selectedTool !== 'whiteboard' && 'AI Study Assistant'}
            </h1>
          </div>
          {/* Main Workspace */}
          <div className="flex-1 p-4 overflow-auto">
            {selectedTool === 'video' && (
              <div className="w-full flex justify-center items-center">
                {selectedChapter && videoUrl ? (
                  <div className="w-full aspect-[16/9] max-w-4xl">
                    <iframe
                      key={videoUrl}
                      className="w-full h-full rounded-lg"
                      src={videoUrl}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <p className="text-indigo-600">Select a chapter to begin</p>
                )}
              </div>
            )}
            {selectedTool === 'whiteboard' && <Whiteboard />}
            {selectedTool === 'quiz' && (
              <div>
                {quizzes.length === 0 ? (
                  <p className="text-indigo-600 text-center ">No quizzes available yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {quizzes.map((quiz) => (
                      <li key={quiz.id} className="bg-indigo-50 p-4 rounded-lg flex justify-between items-center">
                        <span className="font-medium text-indigo-800">{quiz.title}</span>
                        <a
                          href={quiz.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                        >
                          Attempt Quiz
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {selectedTool === 'materials' && (
              <div>
                {materials.length === 0 ? (
                  <p className="text-indigo-600 text-center">No lecture materials uploaded yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {materials.map((material) => (
                      <li key={material.id} className="bg-indigo-50 p-4 rounded-lg flex justify-between items-center">
                        <span className="font-medium text-indigo-800">{material.name}</span>
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                        >
                          View / Download
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Study Assistant */}
        {isAssistantOpen && (
          <div className="w-80 border-l border-indigo-100 bg-white flex flex-col overflow-hidden">
            {useRagAssistant ? (
              <RagStudyAssistant />
            ) : (
              <div className="flex flex-col h-full">
                {/* Assistant Header */}
                <div className="flex-shrink-0 p-3 border-b border-indigo-100 flex justify-between items-center">
                  <h3 className="font-medium text-indigo-800">Study Assistant</h3>
                  <button
                    className="p-1 hover:bg-indigo-50 rounded"
                    onClick={() => setIsAssistantOpen(false)}
                  >
                    <PanelRight className="h-4 w-4 text-indigo-600" />
                  </button>
                </div>
                {/* Assistant Chat */}
                <div
                  className="flex-1 overflow-y-auto"
                  ref={chatContainerRef}
                >
                  <div className="p-3 space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                            message.sender === "user"
                              ? "bg-indigo-600 text-white border-r-4 border-indigo-400 pr-4 shadow"
                              : "bg-indigo-50 text-indigo-800 border-l-4 border-blue-400 pl-4"
                          }`}
                          onClick={() => handleVideoLinkClick(message)}
                          style={{ cursor: message.sender === "bot" ? "pointer" : "default" }}
                        >
                          {message.sender === "bot" ? (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                a: ({node, ...props}) => (
                                  <a
                                    {...props}
                                    className="inline-flex items-center gap-1 text-blue-600 underline hover:text-blue-800 cursor-pointer"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => {
                                      e.preventDefault();
                                      handleVideoLinkClick(message);
                                    }}
                                  >
                                    <LinkIcon className="w-4 h-4 inline" />
                                    {props.children}
                                  </a>
                                ),
                                p: ({node, ...props}) => <p {...props} className="mb-1" />
                              }}
                            >
                              {message.text}
                            </ReactMarkdown>
                          ) : (
                            message.text
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-indigo-50 text-indigo-800 rounded-xl px-3 py-2 text-sm">Thinking...</div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Assistant Input */}
                <div className="flex-shrink-0 p-3 border-t border-indigo-100 bg-white">
                  <div className="flex items-center gap-2">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask for help with your studies..."
                      rows="1"
                      className="flex-1 px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-indigo-50/30 placeholder-indigo-400 text-sm"
                    />
                     {/* Voice Assistant Button */}
  <button
    onClick={handleVoiceInput} // You will define this function
    className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition duration-300"
    title="Voice Assistant"
    type="button"
  >
    <Mic className="w-5 h-5" />
  </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading}
                      className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentStudySpace;