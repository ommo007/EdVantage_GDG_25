import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users,
  Filter,
  ArrowRight,
  BookOpen,
  Calendar,
  Bell,
  CheckCircle,
  Clock,
  Search,
  Tag
} from 'lucide-react';

import DashboardHeader from './shared/DashboardHeader';
import StatCard from './shared/StatCard';
import SearchBar from './dashboard/SearchBar';
import NotificationsPanel from './dashboard/NotificationsPanel';
import DashboardInitializer from './shared/DashboardInitializer';

// Mock data for assigned classes (standards/grades)
const mockClasses = [
  {
    id: 1,
    name: "Standard 5",
    section: "A",
    studentCount: 25,
    lastLecture: "2025-03-30",
    nextSchedule: "2025-04-05 9:00 AM",
    status: "active",
    recentActivity: "Mathematics quiz submitted by 18 students",
    subjects: ["Mathematics", "Science", "English"]
  },
  {
    id: 2,
    name: "Standard 6",
    section: "B",
    studentCount: 20,
    lastLecture: "2025-03-28",
    nextSchedule: "2025-04-04 11:00 AM",
    status: "active",
    recentActivity: "Science assignment deadline tomorrow",
    subjects: ["Science", "Social Studies"]
  },
  {
    id: 3,
    name: "Standard 5",
    section: "B",
    studentCount: 22,
    lastLecture: "2025-03-25",
    nextSchedule: "2025-04-03 2:00 PM",
    status: "inactive",
    recentActivity: "No recent activity",
    subjects: ["Mathematics", "Science"]
  },
  {
    id: 4,
    name: "Standard 8",
    section: "A",
    studentCount: 28,
    lastLecture: "2025-03-29",
    nextSchedule: "2025-04-06 10:30 AM",
    status: "active",
    recentActivity: "English live lecture scheduled",
    subjects: ["English", "Social Studies"]
  }
];

const AssignedClasses = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchClassesData();
  }, []);

  const fetchClassesData = async () => {
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
    navigate(`/instructor/class/${classId}`);
  };

  // Filter classes based on search term and status filter
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cls.section.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cls.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Total number of students across all classes
  const totalStudents = classes.reduce((sum, cls) => sum + cls.studentCount, 0);

  return (
    <DashboardInitializer expectedRole="teacher">
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
        {/* Header */}
        <DashboardHeader userRole="teacher" />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-indigo-900">Assigned Classes</h1>
              <p className="text-indigo-600 mt-2">Manage your assigned standards and sections</p>
            </div>
            <div className="flex items-center space-x-4">
              <SearchBar 
                placeholder="Search classes..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
              <NotificationsPanel />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard 
              icon={<BookOpen className="h-6 w-6 text-indigo-600" />}
              title="Assigned Classes"
              value={classes.length}
              bgColor="bg-indigo-100"
              textColor="text-indigo-700"
            />
            
            <StatCard 
              icon={<Users className="h-6 w-6 text-purple-600" />}
              title="Total Students"
              value={totalStudents}
              bgColor="bg-purple-100"
              textColor="text-purple-700"
            />
            
            <StatCard 
              icon={<Calendar className="h-6 w-6 text-blue-600" />}
              title="Sessions This Week"
              value="12"
              bgColor="bg-blue-100"
              textColor="text-blue-700"
            />
            
            <StatCard 
              icon={<CheckCircle className="h-6 w-6 text-green-600" />}
              title="Completed Sessions"
              value="24"
              bgColor="bg-green-100"
              textColor="text-green-700"
            />
          </div>

          {/* Filter Section */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center mr-4">
              <Filter className="h-5 w-5 text-indigo-600 mr-2" />
              <span className="text-indigo-900 font-medium">Filter:</span>
            </div>
            
            <button 
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                statusFilter === "all" 
                  ? "bg-indigo-600 text-white" 
                  : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
              }`}
              onClick={() => setStatusFilter("all")}
            >
              All Classes
            </button>
            
            <button 
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                statusFilter === "active" 
                  ? "bg-indigo-600 text-white" 
                  : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
              }`}
              onClick={() => setStatusFilter("active")}
            >
              Active
            </button>
            
            <button 
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                statusFilter === "inactive" 
                  ? "bg-indigo-600 text-white" 
                  : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
              }`}
              onClick={() => setStatusFilter("inactive")}
            >
              Inactive
            </button>
          </div>

          {/* Classes List */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 text-center">
              <BookOpen className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-indigo-900 mb-2">No classes found</h3>
              <p className="text-indigo-600 mb-4">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((classItem) => (
                <div 
                  key={classItem.id} 
                  className={`bg-white rounded-xl shadow-sm border ${
                    classItem.status === "active" 
                      ? "border-indigo-200" 
                      : "border-gray-200"
                  } hover:shadow-md transition-all duration-300 overflow-hidden`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-indigo-900">{classItem.name}</h3>
                        <p className="text-indigo-600">Section {classItem.section}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        classItem.status === "active" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {classItem.status === "active" ? "Active" : "Inactive"}
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-5">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-indigo-600 mr-2" />
                        <span className="text-indigo-800">{classItem.studentCount} Students</span>
                      </div>
                      
                      <div className="flex items-start">
                        <Tag className="h-4 w-4 text-indigo-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-indigo-800">
                          {classItem.subjects.join(", ")}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-indigo-600 mr-2" />
                        <span className="text-indigo-800">
                          Next: {new Date(classItem.nextSchedule).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-start">
                        <Bell className="h-4 w-4 text-indigo-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-indigo-800">
                          {classItem.recentActivity}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleClassSelect(classItem.id)}
                      className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 font-medium flex items-center justify-center"
                    >
                      Go to Classroom
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </DashboardInitializer>
  );
};

export default AssignedClasses;