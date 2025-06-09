"use client";

import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, Users, UserPlus, BookOpen, Plus, School, MoreVertical, Edit, Trash, Mail, User, X,
} from "lucide-react";
import SearchBar from "./dashboard/SearchBar";
import StatCard from "./shared/StatCard";
import { supabase } from "../lib/supabaseClient";
import {
  getDivisionDetails,
  addStudentToDivision,
  removeStudentFromDivision,
  editStudent,
  addTeacherToDivision,
  removeTeacherFromDivision,
  editTeacher,
  addCourseToDivision,
  removeCourseFromDivision,
  editCourse
} from "../services/admin_service";

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

  function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [newItemData, setNewItemData] = useState({
    name: "",
    email: "",
    status: "active",
    subjects: [],
    teacher: "Unassigned",
    subject_id: "",
    teacher_user_id: "",
    student_user_id: ""
  });
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    fetchDivisionData();
    // eslint-disable-next-line
  }, [standardId, divisionId]);

  const fetchDivisionData = async () => {
    try {
      setIsLoading(true);
      const { division, students, teachers, courses } = await getDivisionDetails(divisionId);
      setDivision(division);
      setStudents(students);
      setTeachers(teachers);
      setCourses(courses);
    } catch (err) {
      alert("Division not found. Redirecting to standard dashboard.");
      navigate(`/admin/standard/${standardId}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- STUDENT CRUD ---
const handleAddStudent = async () => {
  try {
    console.log("Adding student:", newItemData);
    const newUserId = uuidv4();
    // Split name into first and last
    const [firstName, ...lastNameParts] = newItemData.name.trim().split(" ");
    const lastName = lastNameParts.join(" ") || "Student";
    // 1. Create user in user_profiles
    const { data: userProfile, error: userProfileError } = await supabase
      .from('user_profiles')
      .insert([{
        user_id: newUserId,
        first_name: firstName,
        last_name: lastName,
        email: newItemData.email,
        role_id: 3 // student
      }])
      .select()
      .single();
    if (userProfileError) {
      console.error("userProfileError:", userProfileError);
      throw userProfileError;
    }
    // 2. Create student in students table
    const { error: studentError } = await supabase
      .from('students')
      .insert([{ user_id: newUserId }]);
    if (studentError) {
      console.error("studentError:", studentError);
      throw studentError;
    }
    // 3. Enroll student in this class/division
    await addStudentToDivision(newUserId, division.id);

    setShowAddModal(false);
    resetNewItemData();
    await fetchDivisionData();
  } catch (err) {
    console.error("Failed to add student:", err);
    alert("Failed to add student. Make sure the email is unique and valid.");
  }
};

const handleEditStudent = async () => {
  try {
    console.log("Editing student:", editItemId, newItemData);
    await editStudent(editItemId, newItemData);
    setShowAddModal(false);
    resetNewItemData();
    await fetchDivisionData();
  } catch (err) {
    console.error("Failed to edit student:", err);
    alert("Failed to edit student.");
  }
};

// --- TEACHER CRUD ---
const handleAddTeacher = async () => {
  try {
    console.log("Adding teacher:", newItemData);
    const newUserId = uuidv4();
    const [firstName, ...lastNameParts] = newItemData.name.trim().split(" ");
    const lastName = lastNameParts.join(" ") || "Teacher";
    const { data: userProfile, error: userProfileError } = await supabase
      .from('user_profiles')
      .insert([{
        user_id: newUserId,
        first_name: firstName,
        last_name: lastName,
        email: newItemData.email,
        role_id: 2 // teacher
      }])
      .select()
      .single();
    if (userProfileError) {
      console.error("userProfileError:", userProfileError);
      throw userProfileError;
    }
    const { error: teacherError } = await supabase
      .from('teachers')
      .insert([{ user_id: newUserId }]);
    if (teacherError) {
      console.error("teacherError:", teacherError);
      throw teacherError;
    }
    await addTeacherToDivision(newUserId, division.id, newItemData.subject_id);

    setShowAddModal(false);
    resetNewItemData();
    await fetchDivisionData();
  } catch (err) {
    console.error("Failed to add teacher:", err);
    alert("Failed to add teacher. Make sure the email is unique and valid.");
  }
};

const handleEditTeacher = async () => {
  try {
    console.log("Editing teacher:", editItemId, newItemData);
    await editTeacher(editItemId, newItemData);
    setShowAddModal(false);
    resetNewItemData();
    await fetchDivisionData();
  } catch (err) {
    console.error("Failed to edit teacher:", err);
    alert("Failed to edit teacher.");
  }
};

// --- COURSE CRUD ---
const handleAddCourse = async () => {
  try {
    console.log("Adding course:", newItemData);
    // 1. Create subject if needed
    let subjectId = newItemData.subject_id;
    if (!subjectId) {
      const { data: subject, error: subjectError } = await supabase
        .from('subjects')
        .insert([{ name: newItemData.name }])
        .select()
        .single();
      if (subjectError) {
        console.error("subjectError:", subjectError);
        throw subjectError;
      }
      subjectId = subject.subject_id;
    }
    // 2. Create teacher if needed
    let teacherUserId = newItemData.teacher_user_id;
    if (!teacherUserId) {
      const { data: userProfile, error: userProfileError } = await supabase
        .from('user_profiles')
        .insert([{
          first_name: newItemData.teacher,
          email: newItemData.teacher_email,
          role_id: 2 // teacher
        }])
        .select()
        .single();
      if (userProfileError) {
        console.error("userProfileError:", userProfileError);
        throw userProfileError;
      }
      const { error: teacherError } = await supabase.from('teachers').insert([{ user_id: userProfile.user_id }]);
      if (teacherError) {
        console.error("teacherError:", teacherError);
        throw teacherError;
      }
      teacherUserId = userProfile.user_id;
    }
    // 3. Add course to class_subjects
    await addCourseToDivision(division.id, subjectId, teacherUserId);

    setShowAddModal(false);
    resetNewItemData();
    await fetchDivisionData();
  } catch (err) {
    console.error("Failed to add course:", err);
    alert("Failed to add course.");
  }
};

const handleEditCourse = async () => {
  try {
    console.log("Editing course:", editItemId, newItemData);
    await editCourse(editItemId, newItemData);
    setShowAddModal(false);
    resetNewItemData();
    await fetchDivisionData();
  } catch (err) {
    console.error("Failed to edit course:", err);
    alert("Failed to edit course.");
  }
};


  // Modal openers
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditItemId(null);
    setNewItemData({
      name: "",
      email: "",
      status: "active",
      subjects: [],
      teacher: "Unassigned",
      subject_id: "",
      teacher_user_id: "",
      student_user_id: ""
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (item, tab) => {
    setIsEditing(true);
    setEditItemId(item.id);
    setNewItemData({ ...item });
    setShowAddModal(true);
  };

  const resetNewItemData = () => {
    setNewItemData({
      name: "",
      email: "",
      status: "active",
      subjects: [],
      teacher: "Unassigned",
      subject_id: "",
      teacher_user_id: "",
      student_user_id: ""
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

  const toggleActionMenu = (itemId) => {
    setActiveActionMenu(activeActionMenu === itemId ? null : itemId);
  };

  // Filtering logic for search
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
        (course.teacher && course.teacher.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
  };

  if (isLoading || !division) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // --- Modal for Add/Edit ---
  const renderAddModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-indigo-900">
            {isEditing
              ? activeTab === "students"
                ? "Edit Student"
                : activeTab === "teachers"
                ? "Edit Teacher"
                : "Edit Course"
              : activeTab === "students"
              ? "Add New Student"
              : activeTab === "teachers"
              ? "Assign New Teacher"
              : "Add New Course"}
          </h2>
          <button
            onClick={() => setShowAddModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          {/* Students Tab */}
          {activeTab === "students" && (
  <>
    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
    <input
      type="text"
      className="w-full px-3 py-2 border border-gray-300 rounded-md"
      value={newItemData.name}
      onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
      placeholder="Enter student name"
    />
    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
    <input
      type="email"
      className="w-full px-3 py-2 border border-gray-300 rounded-md"
      value={newItemData.email}
      onChange={(e) => setNewItemData({ ...newItemData, email: e.target.value })}
      placeholder="Enter student email"
    />
  </>
)}
         {activeTab === "teachers" && (
  <>
    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
    <input
      type="text"
      className="w-full px-3 py-2 border border-gray-300 rounded-md"
      value={newItemData.name}
      onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
      placeholder="Enter teacher name"
    />
    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
    <input
      type="email"
      className="w-full px-3 py-2 border border-gray-300 rounded-md"
      value={newItemData.email}
      onChange={(e) => setNewItemData({ ...newItemData, email: e.target.value })}
      placeholder="Enter teacher email"
    />
    <label className="block text-sm font-medium text-gray-700 mb-1">Subject ID</label>
    <input
      type="text"
      className="w-full px-3 py-2 border border-gray-300 rounded-md"
      value={newItemData.subject_id}
      onChange={(e) => setNewItemData({ ...newItemData, subject_id: e.target.value })}
      placeholder="Enter subject ID"
    />
  </>
)}

{activeTab === "courses" && (
  <>
    <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
    <input
      type="text"
      className="w-full px-3 py-2 border border-gray-300 rounded-md"
      value={newItemData.name}
      onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
      placeholder="Enter course name"
    />
    <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Name</label>
    <input
      type="text"
      className="w-full px-3 py-2 border border-gray-300 rounded-md"
      value={newItemData.teacher}
      onChange={(e) => setNewItemData({ ...newItemData, teacher: e.target.value })}
      placeholder="Enter teacher name"
    />
    <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Email</label>
    <input
      type="email"
      className="w-full px-3 py-2 border border-gray-300 rounded-md"
      value={newItemData.teacher_email}
      onChange={(e) => setNewItemData({ ...newItemData, teacher_email: e.target.value })}
      placeholder="Enter teacher email"
    />
    <label className="block text-sm font-medium text-gray-700 mb-1">Subject ID</label>
    <input
      type="text"
      className="w-full px-3 py-2 border border-gray-300 rounded-md"
      value={newItemData.subject_id}
      onChange={(e) => setNewItemData({ ...newItemData, subject_id: e.target.value })}
      placeholder="Enter subject ID"
    />
  </>
)}
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
  onClick={async () => {
    if (isEditing) {
      if (activeTab === "students") await handleEditStudent();
      else if (activeTab === "teachers") await handleEditTeacher();
      else if (activeTab === "courses") await handleEditCourse();
    } else {
      if (activeTab === "students") await handleAddStudent();
      else if (activeTab === "teachers") await handleAddTeacher();
      else if (activeTab === "courses") await handleAddCourse();
    }
  }}
  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
>
  {isEditing
    ? activeTab === "teachers"
      ? "Save Teacher"
      : activeTab === "courses"
      ? "Save Course"
      : "Save Student"
    : activeTab === "teachers"
    ? "Assign"
    : "Add"}
</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Link to={`/admin/${standardId}`} className="mr-2">
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
                                Uncomment to enable editing
                                <button
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  onClick={() => handleOpenEditModal(student, "students")}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Student
                                </button>
                               
                                <button
                                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                                  onClick={() => handleRemoveStudent(student.id)}
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
                                  onClick={() => handleOpenEditModal(teacher, "teachers")}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Teacher
                                </button>
                                
                                <button
                                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                                  onClick={() => handleRemoveTeacher(teacher.id, /* subject_id if needed */)}
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
                                  onClick={() => handleOpenEditModal(course, "courses")}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Course
                                </button>
                                
                                <button
                                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                                  onClick={() => handleRemoveCourse(course.subject_id)}
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
      {/* Add/Edit Modal */}
      {showAddModal && renderAddModal()}
    </div>
  );
};

export default DivisionDashboard;