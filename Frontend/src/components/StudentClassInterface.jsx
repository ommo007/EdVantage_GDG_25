import { useState } from 'react';
import {
  Users,
  BookOpen,
  FileText,
  Video,
  ExternalLink,
  Calendar,
  Bell,
  ChevronRight,
  AlertCircle,
  User,
  PieChart,
  ArrowRight,
  Play,
  Trophy,
  Target
} from 'lucide-react';

import DashboardHeader from "./shared/DashboardHeader";
import { useNavigate } from "react-router-dom";

// Demo data for class details
const demoClassData = {
  name: "Class 9",
  section: "A",
  teachers: ["Ashima Gupta"],
  performance: {
    totalQuizzes: 8,
    quizzesAttempted: 7,
    totalAssignments: 10,
    assignmentsSubmitted: 9,
    overallProgress: 78
  }
};

const demoAnnouncements = [
  {
    announcement_id: 1,
    title: "Welcome to Class 9!",
    content: "First day of class is June 10th. Please bring your notebooks and be ready for an exciting journey!",
    publish_date: "2024-06-01"
  },
  {
    announcement_id: 2,
    title: "Math Quiz Next Week",
    content: "Quiz on Algebra chapters 1-3 scheduled for next Friday.",
    publish_date: "2024-06-05"
  }
];

// Static subject list with icons
const subjectList = [
  { id: "mathematics", name: "Mathematics", icon: "📐", color: "from-blue-500 to-blue-600" },
  { id: "science", name: "Science", icon: "🧪", color: "from-green-500 to-green-600" },
  { id: "history", name: "History", icon: "🏛️", color: "from-amber-500 to-amber-600" },
  { id: "civics", name: "Civics", icon: "⚖️", color: "from-purple-500 to-purple-600" },
  { id: "economics", name: "Economics", icon: "📊", color: "from-teal-500 to-teal-600" },
  { id: "english", name: "English", icon: "📚", color: "from-rose-500 to-rose-600" },
  { id: "geography", name: "Geography", icon: "🌍", color: "from-emerald-500 to-emerald-600" }
];

const StudentClassInterface = () => {
  const [classData] = useState(demoClassData);
  const [announcements] = useState(demoAnnouncements);
  const [isLoading] = useState(false);
  const [error] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("");

  const navigate = useNavigate();

  const handleSubjectChange = (subjectId) => {
    setSelectedSubject(subjectId);
  };

  const handleEnterStudySpace = () => {
  if (selectedSubject) {
    navigate(`/student/study-space/${selectedSubject}`);
    console.log(`Navigating to study space for ${selectedSubject}`);
  }
};

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg max-w-md mx-auto">
          <AlertCircle className="h-8 w-8 mb-4" />
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error || "Class info not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <DashboardHeader userRole="student" />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                      {classData.name} <span className="text-purple-600">Section {classData.section}</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-2 text-gray-600">
                      <User className="h-4 w-4" />
                      <span className="text-sm">
                        {classData.teachers && classData.teachers.length > 0
                          ? classData.teachers.join(", ")
                          : "No teacher assigned"}
                      </span>
                    </div>
                  </div>
                </div>
                
                {selectedSubject && (
  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 inline-block">
    <p className="text-sm text-indigo-700">
      <span className="font-medium">Selected Subject:</span>{" "}
      {subjectList.find((s) => s.id === selectedSubject)?.name || selectedSubject}
    </p>
  </div>
)}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleEnterStudySpace}
                  disabled={!selectedSubject}
                  className={`group relative px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                    !selectedSubject 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl active:scale-95"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <Play className="mr-2 h-5 w-5" />
                    Enter Classroom
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                  {selectedSubject && (
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity"></div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <BookOpen className="h-6 w-6 mr-3 text-indigo-600" />
              Choose Your Subject
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              {subjectList.map((subject) => (
                <button
    key={subject.id}
    onClick={() => handleSubjectChange(subject.id)}
    className={`group relative p-6 rounded-xl transition-all duration-300 transform hover:scale-105 ${
      selectedSubject === subject.id
        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl scale-105"
        : "bg-white hover:bg-gray-50 text-gray-700 shadow-md hover:shadow-lg border border-gray-200"
    }`}
  >
    <div className="text-center">
      <div className="text-3xl mb-3">{subject.icon}</div>
      <h3 className="font-semibold text-sm leading-tight">{subject.name}</h3>
    </div>
    {selectedSubject === subject.id && (
      <div className="absolute top-2 right-2">
        <div className="w-3 h-3 bg-white rounded-full"></div>
      </div>
    )}
  </button>
              ))}
            </div>
          </div>
        </div>

        {/* Performance and Announcements Row */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Performance Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Trophy className="h-6 w-6 mr-3 text-indigo-600" />
              Your Performance
            </h2>

            {/* Overall Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600 font-medium">Overall Progress</span>
                <span className="text-2xl font-bold text-indigo-600">{classData.performance.overallProgress}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${classData.performance.overallProgress}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">
                    {classData.performance.quizzesAttempted}/{classData.performance.totalQuizzes}
                  </span>
                </div>
                <h3 className="text-blue-800 font-semibold">Quizzes Completed</h3>
                <p className="text-blue-600 text-sm mt-1">
                  {Math.round((classData.performance.quizzesAttempted / classData.performance.totalQuizzes) * 100)}% completion rate
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="h-6 w-6 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    {classData.performance.assignmentsSubmitted}/{classData.performance.totalAssignments}
                  </span>
                </div>
                <h3 className="text-green-800 font-semibold">Assignments Done</h3>
                <p className="text-green-600 text-sm mt-1">
                  {Math.round((classData.performance.assignmentsSubmitted / classData.performance.totalAssignments) * 100)}% completion rate
                </p>
              </div>
            </div>
          </div>

          {/* Announcements Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Bell className="h-6 w-6 mr-3 text-indigo-600" />
              Latest Announcements
            </h2>

            {announcements.length ? (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.announcement_id} className="bg-gradient-to-r from-gray-50 to-indigo-50 p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-gray-800 font-semibold text-lg">{announcement.title}</h3>
                      <span className="text-xs text-indigo-500 bg-indigo-100 px-3 py-1 rounded-full">
                        {formatDate(announcement.publish_date)}
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{announcement.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No announcements yet</p>
                <p className="text-gray-400 text-sm">Check back later for updates</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentClassInterface;