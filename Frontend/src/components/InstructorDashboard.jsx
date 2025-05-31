import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Filter,
  ArrowRight,
  BookOpen,
  Calendar,
  Bell,
  CheckCircle,
  Tag
} from 'lucide-react';

import DashboardHeader from './shared/DashboardHeader';
import StatCard from './shared/StatCard';
import SearchBar from './dashboard/SearchBar';
import NotificationsPanel from './dashboard/NotificationsPanel';
import DashboardInitializer from './shared/DashboardInitializer';

import { supabase } from '../lib/supabaseClient';
import { getAssignedClasses } from '../services/classroom_service';

const AssignedClasses = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("User not logged in");
        }

        const assigned = await getAssignedClasses(user.id);
        setClasses(assigned);
      } catch (err) {
        console.error("Dashboard load failed:", err.message);
        setError("Unable to load assigned classes. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleClassSelect = (classId) => {
    navigate(`/instructor/class/${classId}`);
  };

  // Filter logic
  const filteredClasses = classes.filter(cls => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.section.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || cls.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalStudents = classes.reduce((sum, cls) => sum + (cls.studentCount || 0), 0);

  return (
    <DashboardInitializer expectedRole="teacher">
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
        <DashboardHeader userRole="teacher" />

        <main className="container mx-auto px-4 py-8">
          {/* Top Header */}
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

          {/* Statistic Cards */}
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

          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center mr-4">
              <Filter className="h-5 w-5 text-indigo-600 mr-2" />
              <span className="text-indigo-900 font-medium">Filter:</span>
            </div>

            {["all", "active", "inactive"].map((status) => (
              <button
                key={status}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  statusFilter === status
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                }`}
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Classes Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600" />
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-lg">
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
              {filteredClasses.map((cls) => (
                <div
                  key={cls.id}
                  className={`bg-white rounded-xl shadow-sm border ${
                    cls.status === "active"
                      ? "border-indigo-200"
                      : "border-gray-200"
                  } hover:shadow-md transition-all duration-300 overflow-hidden`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-indigo-900">{cls.name}</h3>
                        <p className="text-indigo-600">Section {cls.section}</p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          cls.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {cls.status === "active" ? "Active" : "Inactive"}
                      </div>
                    </div>

                    <div className="space-y-3 mb-5">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-indigo-600 mr-2" />
                        <span className="text-indigo-800">{cls.studentCount} Students</span>
                      </div>

                      <div className="flex items-start">
                        <Tag className="h-4 w-4 text-indigo-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-indigo-800">
                          {cls.subjects.join(", ")}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-indigo-600 mr-2" />
                        <span className="text-indigo-800">
                          Next: {cls.nextSchedule}
                        </span>
                      </div>

                      <div className="flex items-start">
                        <Bell className="h-4 w-4 text-indigo-600 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-indigo-800">{cls.recentActivity}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleClassSelect(cls.id)}
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