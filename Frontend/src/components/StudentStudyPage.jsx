"use client"

import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
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
  Database
} from "lucide-react"
import Whiteboard from "./Whiteboard"
import Logo from "./Logo"
import RagStudyAssistant from "./study/RagStudyAssistant"

const StudentStudySpace = () => {
  const [selectedDay, setSelectedDay] = useState(1) // Default to day 1
  const [selectedTool, setSelectedTool] = useState('video')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isToolbarOpen, setIsToolbarOpen] = useState(true)
  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome to your study space! How can I help you today?", sender: "bot" },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false)
  const [useRagAssistant, setUseRagAssistant] = useState(false)
  
  const navigate = useNavigate()
  const { classId } = useParams()
  const userRole = "student"

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(`/${userRole}`);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
    }
    setMessages((prev) => [...prev, newUserMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      // Simulate AI response for now
      setTimeout(() => {
        const botMessage = {
          id: messages.length + 2,
          text: "Here is a helpful lecture: https://www.youtube.com/watch?v=i35AUg11hvo", // Example link
          sender: "bot",
        }
        setMessages((prev) => [...prev, botMessage])
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error:", error)
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleVideoLinkClick = (message) => {
    const urlMatch = message.text.match(/https?:\/\/[\w./?=&%-]+/)
    if (urlMatch) {
      setVideoUrl(urlMatch[0]) // Extract the URL and set it for the video player
      setSelectedTool('video')
    }
  }

  const toggleWhiteboard = () => {
    setIsWhiteboardOpen(!isWhiteboardOpen)
    setSelectedTool('whiteboard')
  }

  const toggleRagAssistant = () => {
    setUseRagAssistant(!useRagAssistant)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col">
      {/* Top Toolbar/Menu Bar */}
      <header className="bg-white shadow-sm border-b border-indigo-100 h-14">
        <nav className="container mx-auto px-4 h-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo />
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleGoBack}
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
                    onClick={handleLogout}
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

      {/* Secondary Toolbar for Tools */}
      <div className="bg-indigo-50 border-b border-indigo-100 py-1 px-4">
        <div className="flex items-center space-x-2">
          {/* Sidebar Toggle */}
          <button
            onClick={() => setIsToolbarOpen(!isToolbarOpen)}
            className="p-1.5 hover:bg-indigo-100 rounded-md transition duration-300"
          >
            <Menu className="h-5 w-5 text-indigo-600" />
          </button>

          {/* Lecture Viewer */}
          <button
            onClick={() => setSelectedTool('video')}
            className={`p-2 rounded-md ${selectedTool === 'video' ? 'bg-indigo-200' : 'hover:bg-indigo-100'}`}
          >
            <BookOpen className="h-5 w-5 text-indigo-600" />
          </button>

          {/* Whiteboard */}
          <button
            onClick={toggleWhiteboard}
            className={`p-2 rounded-md ${selectedTool === 'whiteboard' ? 'bg-indigo-200' : 'hover:bg-indigo-100'}`}
          >
            <Edit className="h-5 w-5 text-indigo-600" />
          </button>

          {/* RAG Assistant */}
          <button
            onClick={toggleRagAssistant}
            className={`p-2 rounded-md ${useRagAssistant ? 'bg-teal-200' : 'hover:bg-indigo-100'}`}
            title="AI Study Assistant"
          >
            <Database className="h-5 w-5 text-teal-600" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 h-[calc(100vh-92px)]">
        {/* Left Sidebar - Study Plan */}
        {isToolbarOpen && (
          <aside className="w-64 bg-white border-r border-indigo-100 flex flex-col">
            <div className="p-3 border-b border-indigo-100">
              <h3 className="font-medium text-indigo-800">Study Plan</h3>
            </div>
            <div className="p-2 flex-1 overflow-y-auto">
              <div className="space-y-1">
                {[1, 2, 3, 4, 5].map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`w-full flex items-center px-3 py-2 rounded-md transition duration-300 ${
                      selectedDay === day 
                        ? 'bg-indigo-100 text-indigo-800' 
                        : 'text-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    <Calendar className="w-4 h-4 min-w-[16px]" />
                    <span className="ml-2">Day {day}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Main Center Panel - Lecture Space */}
        <div className="flex-1 flex flex-col">
          {/* Workspace Area */}
          <div className="p-1 bg-white">
            <h1 className="text-xl font-bold text-indigo-900">
              {selectedTool === 'video' && 'Lecture Space'}
              {selectedTool === 'whiteboard' && 'Study Notes'}
            </h1>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {selectedTool === 'video' && (
              <div className="h-full flex items-center justify-center">
                {videoUrl ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={videoUrl.replace("watch?v=", "embed/") + "?rel=0"}
                    title="Lecture Video Player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <p className="text-indigo-600">Select a lecture from your study plan or ask the assistant for help</p>
                )}
              </div>
            )}

            {selectedTool === 'whiteboard' && <Whiteboard />}
          </div>
        </div>

        {/* Right Panel - AI Assistant */}
        <div className="w-80 border-l border-indigo-100 bg-white flex flex-col">
          {useRagAssistant ? (
            <RagStudyAssistant />
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex-none p-3 border-b border-indigo-100 flex justify-between items-center">
                <h3 className="font-medium text-indigo-800">Study Assistant</h3>
                <button className="p-1 hover:bg-indigo-50 rounded">
                  <PanelRight className="h-4 w-4 text-indigo-600" />
                </button>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent hover:scrollbar-thumb-indigo-300">
                <div className="p-3 space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                          message.sender === "user" ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-800"
                        }`}
                        onClick={() => handleVideoLinkClick(message)}
                        style={{ cursor: message.sender === "bot" ? "pointer" : "default" }}
                      >
                        {message.text}
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

              {/* Input Container */}
              <div className="flex-none p-3 border-t border-indigo-100 bg-white">
                <div className="flex items-center gap-2">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask for help with your studies..."
                    rows="1"
                    className="flex-1 px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-indigo-50/30 placeholder-indigo-400 text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading}
                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentStudySpace