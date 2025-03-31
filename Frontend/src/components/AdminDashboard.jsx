"use client"

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ChevronRight, 
  Users, 
  Layers, 
  Activity,
  BookOpen,
  User,
  UserPlus,
  BarChart2,
  Server,
  Settings,
  FileText,
  LogOut
} from "lucide-react";

import DashboardHeader from "./shared/DashboardHeader";
import StatCard from "./shared/StatCard";
import SearchBar from "./dashboard/SearchBar";
import NotificationsPanel from "./dashboard/NotificationsPanel";
import Logo from "./Logo";
import DashboardInitializer from './shared/DashboardInitializer';

const mockInstructors = [
  { id: 1, name: "John Doe", email: "john.doe@example.com", classes: 4 },
  { id: 2, name: "Jane Smith", email: "jane.smith@example.com", classes: 2 },
  { id: 3, name: "Bob Johnson", email: "bob.johnson@example.com", classes: 3 },
];

const mockRecentActivities = [
  { id: 1, action: "New User Registration", user: "Sarah Williams", timestamp: "10 minutes ago" },
  { id: 2, action: "Course Created", user: "John Doe", timestamp: "1 hour ago" },
  { id: 3, action: "Updated System Settings", user: "Admin", timestamp: "3 hours ago" },
  { id: 4, action: "New Enrollment", user: "Michael Brown", timestamp: "5 hours ago" },
];

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [instructors, setInstructors] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [statistics, setStatistics] = useState({
    totalClasses: 15,
    totalInstructors: 8,
    totalStudents: 120,
    activeUsers: 45
  });
  const [assignments, setAssignments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
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
      setInstructors(mockInstructors);
      setRecentActivities(mockRecentActivities);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const filteredInstructors = instructors.filter(
    instructor => 
      instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardInitializer expectedRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
        <DashboardHeader userRole="admin" />

        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-indigo-900">Admin Dashboard</h1>
              <p className="text-indigo-600 mt-2">Platform overview and management</p>
            </div>
            <div className="flex items-center space-x-4">
              <SearchBar 
                placeholder="Search instructors, classes..."
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
              title="Total Courses"
              value={statistics.totalClasses}
              bgColor="bg-indigo-100"
              textColor="text-indigo-700"
            />
            
            <StatCard 
              icon={<Users className="h-6 w-6 text-purple-600" />}
              title="Total Students"
              value={statistics.totalStudents}
              bgColor="bg-purple-100"
              textColor="text-purple-700"
            />
            
            <StatCard 
              icon={<User className="h-6 w-6 text-blue-600" />}
              title="Instructors"
              value={statistics.totalInstructors}
              bgColor="bg-blue-100"
              textColor="text-blue-700"
            />
            
            <StatCard 
              icon={<Activity className="h-6 w-6 text-green-600" />}
              title="Active Users"
              value={statistics.activeUsers}
              bgColor="bg-green-100"
              textColor="text-green-700"
            />
          </div>

          {/* Main Dashboard Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Admin actions and class assignments */}
            <div className="lg:col-span-2 space-y-8">
              {/* Admin actions menu */}
              <div>
                <h2 className="text-xl font-bold text-indigo-900 mb-4">Admin Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link 
                    to="/admin/classes" 
                    className="bg-white p-5 rounded-xl shadow-sm border border-indigo-100 hover:shadow-md transition-all duration-300 flex items-center"
                  >
                    <div className="p-3 bg-indigo-100 rounded-lg mr-4">
                      <Layers className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-indigo-900">Manage Classes</h3>
                      <p className="text-indigo-600 text-sm">Assign instructors to classes</p>
                    </div>
                  </Link>
                  
                  <Link 
                    to="/admin/study-space" 
                    className="bg-white p-5 rounded-xl shadow-sm border border-indigo-100 hover:shadow-md transition-all duration-300 flex items-center"
                  >
                    <div className="p-3 bg-purple-100 rounded-lg mr-4">
                      <Activity className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-indigo-900">Study Spaces</h3>
                      <p className="text-indigo-600 text-sm">Monitor active learning sessions</p>
                    </div>
                  </Link>
                  
                  <Link 
                    to="/admin/users" 
                    className="bg-white p-5 rounded-xl shadow-sm border border-indigo-100 hover:shadow-md transition-all duration-300 flex items-center"
                  >
                    <div className="p-3 bg-blue-100 rounded-lg mr-4">
                      <UserPlus className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-indigo-900">User Management</h3>
                      <p className="text-indigo-600 text-sm">Add and manage system users</p>
                    </div>
                  </Link>
                  
                  <Link 
                    to="/admin/analytics" 
                    className="bg-white p-5 rounded-xl shadow-sm border border-indigo-100 hover:shadow-md transition-all duration-300 flex items-center"
                  >
                    <div className="p-3 bg-green-100 rounded-lg mr-4">
                      <BarChart2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-indigo-900">Analytics</h3>
                      <p className="text-indigo-600 text-sm">Platform usage statistics</p>
                    </div>
                  </Link>
                </div>
              </div>
              
              {/* Instructors List */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-indigo-900">Instructors</h2>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300 font-medium flex items-center">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Instructor
                  </button>
                </div>
                
                {isLoading ? (
                  <div className="bg-white rounded-xl p-8 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
                    <table className="min-w-full divide-y divide-indigo-100">
                      <thead className="bg-indigo-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">Classes</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-indigo-100">
                        {filteredInstructors.map((instructor) => (
                          <tr key={instructor.id} className="hover:bg-indigo-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-900">{instructor.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{instructor.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{instructor.classes}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                              <button className="text-red-600 hover:text-red-900">Remove</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                <div className="mt-4 flex justify-end">
                  <Link
                    to="/admin/instructors"
                    className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm font-medium"
                  >
                    View all instructors
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Right sidebar with widgets */}
            <div className="space-y-8">
              {/* Platform Status */}
              <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
                <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center">
                  <Server className="h-5 w-5 mr-2 text-indigo-600" />
                  Platform Status
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-indigo-800 font-medium">Server Load</span>
                      <span className="text-sm text-green-600 font-medium">Healthy</span>
                    </div>
                    <div className="w-full bg-indigo-100 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '23%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-indigo-800 font-medium">Database</span>
                      <span className="text-sm text-green-600 font-medium">Operational</span>
                    </div>
                    <div className="w-full bg-indigo-100 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-indigo-800 font-medium">Storage</span>
                      <span className="text-sm text-indigo-600 font-medium">65% Used</span>
                    </div>
                    <div className="w-full bg-indigo-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-indigo-100">
                    <p className="text-xs text-indigo-500">Last system check: Today, 08:15 AM</p>
                  </div>
                </div>
                
                <button className="mt-4 w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition duration-300 font-medium flex items-center justify-center">
                  <Settings className="mr-2 h-4 w-4" />
                  System Settings
                </button>
              </div>
              
              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
                <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                  Recent Activity
                </h2>
                
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="border-b border-indigo-50 pb-3 last:border-b-0 last:pb-0">
                      <div className="flex items-start">
                        <div className="p-2 bg-indigo-50 rounded-md mr-3">
                          <FileText className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-indigo-900 text-sm">{activity.action}</h3>
                          <p className="text-xs text-indigo-600 mt-1">By: {activity.user}</p>
                          <p className="text-xs text-indigo-400 mt-1">{activity.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Link
                  to="/admin/activity"
                  className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  View all activity
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </DashboardInitializer>
  );
};

export default AdminDashboard;


