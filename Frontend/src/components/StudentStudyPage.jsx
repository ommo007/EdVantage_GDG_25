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
  FileText,
  ListChecks,
  Mic,
  Download,
  Eye
} from "lucide-react";
import { Link as LinkIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Whiteboard from "./Whiteboard";
import Logo from "./Logo";
import { Client as AppwriteClient, Storage } from 'appwrite';

// Appwrite Configuration
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || "683073a1002d010defbb";
const APPWRITE_BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID || "683073b70000fa32b6d3";

// Initialize Appwrite Client with error handling
let appwriteClient;
let storage;

try {
  appwriteClient = new AppwriteClient()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);
  
  storage = new Storage(appwriteClient);
  console.log("✅ Appwrite client initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize Appwrite client:", error);
  appwriteClient = null;
  storage = null;
}

// Utility function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Utility function to extract subject from filename
const extractSubjectFromFilename = (filename) => {
  const parts = filename.split('_');
  if (parts.length >= 2) {
    return parts[1].replace('.pdf', '').replace('.doc', '').replace('.docx', '');
  }
  return 'General';
};

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
  const [quizzes, setQuizzes] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [materialsError, setMaterialsError] = useState(null);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();

  // Get chapters for the selected subject
   const chapters = subjectChapters[decodeURIComponent(subjectId)] || [];

  // Function to get all files from Appwrite bucket and filter for class 9
  const fetchClass9Files = async () => {
    try {
      // Check if Appwrite client is properly initialized
      if (!storage) {
        console.error("❌ Appwrite storage not initialized");
        throw new Error("Appwrite storage not available. Please check configuration.");
      }

      console.log("🔄 Fetching class 9 files from Appwrite bucket...");
      console.log("📊 Appwrite Config:", {
        endpoint: APPWRITE_ENDPOINT,
        projectId: APPWRITE_PROJECT_ID,
        bucketId: APPWRITE_BUCKET_ID
      });
      
      // Get list of files from the bucket
      const appwriteFiles = await storage.listFiles(APPWRITE_BUCKET_ID);
      console.log(`📁 Found ${appwriteFiles.total} total files in Appwrite bucket.`);
      console.log("📋 All files:", appwriteFiles.files.map(f => f.name));
      
      if (appwriteFiles.files.length === 0) {
        console.log('⚠️ No files found in the Appwrite bucket.');
        return [];
      }
      
      // Filter files that start with "c9"
      const class9Files = appwriteFiles.files.filter(file => {
        const isClass9 = file.name.toLowerCase().startsWith('c9');
        console.log(`🔍 File: ${file.name} - Is Class 9: ${isClass9}`);
        return isClass9;
      });
      
      console.log(`✅ Found ${class9Files.length} class 9 files:`, class9Files.map(f => f.name));
      
      // Transform files to include view and download URLs
      const filesWithUrls = class9Files.map(file => {
        const fileData = {
          id: file.$id,
          name: file.name,
          size: file.sizeOriginal,
          mimeType: file.mimeType,
          createdAt: file.$createdAt,
          viewUrl: `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${file.$id}/view?project=${APPWRITE_PROJECT_ID}`,
          downloadUrl: `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${file.$id}/download?project=${APPWRITE_PROJECT_ID}`
        };
        console.log(`🔗 Generated URLs for ${file.name}:`, {
          view: fileData.viewUrl,
          download: fileData.downloadUrl
        });
        return fileData;
      });
      
      return filesWithUrls;
    } catch (error) {
      console.error('❌ Error fetching files from Appwrite:', error);
      console.error('📝 Error details:', {
        message: error.message,
        code: error.code,
        type: error.type
      });
      throw error; // Re-throw to be caught by the calling function
    }
  };

  // Load materials on component mount
  useEffect(() => {
    const loadMaterials = async () => {
      setMaterialsLoading(true);
      setMaterialsError(null);
      try {
        const files = await fetchClass9Files();
        setMaterials(files);
        console.log(`📦 Set ${files.length} materials in state`);
      } catch (error) {
        console.error('❌ Error in loadMaterials:', error);
        setMaterialsError(error.message);
      } finally {
        setMaterialsLoading(false);
      }
    };
    loadMaterials();
  }, []);

  // Manual refresh function
  const refreshMaterials = async () => {
    setMaterialsLoading(true);
    setMaterialsError(null);
    try {
      const files = await fetchClass9Files();
      setMaterials(files);
      console.log(`🔄 Refreshed materials: ${files.length} files loaded`);
    } catch (error) {
      console.error('❌ Error refreshing materials:', error);
      setMaterialsError(error.message);
    } finally {
      setMaterialsLoading(false);
    }
  };

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
    const urlMatch = message.text.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/);
    if (urlMatch) {
      let videoUrl = urlMatch[0];
      
      // Convert YouTube URLs to embed format
      if (videoUrl.includes('youtube.com/watch')) {
        const videoIdMatch = videoUrl.match(/[?&]v=([^&]+)/);
        if (videoIdMatch) {
          videoUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}`;
        }
      } else if (videoUrl.includes('youtu.be/')) {
        const videoIdMatch = videoUrl.match(/youtu\.be\/([^?&]+)/);
        if (videoIdMatch) {
          videoUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}`;
        }
      }
      
      setVideoUrl(videoUrl);
      setSelectedTool('video');
    }
  };

  const toggleWhiteboard = () => {
    setSelectedTool('whiteboard');
  };

  const fetchAIForChapter = async (subjectId, chapter) => {
  setIsLoading(true);
  try {
    const response = await fetch("https://balmitra-ai-assistant.harshalmore2468.workers.dev/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Find educational videos for the topic "${chapter}" in ${subjectId}. Please provide YouTube video links for learning about ${chapter}.`,
        role: "student"
      })
    });
    const raw = await response.text();
    const data = JSON.parse(raw);

    // Extract video URL from the response text (if present)
    const urlMatch = data.response.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/);
    if (urlMatch) {
      let videoUrl = urlMatch[0];
      
      // Convert YouTube URLs to embed format
      if (videoUrl.includes('youtube.com/watch')) {
        const videoIdMatch = videoUrl.match(/[?&]v=([^&]+)/);
        if (videoIdMatch) {
          videoUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}`;
        }
      } else if (videoUrl.includes('youtu.be/')) {
        const videoIdMatch = videoUrl.match(/youtu\.be\/([^?&]+)/);
        if (videoIdMatch) {
          videoUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}`;
        }
      }
      
      setVideoUrl(videoUrl);
      setSelectedTool('video'); // Switch to video tab
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
    console.error("❌ Chapter video fetch failed:", err);
    setMessages(prev => [...prev, { id: messages.length + 1, text: "Sorry, couldn't find videos for this chapter.", sender: "bot" }]);
  } finally {
    setIsLoading(false);
  }
};

  // When a chapter is clicked, set it as selected and (optionally) fetch videos/materials for it
 const handleChapterClick = (chapter) => {
  setSelectedChapter(chapter);
  
  // Add a user message to show which chapter was selected
  const userMessage = {
    id: messages.length + 1,
    text: `Show me videos for: ${chapter}`,
    sender: "user"
  };
  setMessages(prev => [...prev, userMessage]);
  
  // Fetch videos for the selected chapter
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
            </h1>
          </div>
          {/* Main Workspace */}
          <div className="flex-1 p-4 overflow-auto">
            {selectedTool === 'video' && (
              <div className="w-full flex justify-center items-center">
                {videoUrl ? (
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
                ) : selectedChapter ? (
                  <p className="text-indigo-600">Video will appear here when you click a link from the chat</p>
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
                {materialsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-indigo-600">Loading class 9 materials...</p>
                  </div>
                ) : materialsError ? (
                  <div className="text-center py-8">
                    <div className="text-red-500 mb-4">
                      <FileText className="mx-auto h-16 w-16 mb-2" />
                      <p className="font-semibold">Failed to load materials</p>
                      <p className="text-sm mt-2">{materialsError}</p>
                    </div>
                    <button
                      onClick={refreshMaterials}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : materials.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-16 w-16 text-indigo-300 mb-4" />
                    <p className="text-indigo-600 mb-4">No class 9 lecture materials found.</p>
                    <div className="text-sm text-gray-500 mb-4">
                      <p>Expected file format: c9_SUBJECT.pdf</p>
                      <p>Check browser console for debugging info</p>
                    </div>
                    <button
                      onClick={refreshMaterials}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                      Refresh
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm text-indigo-600">Found {materials.length} class 9 materials</p>
                      <button
                        onClick={refreshMaterials}
                        className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                      >
                        Refresh
                      </button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      {materials.map((material) => (
                        <div key={material.id} className="bg-white border border-indigo-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-indigo-900 text-sm mb-1">
                                {material.name}
                              </h3>
                              <div className="text-xs text-indigo-600 space-y-1">
                                <p>Subject: {extractSubjectFromFilename(material.name)}</p>
                                <p>Size: {formatFileSize(material.size)}</p>
                                <p>Type: {material.mimeType}</p>
                                <p>Added: {new Date(material.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex-shrink-0 ml-3">
                              <FileText className="h-8 w-8 text-indigo-400" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={material.viewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded text-sm font-medium hover:bg-indigo-200 transition-colors flex items-center justify-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </a>
                            <a
                              href={material.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Study Assistant */}
        {isAssistantOpen && (
          <div className="w-80 border-l border-indigo-100 bg-white flex flex-col overflow-hidden">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentStudySpace;