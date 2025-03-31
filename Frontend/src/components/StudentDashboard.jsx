import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Calendar, Users, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardHeader from './shared/DashboardHeader';
import DashboardInitializer from './shared/DashboardInitializer';

// Prefetched mock data instead of waiting for async load
const MOCK_CLASSES = [
  { id: 1, name: "Introduction to Mathematics", instructor: "Dr. Jane Smith", progress: 65 },
  { id: 2, name: "Basic Physics", instructor: "Prof. Robert Johnson", progress: 42 },
  { id: 3, name: "Computer Science 101", instructor: "Dr. Michael Chen", progress: 89 },
];

const MOCK_EVENTS = [
  { id: 1, title: "Math Quiz", date: "Tomorrow, 10:00 AM", type: "quiz" },
  { id: 2, title: "Physics Lab Session", date: "Friday, 2:00 PM", type: "lab" },
  { id: 3, title: "CS Project Deadline", date: "Next Monday, 11:59 PM", type: "deadline" },
];

const StudentDashboard = () => {
  const { currentUser, userRole, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false); // Start with false to avoid blocking render
  const [classes, setClasses] = useState(MOCK_CLASSES); // Initialize with mock data
  const [upcomingEvents, setUpcomingEvents] = useState(MOCK_EVENTS); // Initialize with mock data
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // No need to block initial render - just update data if needed later
    const fetchAdditionalData = async () => {
      try {
        // Additional data fetching if needed - not blocking initial render
        console.log("Fetching additional student data in background...");
        
        // In a real app, you would fetch real data here
        // For now we'll just use the mock data already loaded
      } catch (err) {
        console.error("Error fetching additional student data:", err);
        setError("Some data could not be loaded. Please refresh to try again.");
      }
    };
    
    fetchAdditionalData();
  }, [userRole]);

  const handleClassSelect = (classId) => {
    navigate(`/study/${classId}`);
  };

  const handleViewStudySpace = () => {
    navigate('/study');
  };

  // Simple error banner if needed
  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 m-4 border border-red-200">
        <div className="flex">
          <div className="text-red-500">
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardInitializer expectedRole="student">
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
        <DashboardHeader userRole={userRole} />
        
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">
            Welcome, {currentUser?.displayName || userProfile?.displayName || 'Student'}!
          </h1>
          <p className="text-indigo-600 mb-8">Here's your learning dashboard</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Classes section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-indigo-100">
                  <h2 className="text-xl font-semibold text-indigo-900">My Classes</h2>
                  <button 
                    onClick={() => navigate('/student/classes')}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                
                <div className="p-6">
                  {classes.length > 0 ? (
                    <div className="space-y-4">
                      {classes.map((cls) => (
                        <div 
                          key={cls.id}
                          onClick={() => handleClassSelect(cls.id)}
                          className="flex justify-between items-center p-4 border border-indigo-100 rounded-lg hover:border-indigo-300 cursor-pointer transition-colors"
                        >
                          <div>
                            <h3 className="font-medium text-indigo-900">{cls.name}</h3>
                            <p className="text-indigo-600 text-sm">{cls.instructor}</p>
                          </div>
                          <div className="flex items-center">
                            <div className="mr-3">
                              <p className="text-xs text-indigo-600 mb-1">Progress</p>
                              <div className="w-24 h-2 bg-indigo-100 rounded-full">
                                <div 
                                  className="h-full bg-indigo-600 rounded-full" 
                                  style={{ width: `${cls.progress}%` }}
                                ></div>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-indigo-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-indigo-600">You haven't joined any classes yet.</p>
                      <button 
                        onClick={() => navigate('/student/classes')}
                        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        Browse Available Classes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Calendar section */}
            <div>
              <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-indigo-100">
                  <h2 className="text-xl font-semibold text-indigo-900">Upcoming</h2>
                  <button 
                    onClick={() => navigate('/student/calendar')}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View Calendar
                  </button>
                </div>
                
                <div className="p-6">
                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingEvents.map((event) => (
                        <div key={event.id} className="flex items-start">
                          <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                            <Calendar className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="text-indigo-900 font-medium">{event.title}</h4>
                            <p className="text-indigo-600 text-sm">{event.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-6 text-indigo-600">No upcoming events</p>
                  )}
                </div>
              </div>
              
              {/* Study recommendations */}
              <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden mt-6">
                <div className="p-6 border-b border-indigo-100">
                  <h2 className="text-xl font-semibold text-indigo-900">Study Recommendations</h2>
                </div>
                
                <div className="p-6">
                  <button 
                    onClick={handleViewStudySpace}
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-indigo-100 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                        <Users className="h-5 w-5 text-indigo-600" />
                      </div>
                      <span className="text-indigo-900 font-medium">Open AI Study Space</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-indigo-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </DashboardInitializer>
  );
};

export default StudentDashboard;
