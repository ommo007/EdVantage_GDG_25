"use client"

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Plus,
  Filter,
  MoreVertical,
  Trash,
  Edit,
  UserPlus,
  BookOpen
} from "lucide-react";

import DashboardHeader from "./shared/DashboardHeader";
import SearchBar from "./dashboard/SearchBar";
import NotificationsPanel from "./dashboard/NotificationsPanel";

const mockAssignedClasses = [
  { id: 1, name: "Mathematics 101", instructor: "John Doe", students: 25, status: "active" },
  { id: 2, name: "Physics 101", instructor: "Jane Smith", students: 18, status: "active" },
  { id: 3, name: "Chemistry 101", instructor: "Bob Johnson", students: 22, status: "inactive" },
  { id: 4, name: "Biology 101", instructor: "Alice Williams", students: 20, status: "active" },
  { id: 5, name: "Computer Science 101", instructor: "David Brown", students: 30, status: "active" },
  { id: 6, name: "History 101", instructor: "Unassigned", students: 0, status: "draft" },
];

const AdminClassSelection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setClasses(mockAssignedClasses);
    } catch (err) {
      console.error("Error fetching classes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setIsFilterMenuOpen(false);
  };

  const toggleActionMenu = (classId) => {
    setActiveActionMenu(activeActionMenu === classId ? null : classId);
  };

  // Filter classes based on search term and status filter
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = 
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || cls.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>;
      case 'inactive':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Inactive</span>;
      case 'draft':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Draft</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <DashboardHeader userRole="admin" />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-900">Class Management</h1>
          <Link
            to="/admin"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300 font-medium flex items-center"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 mb-6">
            <div className="flex items-center space-x-4">
              <SearchBar 
                placeholder="Search classes or instructors..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="w-64"
              />
              
              <div className="relative">
                <button 
                  onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                  className="flex items-center px-3 py-2 border border-indigo-200 rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {statusFilter === "all" ? "All Status" : 
                   statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </button>
                
                {isFilterMenuOpen && (
                  <div className="absolute mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-indigo-100">
                    <button
                      onClick={() => handleStatusFilterChange("all")}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${statusFilter === "all" ? "bg-indigo-50 text-indigo-700 font-medium" : "text-indigo-600"}`}
                    >
                      All Status
                    </button>
                    <button
                      onClick={() => handleStatusFilterChange("active")}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${statusFilter === "active" ? "bg-indigo-50 text-indigo-700 font-medium" : "text-indigo-600"}`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => handleStatusFilterChange("inactive")}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${statusFilter === "inactive" ? "bg-indigo-50 text-indigo-700 font-medium" : "text-indigo-600"}`}
                    >
                      Inactive
                    </button>
                    <button
                      onClick={() => handleStatusFilterChange("draft")}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${statusFilter === "draft" ? "bg-indigo-50 text-indigo-700 font-medium" : "text-indigo-600"}`}
                    >
                      Draft
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300 font-medium flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Create New Class
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-indigo-400 mb-4">
                <BookOpen className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-indigo-800 mb-2">No classes found</h3>
              <p className="text-indigo-600 mb-6">Try adjusting your search or filters</p>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300 font-medium inline-flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Create New Class
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-indigo-100">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">Class Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">Instructor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">Students</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-indigo-100">
                  {filteredClasses.map((cls) => (
                    <tr key={cls.id} className="hover:bg-indigo-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-900">{cls.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                        {cls.instructor === "Unassigned" ? (
                          <button className="inline-flex items-center text-indigo-600 hover:text-indigo-800">
                            <UserPlus className="h-4 w-4 mr-1" />
                            Assign Instructor
                          </button>
                        ) : cls.instructor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">{cls.students}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(cls.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                        <button 
                          onClick={() => toggleActionMenu(cls.id)}
                          className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        
                        {activeActionMenu === cls.id && (
                          <div className="absolute right-8 mt-0 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-indigo-100">
                            <button className="block w-full text-left px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50">
                              <Edit className="inline-block w-4 h-4 mr-2" />
                              Edit Class
                            </button>
                            <button className="block w-full text-left px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50">
                              <UserPlus className="inline-block w-4 h-4 mr-2" />
                              Assign Instructor
                            </button>
                            <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                              <Trash className="inline-block w-4 h-4 mr-2" />
                              Delete Class
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminClassSelection;


