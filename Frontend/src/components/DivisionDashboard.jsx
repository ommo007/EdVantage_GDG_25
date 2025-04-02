
"use client"

import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Users, 
  UserPlus,
  BookOpen,
  Plus,
  School,
  MoreVertical,
  Edit,
  Trash,
  Mail,
  User,
  X,
  Check,
} from "lucide-react";

import SearchBar from "./dashboard/SearchBar";
import StatCard from "./shared/StatCard";

// Mock data
const mockDivisionDetails = {
  1: { id: 1, name: "Division A", standardId: 1, standardName: "5th Standard" },
  2: { id: 2, name: "Division B", standardId: 1, standardName: "5th Standard" },
  3: { id: 3, name: "Division C", standardId: 1, standardName: "5th Standard" },
  4: { id: 4, name: "Division A", standardId: 2, standardName: "6th Standard" },
  5: { id: 5, name: "Division B", standardId: 2, standardName: "6th Standard" },
};

const mockStudents = {
  1: [
    { id: 1, name: "Alex Johnson", email: "alex.j@example.com", status: "active" },
    { id: 2, name: "Emma Wilson", email: "emma.w@example.com", status: "active" },
    { id: 3, name: "Ethan Davis", email: "ethan.d@example.com", status: "active" },
    { id: 4, name: "Olivia Smith", email: "olivia.s@example.com", status: "inactive" },
  ],
};

const mockTeachers = {
  1: [
    { id: 1, name: "Mr. Robert Brown", email: "robert.b@example.com", subjects: ["Mathematics", "Science"] },
    { id: 2, name: "Ms. Jennifer Lee", email: "jennifer.l@example.com", subjects: ["English", "Social Studies"] },
  ],
};

const mockCourses = {
  1: [
    { id: 1, name: "Mathematics", teacher: "Mr. Robert Brown", status: "active" },
    { id: 2, name: "Science", teacher: "Mr. Robert Brown", status: "active" },
    { id: 3, name: "English", teacher: "Ms. Jennifer Lee", status: "active" },
    { id: 4, name: "Social Studies", teacher: "Ms. Jennifer Lee", status: "active" },
    { id: 5, name: "Arts", teacher: "Unassigned", status: "inactive" },
    { id: 6, name: "Physical Education", teacher: "Unassigned", status: "active" },
  ],
};

// Available subjects for teacher selection
const availableSubjects = [
  "Mathematics", "Science", "English", "Social Studies", "Arts", "Physical Education",
  "Computer Science", "Music", "Foreign Language", "History", "Geography"
];

