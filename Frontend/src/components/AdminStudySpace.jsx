"use client"

import { useState } from "react"
import { User, LogOut, Settings, Search, ChevronDown, Eye, ChevronLeft } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import Logo from "./Logo"

const studySpaces = [
  { id: 1, name: "Mathematics 101", instructor: "John Doe", students: 25, lastActive: "2 hours ago" },
  { id: 2, name: "Physics 101", instructor: "Jane Smith", students: 20, lastActive: "1 day ago" },
  { id: 3, name: "Chemistry 101", instructor: "Bob Johnson", students: 18, lastActive: "3 hours ago" },
  { id: 4, name: "Biology 101", instructor: "Alice Williams", students: 22, lastActive: "5 minutes ago" },
]

const AdminStudySpace = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const navigate = useNavigate()
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const filteredSpaces = studySpaces.filter(
    (space) =>
      space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      space.instructor.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <header className="bg-white border-b border-indigo-100">
        <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Logo />
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 text-indigo-700 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md transition duration-300"
            >
              <User className="h-5 w-5" />
              <span>Admin</span>
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
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-900">Study Spaces</h1>
          <Link
            to="/admin"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300 font-medium flex items-center"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for classes or instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-indigo-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white placeholder-indigo-300"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow-sm rounded-lg">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">
                  Instructor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-100">
              {filteredSpaces.map((space) => (
                <tr key={space.id} className="hover:bg-indigo-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-900">{space.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{space.instructor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{space.students}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{space.lastActive}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 focus:outline-none focus:underline">
                      <Eye className="inline-block w-5 h-5 mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

export default AdminStudySpace


