import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Calendar, Users, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardHeader from './shared/DashboardHeader';

const StudentDashboard = () => {
  const { currentUser, userRole, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Simulated data - in a real app, fetch from your backend
  const [classes, setClasses] = useState([
    { id: 1, name: "Introduction to Mathematics", instructor: "Dr. Jane Smith", progress: 65 },
    { id: 2, name: "Basic Physics", instructor: "Prof. Robert Johnson", progress: 42 },
    { id: 3, name: "Computer Science 101", instructor: "Dr. Michael Chen", progress: 89 },
  ]);
  
  const [upcomingEvents, setUpcomingEvents] = useState([
    { id: 1, title: "Math Quiz", date: "Tomorrow, 10:00 AM", type: "quiz" },
    { id: 2, title: "Physics Lab Session", date: "Friday, 2:00 PM", type: "lab" },
    { id: 3, title: "CS Project Deadline", date: "Next Monday, 11:59 PM", type: "deadline" },
  ]);

  useEffect(() => {
    console.log("StudentDashboard mounted, userRole:", userRole);
    
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [userRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
        <DashboardHeader userRole={userRole} />
        <div className="flex justify-center items-center h-[calc(100vh-56px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
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
                <h2 className="text-xl font-semibold text-indigo-900">Your Classes</h2>
                <button 
                  onClick={() => navigate('/student/classes')}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  View All Classes
                </button>
              </div>
              
              <div className="p-6">
                {classes.length > 0 ? (
                  <div className="space-y-4">
                    {classes.map((cls) => (
                      <div 
                        key={cls.id}
                        className="flex items-center p-4 rounded-lg border border-indigo-100 hover:bg-indigo-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/study/${cls.id}`)}
                      >
                        <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                          <Book className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-indigo-900 font-medium">{cls.name}</h3>
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
                  onClick={() => navigate('/study')}
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
  );
};

export default StudentDashboard;
