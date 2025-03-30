import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  ChevronDown, 
  Settings, 
  LogOut,
  Users,
  Calendar,
  ArrowRight
} from 'lucide-react';
import Logo from './Logo';

  
  // Then modify the fetchInstructorClasses function to use mock data
  const mockClasses = [
    {
      id: 1,
      name: "Mathematics 101",
      subject: "Basic Mathematics",
      studentCount: 25,
      schedule: "Mon, Wed, Fri 9:00 AM"
    },
    {
      id: 2,
      name: "Physics Advanced",
      subject: "Classical Mechanics",
      studentCount: 20,
      schedule: "Tue, Thu 11:00 AM"
    },
    {
      id: 3,
      name: "Chemistry Lab",
      subject: "Organic Chemistry",
      studentCount: 15,
      schedule: "Wed, Fri 2:00 PM"
    }
  ];
  
  // Then modify the fetchInstructorClasses function to use mock data
 
const InstructorDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInstructorClasses();
  }, []);

  const fetchInstructorClasses = async () => {
    try {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Use mock data instead of API call
      setClasses(mockClasses);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassSelect = (classId) => {
    navigate(`/study/${classId}`);
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
          <Logo />
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 text-indigo-700 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md transition duration-300"
            >
              <User className="h-5 w-5" />
              <span>Instructor</span>
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-indigo-900">Your Classes</h1>
            <p className="text-indigo-600 mt-2">Select a class to begin teaching</p>
          </div>
          <Link
            to="/instructor/classes"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300 font-medium flex items-center"
          >
            Browse All Classes
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

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
            {classes.map((classItem) => (
              <button
                key={classItem.id}
                onClick={() => handleClassSelect(classItem.id)}
                className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 hover:border-indigo-300 transition-all duration-300 text-left group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-900">{classItem.name}</h3>
                    <p className="text-indigo-600 mt-1">{classItem.subject}</p>
                    <div className="flex items-center mt-4 text-sm text-indigo-500">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{classItem.studentCount} Students</span>
                    </div>
                    <div className="flex items-center mt-2 text-sm text-indigo-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{classItem.schedule}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600 transform group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};


export default InstructorDashboard;