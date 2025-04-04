"use client";

import { useState, useEffect } from "react";
import { Link, useParams, useNavigate ,useLocation} from "react-router-dom";
import {
  Layers,
  Users,
  ChevronLeft,
  Plus,
  BookOpen,
  MoreVertical,
  Edit,
  Trash,
  School,
  UserPlus,
} from "lucide-react";

import DashboardHeader from "./shared/DashboardHeader";
import StatCard from "./shared/StatCard";
import SearchBar from "./dashboard/SearchBar";

// Mock data
const mockStandardDetails = {
  1: { id: 1, name: "5th Standard", totalStudents: 75, totalTeachers: 4 },
  2: { id: 2, name: "6th Standard", totalStudents: 60, totalTeachers: 3 },
};

const mockDivisions = {
  1: [
    { id: 1, name: "Division A", students: 25, teachers: 2, courses: 6, status: "active" },
    { id: 2, name: "Division B", students: 28, teachers: 1, courses: 6, status: "active" },
    { id: 3, name: "Division C", students: 22, teachers: 1, courses: 6, status: "active" },
  ],
  2: [
    { id: 4, name: "Division A", students: 30, teachers: 2, courses: 7, status: "active" },
    { id: 5, name: "Division B", students: 30, teachers: 1, courses: 7, status: "active" },
  ],
};

