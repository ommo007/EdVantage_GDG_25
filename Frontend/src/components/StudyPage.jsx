"use client"

import { useState } from "react"
import { ChevronDown, User, LogOut, Calendar, MessageSquare, Edit, Menu, BookOpen, Settings } from "lucide-react"
import Whiteboard from "./Whiteboard"

const StudyPage = () => {
  const [selectedDay, setSelectedDay] = useState(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello, I need help with my math homework.", sender: "user" },
    { id: 2, text: "Of course! I'd be happy to help. What specific topic in math are you working on?", sender: "bot" },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false)

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
          text: "Here is a helpful video: https://www.youtube.com/watch?v=i35AUg11hvo", // Example link
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
    }
  }

  const toggleWhiteboard = () => {
    setIsWhiteboardOpen(!isWhiteboardOpen)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <header className="bg-white shadow-sm border-b border-indigo-100 h-14">
        <nav className="container mx-auto px-4 h-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 hover:bg-indigo-50 rounded-md transition duration-300"
            >
              <Menu className="h-5 w-5 text-indigo-600" />
            </button>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              <div className="text-2xl font-bold text-indigo-700">
                Edva<span className="text-purple-600">ntage</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 text-indigo-700 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md transition duration-300"
            >
              <User className="h-5 w-5" />
              <span>John Doe</span>
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
                <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 focus:outline-none focus:bg-red-100">
                  <LogOut className="inline-block w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <aside
          className={`fixed md:relative bg-white border-r border-indigo-100 w-64 h-full transition-all duration-300 ease-in-out transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-20"
          } z-30`}
        >
          <div className="p-4">
            <h2 className={`text-xl font-bold text-indigo-900 mb-4 ${!isSidebarOpen && "md:hidden"}`}>Study Planner</h2>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`w-full flex items-center px-3 py-2 rounded-md transition duration-300 ${
                    selectedDay === day ? "bg-indigo-50 text-indigo-600" : "text-indigo-600 hover:bg-indigo-50"
                  }`}
                >
                  <Calendar className="w-4 h-4 min-w-[16px]" />
                  <span className={`ml-2 ${!isSidebarOpen && "md:hidden"}`}>Day {day}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className={`flex-1 flex transition-all duration-300 ${isSidebarOpen ? "md:ml-0" : "md:ml-20"}`}>
          {/* Lecture Space */}
          <div className="flex-1 p-4">
            <div className="mb-2 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-indigo-900">Lecture Space</h2>
              <button
                onClick={toggleWhiteboard}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300"
              >
                <Edit className="w-4 h-4 mr-2" />
                {isWhiteboardOpen ? "Close Whiteboard" : "Whiteboard"}
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-indigo-100 p-4 h-[calc(100vh-140px)]">
              {isWhiteboardOpen ? (
                <Whiteboard />
              ) : (
                <div className="h-full flex items-center justify-center">
                  {videoUrl ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={videoUrl.replace("watch?v=", "embed/") + "?rel=0"}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <p className="text-indigo-600">Select a lecture to begin</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* AI Chat Assistant */}
          <div className="w-96 border-l border-indigo-100 bg-white flex flex-col h-[calc(100vh-56px)]">
            {/* Chat Header */}
            <div className="flex-none p-4 border-b border-indigo-100">
              <h2 className="text-xl font-bold text-indigo-900">AI Assistant</h2>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent hover:scrollbar-thumb-indigo-300">
              <div className="p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
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
                    <div className="bg-indigo-50 text-indigo-800 rounded-2xl px-4 py-2">Thinking...</div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Container - Fixed at bottom */}
            <div className="flex-none p-4 border-t border-indigo-100 bg-white">
              <div className="flex items-center gap-2">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows="1"
                  className="flex-1 px-4 py-2 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-indigo-50/30 placeholder-indigo-400"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudyPage

