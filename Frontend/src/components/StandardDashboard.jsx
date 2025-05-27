"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Layers,
  Users,
  ChevronLeft,
  Plus,
  BookOpen,
  Edit,
  Trash,
  School,
  UserPlus,
  X,
  Settings,
} from "lucide-react";

import DashboardHeader from "./shared/DashboardHeader";
import StatCard from "./shared/StatCard";
import SearchBar from "./dashboard/SearchBar";

// Mock data
const mockStandardDetails = {
  1: { id: 1, name: "Jr. KG", totalStudents: 50, totalTeachers: 3 },
  2: { id: 2, name: "Sr. KG", totalStudents: 55, totalTeachers: 3 },
  3: { id: 3, name: "1st Standard", totalStudents: 60, totalTeachers: 4 },
  4: { id: 4, name: "2nd Standard", totalStudents: 65, totalTeachers: 4 },
  5: { id: 5, name: "3rd Standard", totalStudents: 70, totalTeachers: 4 },
  6: { id: 6, name: "4th Standard", totalStudents: 75, totalTeachers: 4 },
  7: { id: 7, name: "5th Standard", totalStudents: 80, totalTeachers: 4 },
  8: { id: 8, name: "6th Standard", totalStudents: 85, totalTeachers: 4 },
  9: { id: 9, name: "7th Standard", totalStudents: 90, totalTeachers: 5 },
  10: { id: 10, name: "8th Standard", totalStudents: 95, totalTeachers: 5 },
  11: { id: 11, name: "9th Standard", totalStudents: 100, totalTeachers: 5 },
  12: { id: 12, name: "10th Standard", totalStudents: 110, totalTeachers: 6 },
};

const mockDivisions = {
  1: [
    { id: 1, name: "Division A", students: 25, teachers: 2, courses: 6, status: "active" },
    { id: 2, name: "Division B", students: 25, teachers: 1, courses: 6, status: "active" },
  ],
  2: [
    { id: 3, name: "Division A", students: 28, teachers: 2, courses: 6, status: "active" },
    { id: 4, name: "Division B", students: 27, teachers: 1, courses: 6, status: "active" },
  ],
  3: [
    { id: 5, name: "Division A", students: 30, teachers: 2, courses: 7, status: "active" },
    { id: 6, name: "Division B", students: 30, teachers: 1, courses: 7, status: "active" },
  ],
  4: [
    { id: 7, name: "Division A", students: 32, teachers: 2, courses: 8, status: "active" },
    { id: 8, name: "Division B", students: 33, teachers: 1, courses: 8, status: "active" },
  ],
  5: [
    { id: 9, name: "Division A", students: 35, teachers: 2, courses: 9, status: "active" },
    { id: 10, name: "Division B", students: 35, teachers: 1, courses: 9, status: "active" },
  ],
  6: [
    { id: 11, name: "Division A", students: 38, teachers: 2, courses: 10, status: "active" },
    { id: 12, name: "Division B", students: 37, teachers: 1, courses: 10, status: "active" },
  ],
  7: [
    { id: 13, name: "Division A", students: 40, teachers: 2, courses: 11, status: "active" },
    { id: 14, name: "Division B", students: 40, teachers: 1, courses: 11, status: "active" },
  ],
  8: [
    { id: 15, name: "Division A", students: 42, teachers: 2, courses: 12, status: "active" },
    { id: 16, name: "Division B", students: 43, teachers: 1, courses: 12, status: "active" },
  ],
  9: [
    { id: 17, name: "Division A", students: 45, teachers: 2, courses: 13, status: "active" },
    { id: 18, name: "Division B", students: 44, teachers: 1, courses: 13, status: "active" },
  ],
  10: [
    { id: 19, name: "Division A", students: 48, teachers: 2, courses: 14, status: "active" },
    { id: 20, name: "Division B", students: 47, teachers: 1, courses: 14, status: "active" },
  ],
  11: [
    { id: 21, name: "Division A", students: 50, teachers: 2, courses: 15, status: "active" },
    { id: 22, name: "Division B", students: 50, teachers: 1, courses: 15, status: "active" },
  ],
  12: [
    { id: 23, name: "Division A", students: 55, teachers: 3, courses: 16, status: "active" },
    { id: 24, name: "Division B", students: 55, teachers: 2, courses: 16, status: "active" },
  ],
};

const StandardDashboard = () => {
  const { standardId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [standard, setStandard] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDivision, setNewDivision] = useState({ 
    id: null, 
    name: "", 
    students: "", 
    teachers: "", 
    courses: "" 
  });
  const [errors, setErrors] = useState({});

  // Only lock scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!newDivision.name.trim()) {
      newErrors.name = "Division name is required";
    }
    
    if (newDivision.students !== "" && (isNaN(newDivision.students) || parseInt(newDivision.students) < 0)) {
      newErrors.students = "Students must be a valid number";
    }
    
    if (newDivision.teachers !== "" && (isNaN(newDivision.teachers) || parseInt(newDivision.teachers) < 0)) {
      newErrors.teachers = "Teachers must be a valid number";
    }
    
    if (newDivision.courses !== "" && (isNaN(newDivision.courses) || parseInt(newDivision.courses) < 0)) {
      newErrors.courses = "Courses must be a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateOrUpdateDivision = () => {
    if (!validateForm()) {
      return;
    }

    const divisionData = {
      id: newDivision.id || (divisions.length > 0 ? Math.max(...divisions.map((d) => d.id)) + 1 : 1),
      name: newDivision.name.trim(),
      students: parseInt(newDivision.students) || 0,
      teachers: parseInt(newDivision.teachers) || 0,
      courses: parseInt(newDivision.courses) || 0,
      status: "active",
    };

    if (newDivision.id) {
      // Update existing division
      setDivisions(divisions.map(d => d.id === divisionData.id ? divisionData : d));
      // Update mockDivisions
      const index = mockDivisions[standardId].findIndex(d => d.id === divisionData.id);
      if (index !== -1) {
        mockDivisions[standardId][index] = divisionData;
      }
    } else {
      // Create new division
      setDivisions([...divisions, divisionData]);
      // Update mockDivisions
      if (!mockDivisions[standardId]) {
        mockDivisions[standardId] = [];
      }
      mockDivisions[standardId].push(divisionData);
    }

    resetModal();
  };

  const resetModal = () => {
    setNewDivision({ id: null, name: "", students: "", teachers: "", courses: "" });
    setErrors({});
    setIsModalOpen(false);
  };

  const handleEditDivision = (divisionId) => {
    const divisionToEdit = divisions.find((division) => division.id === divisionId);
    if (divisionToEdit) {
      setNewDivision({
        ...divisionToEdit,
        students: divisionToEdit.students.toString(),
        teachers: divisionToEdit.teachers.toString(),
        courses: divisionToEdit.courses.toString(),
      });
      setIsModalOpen(true);
    }
  };

  const handleDeleteDivision = (divisionId) => {
    if (window.confirm("Are you sure you want to delete this division?")) {
      setDivisions(divisions.filter((division) => division.id !== divisionId));
      // Update mockDivisions
      if (mockDivisions[standardId]) {
        mockDivisions[standardId] = mockDivisions[standardId].filter(d => d.id !== divisionId);
      }
    }
  };

  const handleManageDivision = (divisionId) => {
    const division = divisions.find((d) => d.id === divisionId);
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
              <Link to="/admin" className="mr-4 text-indigo-600 hover:text-indigo-800 transition-colors">
                <ChevronLeft className="h-6 w-6" />
              </Link>
              <h1 className="text-3xl font-bold text-indigo-900">{standard.name}</h1>
            </div>
            <p className="text-indigo-600 mt-2 ml-10">Manage divisions, students and teachers</p>
          </div>
          <div className="flex items-center mt-4 md:mt-0 gap-4">
            <SearchBar
              placeholder="Search divisions..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300 font-medium flex items-center whitespace-nowrap"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Division
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

        {/* Divisions Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-indigo-100 mb-8">
          <div className="p-6 border-b border-indigo-100">
            <div className="flex items-center">
              <School className="h-6 w-6 text-indigo-600 mr-3" />
              <h2 className="text-xl font-bold text-indigo-900">Divisions</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredDivisions.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="text-indigo-400 mb-4">
                  <Layers className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-indigo-800 mb-2">No divisions found</h3>
                <p className="text-indigo-600 mb-6">
                  {searchTerm ? "No divisions match your search criteria" : "Start by creating divisions for this standard"}
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300 font-medium inline-flex items-center"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Division
                </button>
              </div>
            ) : (
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
                    <tr key={division.id} className="hover:bg-indigo-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/admin/${standardId}/divisions/${division.id}`}
                          className="text-indigo-900 font-medium hover:text-indigo-700 transition-colors"
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
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          {division.status.charAt(0).toUpperCase() + division.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleManageDivision(division.id)}
                            className="inline-flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-md hover:bg-indigo-200 transition-colors"
                            title="Manage Division"
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Manage
                          </button>
                          <button
                            onClick={() => handleEditDivision(division.id)}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-md hover:bg-blue-200 transition-colors"
                            title="Edit Division"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDivision(division.id)}
                            className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-md hover:bg-red-200 transition-colors"
                            title="Delete Division"
                          >
                            <Trash className="h-3 w-3 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Modal for Creating/Editing Division */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-indigo-900">
                {newDivision.id ? "Edit Division" : "Create Division"}
              </h2>
              <button
                onClick={resetModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateOrUpdateDivision(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Division Name *
                  </label>
                  <input
                    type="text"
                    value={newDivision.name}
                    onChange={(e) => setNewDivision({ ...newDivision, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter division name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Students
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newDivision.students}
                    onChange={(e) => setNewDivision({ ...newDivision, students: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                      errors.students ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.students && <p className="text-red-500 text-xs mt-1">{errors.students}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Teachers
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newDivision.teachers}
                    onChange={(e) => setNewDivision({ ...newDivision, teachers: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                      errors.teachers ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.teachers && <p className="text-red-500 text-xs mt-1">{errors.teachers}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Courses
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newDivision.courses}
                    onChange={(e) => setNewDivision({ ...newDivision, courses: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                      errors.courses ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.courses && <p className="text-red-500 text-xs mt-1">{errors.courses}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={resetModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium"
                >
                  {newDivision.id ? "Save Changes" : "Create Division"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StandardDashboard;