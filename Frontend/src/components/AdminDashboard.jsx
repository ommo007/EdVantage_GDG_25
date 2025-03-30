"use client"

import { useState } from "react"
import { User, LogOut, Settings, Search, ChevronDown, ChevronRight } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import Logo from "./Logo"

const classes = [
  { id: 1, name: "Mathematics 101", description: "Introduction to basic mathematics" },
  { id: 2, name: "Physics 101", description: "Fundamentals of physics" },
  { id: 3, name: "Chemistry 101", description: "Basic chemistry concepts" },
  { id: 4, name: "Biology 101", description: "Introduction to biology" },
]

const instructors = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Smith" },
  { id: 3, name: "Bob Johnson" },
]

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [assignments, setAssignments] = useState({})
  const navigate = useNavigate()

  const handleAssignInstructor = (classId, instructorId) => {
    setAssignments((prev) => ({
      ...prev,
      [classId]: instructorId,
    }))
  }
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.description.toLowerCase().includes(searchTerm.toLowerCase()),
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
        <h1 className="text-3xl font-bold text-indigo-900 mb-6">Admin Dashboard</h1>

        {/* Admin actions menu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link 
            to="/admin/classes" 
            className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 hover:shadow-md transition-all duration-300"
          >
            <h3 className="text-xl font-semibold text-indigo-900">Manage Classes</h3>
            <p className="text-indigo-600 mt-2">View and assign classes to instructors</p>
          </Link>
          
          <Link 
            to="/admin/study-space" 
            className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 hover:shadow-md transition-all duration-300"
          >
            <h3 className="text-xl font-semibold text-indigo-900">Study Spaces</h3>
            <p className="text-indigo-600 mt-2">Monitor active learning environments</p>
          </Link>
          
          <Link 
            to="/admin" 
            className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 hover:shadow-md transition-all duration-300"
          >
            <h3 className="text-xl font-semibold text-indigo-900">User Management</h3>
            <p className="text-indigo-600 mt-2">Manage students and instructors</p>
          </Link>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-indigo-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white placeholder-indigo-300"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-indigo-100 hover:shadow-md transition-all duration-300"
            >
              <h3 className="text-xl font-semibold text-indigo-900 mb-2">{cls.name}</h3>
              <p className="text-indigo-600 mb-4">{cls.description}</p>
              <div className="relative">
                <select
                  value={assignments[cls.id] || ""}
                  onChange={(e) => handleAssignInstructor(cls.id, e.target.value)}
                  className="w-full px-4 py-2 border border-indigo-100 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-indigo-700"
                >
                  <option value="">Assign Instructor</option>
                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Link
            to="/admin/class-selection"
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-300 font-medium flex items-center"
          >
            View Assigned Classes
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard


