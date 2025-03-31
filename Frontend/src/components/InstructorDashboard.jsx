import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users,
  Calendar,
  ArrowRight,
  BookOpen,
  FilePlus,
  Activity,
  CheckCircle,
  Clock,
  GraduationCap,
  Database
} from 'lucide-react';

import DashboardHeader from './shared/DashboardHeader';
import StatCard from './shared/StatCard';
import CourseCard from './dashboard/CourseCard';
import SearchBar from './dashboard/SearchBar';
import NotificationsPanel from './dashboard/NotificationsPanel';
import RagInfoCard from './shared/RagInfoCard';
import DashboardInitializer from './shared/DashboardInitializer';

// Mock data for instructor classes
const mockClasses = [
  {
    id: 1,
    name: "Mathematics 101",
    subject: "Basic Mathematics",
    studentCount: 25,
    schedule: "Mon, Wed, Fri 9:00 AM",
    completionRate: 68
  },
  {
    id: 2,
    name: "Physics Advanced",
    subject: "Classical Mechanics",
    studentCount: 20,
    schedule: "Tue, Thu 11:00 AM",
    completionRate: 42
  },
  {
    id: 3,
    name: "Chemistry Lab",
    subject: "Organic Chemistry",
    studentCount: 15,
    schedule: "Wed, Fri 2:00 PM",
    completionRate: 95
  }
];

// Mock data for pending tasks
const mockPendingTasks = [
  { id: 1, title: "Grade Math 101 Assignments", dueDate: "Today", count: 15 },
  { id: 2, title: "Prepare Physics Lecture Notes", dueDate: "Tomorrow", count: null },
  { id: 3, title: "Review Student Questions", dueDate: "Friday", count: 8 }
];

const InstructorDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Use mock data instead of API call
      setClasses(mockClasses);
      setPendingTasks(mockPendingTasks);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassSelect = (classId) => {
    navigate(`/study/${classId}`);
  };

  // Calculate total students from all classes
  const totalStudents = classes.reduce((sum, cls) => sum + cls.studentCount, 0);

  // Filter classes based on search term
  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardInitializer expectedRole="instructor">
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
        {/* Header */}
        <DashboardHeader userRole="instructor" />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-indigo-900">Instructor Dashboard</h1>
              <p className="text-indigo-600 mt-2">Manage your classes and students</p>
            </div>
            <div className="flex items-center space-x-4">
              <SearchBar 
                placeholder="Search your classes..."
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
              title="Active Classes"
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
              icon={<Activity className="h-6 w-6 text-blue-600" />}
              title="Avg. Engagement"
              value="76%"
              bgColor="bg-blue-100"
              textColor="text-blue-700"
            />
            
            <StatCard 
              icon={<CheckCircle className="h-6 w-6 text-green-600" />}
              title="Tasks Completed"
              value="12/15"
              bgColor="bg-green-100"
              textColor="text-green-700"
            />
            
            <StatCard 
              icon={<Database className="h-6 w-6 text-teal-600" />}
              title="RAG Materials"
              value={classes.length > 0 ? `${Math.floor(Math.random() * 10) + 5}` : "0"}
              bgColor="bg-teal-100"
              textColor="text-teal-700"
            />
          </div>

          {/* RAG Study Materials Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-indigo-900 flex items-center">
                <Database className="h-5 w-5 mr-2 text-indigo-600" />
                AI-Powered Materials (RAG)
              </h2>
              <Link
                to={`/instructor/study-materials/${classes.length > 0 ? classes[0].id : 'default'}`}
                className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm font-medium"
              >
                Manage all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
              <p className="text-indigo-700 mb-4">
                Use Retrieval Augmented Generation (RAG) with Gemini 2.5 Pro to create intelligent study materials that students can query.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {classes.slice(0, 3).map((cls) => (
                  <div key={cls.id} className="border border-indigo-100 rounded-lg p-4 hover:border-indigo-300 transition-all duration-300">
                    <h3 className="font-medium text-indigo-900 mb-2">{cls.name}</h3>
                    <div className="flex justify-between items-center text-sm text-indigo-600 mb-3">
                      <span>Materials: {Math.floor(Math.random() * 5) + 1}</span>
                      <span>Indexed: {Math.floor(Math.random() * 3) + 1}</span>
                    </div>
                    <Link 
                      to={`/instructor/study-materials/${cls.id}`}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                    >
                      Manage materials
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
              
              {classes.length === 0 && (
                <div className="text-center py-6">
                  <Database className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
                  <h3 className="text-xl font-semibold text-indigo-900 mb-2">No classes available</h3>
                  <p className="text-indigo-600 mb-4">Create a class to start adding RAG-powered study materials</p>
                </div>
              )}
              
              <RagInfoCard expanded={true} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Classes Section */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-indigo-900">Your Classes</h2>
                <div className="flex items-center gap-4">
                  <button
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300 font-medium flex items-center"
                  >
                    <FilePlus className="mr-2 h-4 w-4" />
                    Create Class
                  </button>
                  <Link
                    to="/instructor/classes"
                    className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm font-medium"
                  >
                    View all
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>

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
                  <p className="text-indigo-600 mb-4">Try adjusting your search or create a new class</p>
                  <button
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    <FilePlus className="mr-2 h-4 w-4" />
                    Create New Class
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredClasses.map((classItem) => (
                    <CourseCard 
                      key={classItem.id}
                      course={classItem}
                      onClick={handleClassSelect}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Right Sidebar - Tasks & Calendar */}
            <div className="space-y-8">
              {/* Tasks Section */}
              <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
                <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-indigo-600" />
                  Pending Tasks
                </h2>
                
                {pendingTasks.length > 0 ? (
                  <div className="space-y-4">
                    {pendingTasks.map((task) => (
                      <div key={task.id} className="border-b border-indigo-50 pb-4 last:border-b-0 last:pb-0">
                        <div className="flex justify-between">
                          <div className="flex">
                            <div className="p-2 bg-indigo-50 rounded-md mr-4">
                              <CheckCircle className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-indigo-900">{task.title}</h3>
                              <p className="text-xs text-orange-600 mt-1 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Due: {task.dueDate}
                              </p>
                            </div>
                          </div>
                          {task.count !== null && (
                            <div className="bg-indigo-100 px-2 py-1 rounded text-xs font-medium text-indigo-800 h-fit">
                              {task.count}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-indigo-500">
                    No pending tasks
                  </div>
                )}
                
                <button
                  className="mt-4 w-full py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md font-medium transition duration-300"
                >
                  View All Tasks
                </button>
              </div>
              
              {/* Student Analytics */}
              <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
                <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-indigo-600" />
                  Student Performance
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-indigo-800 font-medium">Mathematics 101</span>
                      <span className="text-sm text-indigo-800">68%</span>
                    </div>
                    <div className="w-full bg-indigo-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-indigo-800 font-medium">Physics Advanced</span>
                      <span className="text-sm text-indigo-800">42%</span>
                    </div>
                    <div className="w-full bg-indigo-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-indigo-800 font-medium">Chemistry Lab</span>
                      <span className="text-sm text-indigo-800">95%</span>
                    </div>
                    <div className="w-full bg-indigo-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                  </div>
                </div>
                
                <Link
                  to="/instructor/analytics"
                  className="mt-6 inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  View detailed analytics
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </DashboardInitializer>
  );
};

export default InstructorDashboard;