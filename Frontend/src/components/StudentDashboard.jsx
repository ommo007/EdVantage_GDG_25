import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BookOpenCheck,
  GraduationCap,
  BarChart2,
  ArrowRight,
  Clock,
  Calendar,
  FileText,
  Book
} from 'lucide-react';

import DashboardHeader from './shared/DashboardHeader';
import StatCard from './shared/StatCard';
import CourseCard from './dashboard/CourseCard';
import SearchBar from './dashboard/SearchBar';
import NotificationsPanel from './dashboard/NotificationsPanel';

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

// Mock data for upcoming assignments
const mockUpcomingAssignments = [
  { id: 1, title: "Linear Algebra Quiz", course: "Mathematics 101", dueDate: "Today, 11:59 PM" },
  { id: 2, title: "Physics Lab Report", course: "Physics Fundamentals", dueDate: "Tomorrow, 5:00 PM" },
  { id: 3, title: "Cell Biology Diagram", course: "Introduction to Biology", dueDate: "Friday, 3:00 PM" }
];

const StudentDashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
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
      setEnrolledCourses(mockEnrolledCourses);
      setUpcomingAssignments(mockUpcomingAssignments);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseSelect = (courseId) => {
    navigate(`/study/${courseId}`);
  };

  // Filter courses based on search term
  const filteredCourses = enrolledCourses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Header */}
      <DashboardHeader userRole="student" />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-indigo-900">Your Learning Dashboard</h1>
            <p className="text-indigo-600 mt-2">Continue your learning journey</p>
          </div>
          <div className="flex items-center space-x-4">
            <SearchBar 
              placeholder="Search your courses..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
            <NotificationsPanel />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={<BookOpenCheck className="h-6 w-6 text-indigo-600" />}
            title="In Progress"
            value={enrolledCourses.length}
            bgColor="bg-indigo-100"
            textColor="text-indigo-700"
          />
          
          <StatCard 
            icon={<GraduationCap className="h-6 w-6 text-purple-600" />}
            title="Completed"
            value="2"
            bgColor="bg-purple-100"
            textColor="text-purple-700"
          />
          
          <StatCard 
            icon={<BarChart2 className="h-6 w-6 text-blue-600" />}
            title="Overall Progress"
            value="68%"
            bgColor="bg-blue-100"
            textColor="text-blue-700"
          />
          
          <StatCard 
            icon={<Clock className="h-6 w-6 text-orange-600" />}
            title="Study Hours"
            value="42h"
            bgColor="bg-orange-100"
            textColor="text-orange-700"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enrolled Courses Section */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-indigo-900">Your Courses</h2>
              <Link
                to="/student/classes"
                className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm font-medium"
              >
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
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
            ) : filteredCourses.length === 0 ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 text-center">
                <Book className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-indigo-900 mb-2">No courses found</h3>
                <p className="text-indigo-600 mb-4">Try adjusting your search or explore new courses</p>
                <Link
                  to="/student/classes"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Explore Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard 
                    key={course.id}
                    course={course}
                    onClick={handleCourseSelect}
                  />
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
          </div>
          
          {/* Upcoming Assignments & Calendar Section */}
          <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
            <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
              Upcoming Deadlines
            </h2>
            
            {upcomingAssignments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAssignments.map((assignment) => (
                  <div key={assignment.id} className="border-b border-indigo-50 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex">
                      <div className="p-2 bg-indigo-50 rounded-md mr-4">
                        <FileText className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-indigo-900">{assignment.title}</h3>
                        <p className="text-sm text-indigo-600">{assignment.course}</p>
                        <p className="text-xs text-orange-600 mt-1 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Due: {assignment.dueDate}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-indigo-500">
                No upcoming assignments
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-indigo-50">
              <h3 className="font-medium text-indigo-900 mb-3">This Week's Schedule</h3>
              <div className="bg-indigo-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-indigo-800 font-medium">Monday</span>
                  <span className="text-xs bg-indigo-200 text-indigo-700 px-2 py-1 rounded">2 Classes</span>
                </div>
                <div className="text-sm text-indigo-700 mb-1">• Math 101 (9:00 AM)</div>
                <div className="text-sm text-indigo-700">• Physics (2:30 PM)</div>
              </div>
            </div>
            
            <Link
              to="/student/calendar"
              className="mt-6 inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              View full calendar
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
