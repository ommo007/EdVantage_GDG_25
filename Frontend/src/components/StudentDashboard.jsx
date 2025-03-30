import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, 
  User, 
  ChevronDown, 
  Settings, 
  LogOut,
  BookOpenCheck,
  GraduationCap,
  BarChart2,
  Calendar,
  ArrowRight
} from 'lucide-react';

// Mock data for enrolled courses
const mockEnrolledCourses = [
  {
    id: 1,
    name: "Mathematics 101",
    subject: "Basic Algebra",
    instructor: "Prof. John Doe",
    progress: 68,
    nextClass: "Tomorrow, 10:00 AM"
  },
  {
    id: 2,
    name: "Physics Fundamentals",
    subject: "Mechanics",
    instructor: "Dr. Jane Smith",
    progress: 42,
    nextClass: "Today, 3:30 PM"
  },
  {
    id: 3,
    name: "Introduction to Biology",
    subject: "Cell Structure",
    instructor: "Prof. Robert Johnson",
    progress: 95,
    nextClass: "Wednesday, 9:00 AM"
  }
];

const StudentDashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Use mock data instead of API call
      setEnrolledCourses(mockEnrolledCourses);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseSelect = (courseId) => {
    navigate(`/study/${courseId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-indigo-100 h-14">
        <nav className="container mx-auto px-4 h-full flex justify-between items-center">
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
              <span>Student</span>
              <ChevronDown className={`h-4 w-4 transform transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`} />
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-900">Your Learning Dashboard</h1>
          <p className="text-indigo-600 mt-2">Continue your learning journey</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <BookOpenCheck className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-indigo-900">In Progress</h3>
                <p className="text-3xl font-bold text-indigo-700">{enrolledCourses.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-indigo-900">Completed</h3>
                <p className="text-3xl font-bold text-indigo-700">2</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-indigo-900">Overall Progress</h3>
                <p className="text-3xl font-bold text-indigo-700">68%</p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-indigo-900 mb-4">Your Courses</h2>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <button
                key={course.id}
                onClick={() => handleCourseSelect(course.id)}
                className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 hover:border-indigo-300 transition-all duration-300 text-left group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-900">{course.name}</h3>
                    <p className="text-indigo-600 mt-1">{course.subject}</p>
                    <p className="text-sm text-gray-500 mt-2">Instructor: {course.instructor}</p>
                    
                    <div className="mt-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-indigo-600">Progress</span>
                        <span className="text-sm font-medium text-indigo-800">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-indigo-100 rounded-full h-2.5">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-4 text-sm text-indigo-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Next: {course.nextClass}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600 transform group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <Link
            to="/student/classes"
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-300 font-medium flex items-center"
          >
            Explore More Courses
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
