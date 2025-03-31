import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Users, BookOpen, Calendar, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardHeader from './shared/DashboardHeader';

const ClassSelectionPage = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState(['All', 'Math', 'Science', 'Computer Science', 'Languages', 'History']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Mock classes data
  const [allClasses, setAllClasses] = useState([
    { 
      id: 1, 
      name: "Introduction to Calculus", 
      instructor: "Dr. Jane Smith", 
      category: "Math",
      students: 28,
      schedule: "Mon, Wed, Fri 10:00 AM",
      description: "Learn the fundamentals of calculus, including limits, derivatives, and integrals."
    },
    { 
      id: 2, 
      name: "Physics 101", 
      instructor: "Prof. Robert Johnson", 
      category: "Science",
      students: 24,
      schedule: "Tue, Thu 11:00 AM",
      description: "An introductory course covering mechanics, thermodynamics, and waves."
    },
    { 
      id: 3, 
      name: "Programming Basics", 
      instructor: "Dr. Michael Chen", 
      category: "Computer Science",
      students: 32,
      schedule: "Mon, Wed 2:00 PM",
      description: "Introduction to programming concepts using Python."
    },
    { 
      id: 4, 
      name: "World History", 
      instructor: "Prof. Emily Davis", 
      category: "History",
      students: 35,
      schedule: "Tue, Thu 9:00 AM",
      description: "Explore the major events that shaped our world from ancient civilizations to modern times."
    },
    { 
      id: 5, 
      name: "Spanish for Beginners", 
      instructor: "Maria Rodriguez", 
      category: "Languages",
      students: 20,
      schedule: "Fri 1:00 PM",
      description: "Learn basic Spanish vocabulary, grammar, and conversation skills."
    }
  ]);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleJoinClass = (classId) => {
    // In a real app, you'd call an API to join the class
    console.log(`Joining class ${classId}`);
    
    // Navigate to the class study page
    navigate(`/study/${classId}`);
  };

  // Filter classes based on search term and category
  const filteredClasses = allClasses.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         cls.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || cls.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <DashboardHeader userRole={userRole} />
      
      <main className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(`/${userRole}`)}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>
        
        <h1 className="text-3xl font-bold text-indigo-900 mb-2">Available Classes</h1>
        <p className="text-indigo-600 mb-8">Browse and join classes to start learning</p>
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by class name or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-indigo-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-md whitespace-nowrap ${
                  selectedCategory === category 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Classes Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 text-center">
            <BookOpen className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-indigo-900 mb-2">No classes found</h3>
            <p className="text-indigo-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map(cls => (
              <div 
                key={cls.id}
                className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-indigo-900">{cls.name}</h3>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-600 text-xs rounded-full">{cls.category}</span>
                  </div>
                  
                  <p className="text-indigo-600 mb-1">Instructor: {cls.instructor}</p>
                  
                  <div className="flex items-center text-sm text-indigo-500 mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    {cls.schedule}
                  </div>
                  
                  <div className="flex items-center text-sm text-indigo-500 mb-4">
                    <Users className="h-4 w-4 mr-1" />
                    {cls.students} students enrolled
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-6">{cls.description}</p>
                  
                  <button
                    onClick={() => handleJoinClass(cls.id)}
                    className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Join Class
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClassSelectionPage;