const DivisionDashboard = () => {
  const { standardId, divisionId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("students");
  const [searchTerm, setSearchTerm] = useState("");
  const [division, setDivision] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemData, setNewItemData] = useState({
    name: "",
    email: "",
    status: "active",
    subjects: [],
    teacher: "Unassigned"
  });
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    fetchDivisionData();
  }, [standardId, divisionId]);

  const fetchDivisionData = async () => {
    try {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const divisionData = mockDivisionDetails[divisionId];
      if (!divisionData || divisionData.standardId.toString() !== standardId.toString()) {
        navigate(`/admin/standard/${standardId}`);
        return;
      }
      
      setDivision(divisionData);
      setStudents(mockStudents[divisionId] || []);
      setTeachers(mockTeachers[divisionId] || []);
      setCourses(mockCourses[divisionId] || []);
    } catch (err) {
      console.error("Error fetching division data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActionMenu = (itemId) => {
    setActiveActionMenu(activeActionMenu === itemId ? null : itemId);
  };

  const handleAddItem = () => {
    if (activeTab === "students") {
      if (!newItemData.name || !newItemData.email) return;
      
      const newStudent = {
        id: students.length ? Math.max(...students.map(s => s.id)) + 1 : 1,
        name: newItemData.name,
        email: newItemData.email,
        status: newItemData.status
      };
      
      setStudents([...students, newStudent]);
    } 
    else if (activeTab === "teachers") {
      if (!newItemData.name || !newItemData.email || !newItemData.subjects.length) return;
      
      const newTeacher = {
        id: teachers.length ? Math.max(...teachers.map(t => t.id)) + 1 : 1,
        name: newItemData.name,
        email: newItemData.email,
        subjects: [...newItemData.subjects]
      };
      
      setTeachers([...teachers, newTeacher]);
    } 
    else if (activeTab === "courses") {
      if (!newItemData.name) return;
      
      const newCourse = {
        id: courses.length ? Math.max(...courses.map(c => c.id)) + 1 : 1,
        name: newItemData.name,
        teacher: newItemData.teacher,
        status: newItemData.status
      };
      
      setCourses([...courses, newCourse]);
    }
    
    setShowAddModal(false);
    resetNewItemData();
  };

  const resetNewItemData = () => {
    setNewItemData({
      name: "",
      email: "",
      status: "active",
      subjects: [],
      teacher: "Unassigned"
    });
    setSelectedSubject("");
  };

  const handleAddSubject = () => {
    if (selectedSubject && !newItemData.subjects.includes(selectedSubject)) {
      setNewItemData({
        ...newItemData,
        subjects: [...newItemData.subjects, selectedSubject]
      });
      setSelectedSubject("");
    }
  };

  const handleRemoveSubject = (subjectToRemove) => {
    setNewItemData({
      ...newItemData,
      subjects: newItemData.subjects.filter(subject => subject !== subjectToRemove)
    });
  };

  const handleOpenAddModal = () => {
    resetNewItemData();
    setShowAddModal(true);
  };

  
const removeItem = (id) => {
  if (activeTab === "students") {
    setStudents(students.filter(student => student.id !== id));
  } else if (activeTab === "teachers") {
    setTeachers(teachers.filter(teacher => teacher.id !== id));
  } else if (activeTab === "courses") {
    setCourses(courses.filter(course => course.id !== id));
  }
  setActiveActionMenu(null);
};

const filteredItems = () => {
  if (activeTab === "students") {
    return students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } else if (activeTab === "teachers") {
    return teachers.filter(teacher => 
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } else {
    return courses.filter(course => 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacher.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
};

// Modal for adding new items
const renderAddModal = () => {
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showAddModal ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-indigo-900">
            {activeTab === "students" 
              ? "Add New Student" 
              : activeTab === "teachers" 
                ? "Assign New Teacher" 
                : "Add New Course"
            }
          </h2>
          <button 
            onClick={() => setShowAddModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {activeTab === "courses" ? "Course Name" : "Name"}
            </label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newItemData.name}
              onChange={(e) => setNewItemData({...newItemData, name: e.target.value})}
              placeholder={activeTab === "courses" ? "Enter course name" : "Enter name"}
            />
          </div>
          
          {activeTab !== "courses" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input 
                type="email" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newItemData.email}
                onChange={(e) => setNewItemData({...newItemData, email: e.target.value})}
                placeholder="Enter email address"
              />
            </div>
          )}
          
          {activeTab === "students" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newItemData.status}
                onChange={(e) => setNewItemData({...newItemData, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}
          
          {activeTab === "teachers" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subjects
              </label>
              <div className="flex mb-2">
                <select 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">Select a subject</option>
                  {availableSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                <button 
                  onClick={handleAddSubject}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {newItemData.subjects.map((subject, index) => (
                  <div key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center text-sm">
                    {subject}
                    <button 
                      onClick={() => handleRemoveSubject(subject)}
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === "courses" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign Teacher
              </label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newItemData.teacher}
                onChange={(e) => setNewItemData({...newItemData, teacher: e.target.value})}
              >
                <option value="Unassigned">Unassigned</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.name}>{teacher.name}</option>
                ))}
              </select>
            </div>
          )}
          
          {activeTab === "courses" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newItemData.status}
                onChange={(e) => setNewItemData({...newItemData, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 mt-6">
            <button 
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddItem}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {activeTab === "teachers" ? "Assign" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

if (isLoading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
}

return (
  <div className="container mx-auto px-4 py-6">
    {/* Header */}
    <div className="mb-6">
      <div className="flex items-center mb-4">
        <Link to={`/admin/standard/${standardId}`} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-indigo-600" />
        </Link>
        <h1 className="text-2xl font-bold text-indigo-900">
          {division.standardName} - {division.name}
        </h1>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard 
          icon={<Users className="h-6 w-6 text-blue-600" />}
          title="Students"
          value={students.length}
          subtitle={`${students.filter(s => s.status === 'active').length} active`}
          color="blue"
        />
        <StatCard 
          icon={<UserPlus className="h-6 w-6 text-purple-600" />}
          title="Teachers"
          value={teachers.length}
          subtitle={`${teachers.reduce((acc, t) => acc + t.subjects.length, 0)} subjects covered`}
          color="purple"
        />
        <StatCard 
          icon={<BookOpen className="h-6 w-6 text-emerald-600" />}
          title="Courses"
          value={courses.length}
          subtitle={`${courses.filter(c => c.status === 'active').length} active`}
          color="emerald"
        />
      </div>
    </div>
    
    {/* Tabs and Search */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
      <div className="flex space-x-1 border-b border-gray-200 w-full md:w-auto">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "students"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("students")}
        >
          Students
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "teachers"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("teachers")}
        >
          Teachers
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === "courses"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("courses")}
        >
          Courses
        </button>
      </div>
      
      <div className="flex w-full md:w-auto space-x-2">
        <SearchBar 
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={`Search ${activeTab}...`}
          className="w-full md:w-64"
        />
        <button
          onClick={handleOpenAddModal}
          className="bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-1" />
          {activeTab === "students" 
            ? "Add Student" 
            : activeTab === "teachers" 
              ? "Add Teacher" 
              : "Add Course"
          }
        </button>
      </div>
    </div>
    
    {/* Content */}
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Students Tab */}
      {activeTab === "students" && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems().length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    No students found. Add a new student to get started.
                  </td>
                </tr>
              ) : (
                filteredItems().map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">ID: {student.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-1" />
                          {student.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        student.status === "active" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                         {student.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="relative">
                  <button 
                    onClick={() => toggleActionMenu(student.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  
                  {activeActionMenu === student.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <div className="py-1">
                        <button 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Student
                        </button>
                        <button 
                          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                          onClick={() => removeItem(student.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Remove Student
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
)}

{/* Teachers Tab */}
{activeTab === "teachers" && (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Teacher
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Contact
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Subjects
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {filteredItems().length === 0 ? (
          <tr>
            <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
              No teachers assigned to this division yet.
            </td>
          </tr>
        ) : (
          filteredItems().map((teacher) => (
            <tr key={teacher.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 bg-indigo-100 rounded-full flex items-center justify-center">
                    <School className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-1" />
                    {teacher.email}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                  {teacher.subjects.map((subject, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="relative">
                  <button 
                    onClick={() => toggleActionMenu(teacher.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  
                  {activeActionMenu === teacher.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <div className="py-1">
                        <button 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Teacher
                        </button>
                        <button 
                          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                          onClick={() => removeItem(teacher.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Remove Teacher
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
)}

{/* Courses Tab */}
{activeTab === "courses" && (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Course
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Teacher
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems().length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      No courses found. Add a course to get started.
                    </td>
                  </tr>
                ) : (
                  filteredItems().map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-emerald-100 rounded-full flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="ml-4 text-sm font-medium text-gray-900">
                            {course.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.teacher === "Unassigned" ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            Unassigned
                          </span>
                        ) : (
                          course.teacher
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          course.status === "active" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <button 
                            onClick={() => toggleActionMenu(course.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                          
                          {activeActionMenu === course.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                              <div className="py-1">
                                <button 
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Course
                                </button>
                                <button 
                                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                                  onClick={() => removeItem(course.id)}
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  Remove Course
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Pagination - could be implemented for larger datasets */}
      {filteredItems().length > 0 && (
        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
          <div>
            Showing <span className="font-medium">{filteredItems().length}</span> of{" "}
            <span className="font-medium">
              {activeTab === "students" 
                ? students.length 
                : activeTab === "teachers" 
                  ? teachers.length 
                  : courses.length
              }
            </span> {activeTab}
          </div>
          <div className="flex space-x-1">
            <button className="px-2 py-1 border border-gray-300 rounded-md disabled:opacity-50">
              Previous
            </button>
            <button className="px-2 py-1 bg-indigo-600 text-white rounded-md">
              1
            </button>
            <button className="px-2 py-1 border border-gray-300 rounded-md disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      )}
      
      {/* Add Modal */}
      {renderAddModal()}
    </div>
  );
};

export default DivisionDashboard;