const StandardDashboard = () => {
  const { standardId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [standard, setStandard] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDivision, setNewDivision] = useState({ id: null, name: "", students: null, teachers: null, courses: null });

  useEffect(() => {
    fetchStandardData();
  }, [standardId]);

  const fetchStandardData = async () => {
    try {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get standard and divisions data
      const standardData = mockStandardDetails[standardId];
      const divisionsData = mockDivisions[standardId] || [];

      if (!standardData) {
        navigate("/admin");
        return;
      }

      setStandard(standardData);
      setDivisions(divisionsData);
    } catch (err) {
      console.error("Error fetching standard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActionMenu = (divisionId) => {
    setActiveActionMenu(activeActionMenu === divisionId ? null : divisionId);
  };

  const handleCreateDivision = () => {
    if (!newDivision.name.trim()) {
      alert("Division name is required.");
      return;
    }
  
    const newDivisionData = {
      id: divisions.length > 0 ? Math.max(...divisions.map((d) => d.id)) + 1 : 1, // Ensure unique ID
      name: newDivision.name,
      students: newDivision.students || 0,
      teachers: newDivision.teachers || 0,
      courses: newDivision.courses || 0,
      status: "active",
    };
  
    // Update the divisions state
    setDivisions([...divisions, newDivisionData]);
  
    // Dynamically update the mockDivisions object
    if (!mockDivisions[standardId]) {
      mockDivisions[standardId] = [];
    }
    mockDivisions[standardId].push(newDivisionData);
  
    setNewDivision({ id: null, name: "", students: null, teachers: null, courses: null });
    setIsModalOpen(false);
  };

  const handleEditDivision = (divisionId) => {
    const divisionToEdit = divisions.find((division) => division.id === divisionId);
    if (divisionToEdit) {
      setNewDivision(divisionToEdit); // Populate the modal with the division's data
      setIsModalOpen(true); // Open the modal for editing
    }
  };

  const handleDeleteDivision = (divisionId) => {
    if (window.confirm("Are you sure you want to delete this division?")) {
      setDivisions(divisions.filter((division) => division.id !== divisionId));
    }
  };

  const handleManageDivision = (divisionId) => {
    const division = divisions.find((d) => d.id === divisionId);
    console.log("Navigating to division:", division);
    if (division) {
      navigate(`/admin/${standardId}/divisions/${divisionId}`, { state: { division } });
    } else {
      alert("Division not found.");
    }
  };

  const filteredDivisions = divisions.filter((division) =>
    division.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStudents = divisions.reduce((sum, division) => sum + division.students, 0);
  const totalTeachers = divisions.reduce((sum, division) => sum + division.teachers, 0);

  if (isLoading || !standard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <DashboardHeader userRole="admin" />

      <main className="container mx-auto px-4 py-8">
        {/* Header with navigation */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <div className="flex items-center">
              <Link to="/admin" className="mr-4 text-indigo-600 hover:text-indigo-800">
                <ChevronLeft className="h-6 w-6" />
              </Link>
              <h1 className="text-3xl font-bold text-indigo-900">{standard.name}</h1>
            </div>
            <p className="text-indigo-600 mt-2 ml-10">Manage divisions, students and teachers</p>
          </div>
          <div className="flex items-center mt-4 md:mt-0">
            <SearchBar
              placeholder="Search divisions..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
            <button
              onClick={() => setIsModalOpen(true)}
              className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300 font-medium flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Division
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Layers className="h-6 w-6 text-indigo-600" />}
            title="Total Divisions"
            value={divisions.length}
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
            icon={<UserPlus className="h-6 w-6 text-blue-600" />}
            title="Assigned Teachers"
            value={totalTeachers}
            bgColor="bg-blue-100"
            textColor="text-blue-700"
          />
        </div>

        {/* Divisions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6 mb-8">
          <div className="flex items-center mb-6">
            <School className="h-6 w-6 text-indigo-600 mr-3" />
            <h2 className="text-xl font-bold text-indigo-900">Divisions</h2>
          </div>

          {filteredDivisions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-indigo-400 mb-4">
                <Layers className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-indigo-800 mb-2">No divisions found</h3>
              <p className="text-indigo-600 mb-6">Start by creating divisions for this standard</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300 font-medium inline-flex items-center"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Division
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-indigo-100">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">
                      Division Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">
                      Students
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">
                      Teachers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">
                      Courses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-indigo-100">
                  {filteredDivisions.map((division) => (
                    <tr key={division.id} className="hover:bg-indigo-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/admin/${standardId}/divisions/${division.id}`}
                          className="text-indigo-900 font-medium hover:text-indigo-700"
                        >
                          {division.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-indigo-500" />
                          {division.students}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                        <div className="flex items-center">
                          <UserPlus className="h-4 w-4 mr-2 text-indigo-500" />
                          {division.teachers}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-2 text-indigo-500" />
                          {division.courses}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          {division.status.charAt(0).toUpperCase() + division.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                        <button
                          onClick={() => toggleActionMenu(division.id)}
                          className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>

                        {activeActionMenu === division.id && (
                          <div className="absolute right-8 mt-0 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-indigo-100">
                            <button
                              onClick={() => handleManageDivision(division.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50"
                            >
                              <BookOpen className="inline-block w-4 h-4 mr-2" />
                              Manage Division
                            </button>
                            <button
                              onClick={() => handleEditDivision(division.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50"
                            >
                              <Edit className="inline-block w-4 h-4 mr-2" />
                              Edit Division
                            </button>
                            <button
                              onClick={() => handleDeleteDivision(division.id)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash className="inline-block w-4 h-4 mr-2" />
                              Delete Division
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

      {/* Modal for Creating/Editing Division */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-bold text-indigo-900 mb-4">
              {newDivision.id ? "Edit Division" : "Create Division"}
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Division Name</label>
              <input
                type="text"
                value={newDivision.name}
                onChange={(e) => setNewDivision({ ...newDivision, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Students</label>
              <input
                type="number"
                value={newDivision.students}
                onChange={(e) => setNewDivision({ ...newDivision, students: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Teachers</label>
              <input
                type="number"
                value={newDivision.teachers}
                onChange={(e) => setNewDivision({ ...newDivision, teachers: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Courses</label>
              <input
                type="number"
                value={newDivision.courses}
                onChange={(e) => setNewDivision({ ...newDivision, courses: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDivision}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                {newDivision.id ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StandardDashboard;