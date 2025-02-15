"use client"

import { useState } from "react"
import { ChevronDown, User, LogOut, Settings, Search, BookOpen, ChevronRight } from "lucide-react"

const classCategories = [
  {
    name: "Kindergarten",
    description: "Foundation years of learning through play and discovery",
    gradient: "from-pink-500 to-rose-500",
    classes: [
      { id: "kg1", name: "KG 1", icon: "🎨", subjects: ["Basic Numbers", "Letters", "Arts"] },
      { id: "kg2", name: "KG 2", icon: "🧩", subjects: ["Numbers", "Words", "Crafts"] },
    ],
  },
  {
    name: "Primary",
    description: "Building fundamental knowledge and skills",
    gradient: "from-blue-500 to-cyan-500",
    classes: [
      { id: "grade1", name: "Grade 1", icon: "📚", subjects: ["Math", "English", "Science"] },
      { id: "grade2", name: "Grade 2", icon: "✏️", subjects: ["Math", "English", "Science"] },
      { id: "grade3", name: "Grade 3", icon: "🔢", subjects: ["Math", "English", "Science"] },
      { id: "grade4", name: "Grade 4", icon: "🌍", subjects: ["Math", "English", "Science", "Social Studies"] },
      { id: "grade5", name: "Grade 5", icon: "🧪", subjects: ["Math", "English", "Science", "Social Studies"] },
    ],
  },
  {
    name: "Secondary",
    description: "Advancing knowledge with specialized subjects",
    gradient: "from-purple-500 to-indigo-500",
    classes: [
      { id: "grade6", name: "Grade 6", icon: "🔬", subjects: ["Math", "Science", "Language Arts"] },
      { id: "grade7", name: "Grade 7", icon: "📐", subjects: ["Algebra", "Biology", "Literature"] },
      { id: "grade8", name: "Grade 8", icon: "🧬", subjects: ["Geometry", "Chemistry", "History"] },
      { id: "grade9", name: "Grade 9", icon: "🔭", subjects: ["Physics", "World History", "Literature"] },
      { id: "grade10", name: "Grade 10", icon: "💻", subjects: ["Advanced Math", "Biology", "Computer Science"] },
    ],
  },
  {
    name: "Higher Secondary",
    description: "Preparing for higher education and specialization",
    gradient: "from-emerald-500 to-teal-500",
    classes: [
      { id: "grade11", name: "Grade 11", icon: "🧠", subjects: ["Physics", "Chemistry", "Mathematics"] },
      { id: "grade12", name: "Grade 12", icon: "🎓", subjects: ["Advanced Physics", "Advanced Chemistry", "Calculus"] },
    ],
  },
]

const ClassSelectionPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [expandedSubjects, setExpandedSubjects] = useState({})

  const handleNavigateToStudy = (classId) => {
    console.log(`Navigating to /study/${classId}`)
  }

  const toggleSubjects = (classId) => {
    setExpandedSubjects((prev) => ({
      ...prev,
      [classId]: !prev[classId],
    }))
  }

  const filteredCategories = classCategories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.classes.some(
        (cls) =>
          cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cls.subjects.some((subject) => subject.toLowerCase().includes(searchTerm.toLowerCase())),
      ),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <header className="bg-white border-b border-indigo-100">
        <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            <div className="text-2xl font-bold text-indigo-700">
              Edva<span className="text-purple-600">ntage</span>
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

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for classes or subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-indigo-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white placeholder-indigo-300"
            />
          </div>
        </div>

        <div className="space-y-8">
          {filteredCategories.map((category) => (
            <section
              key={category.name}
              className="bg-white rounded-lg border border-indigo-100 overflow-hidden transition-all duration-300 hover:shadow-md"
            >
              <button
                onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                className={`w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r ${category.gradient} hover:opacity-90 transition-all duration-300`}
              >
                <div>
                  <h2 className="text-2xl font-bold text-white">{category.name}</h2>
                  <p className="text-white/90 mt-1">{category.description}</p>
                </div>
                <ChevronRight
                  className={`h-6 w-6 text-white transform transition-transform duration-300 ${
                    selectedCategory === category.name ? "rotate-90" : ""
                  }`}
                />
              </button>

              <div
                className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6 transition-all duration-300 ${
                  selectedCategory === category.name ? "block" : "hidden"
                }`}
              >
                {category.classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="bg-white p-6 rounded-lg border border-indigo-100 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-md group"
                  >
                    <button
                      onClick={() => handleNavigateToStudy(cls.id)}
                      className="w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-2"
                    >
                      <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform duration-300">
                        {cls.icon}
                      </span>
                      <h3 className="text-indigo-900 font-semibold text-lg mb-2">{cls.name}</h3>
                    </button>
                    <button
                      onClick={() => toggleSubjects(cls.id)}
                      className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md px-3 py-1"
                    >
                      {expandedSubjects[cls.id] ? "Hide Subjects" : "View All Subjects"}
                    </button>
                    {expandedSubjects[cls.id] && (
                      <div className="mt-3 text-sm text-indigo-600">
                        {cls.subjects.map((subject, idx) => (
                          <div key={idx} className="py-1">
                            {subject}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}

export default ClassSelectionPage

