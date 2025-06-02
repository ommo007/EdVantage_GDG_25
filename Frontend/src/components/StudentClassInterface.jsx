import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  FileText,
  Video,
  Link as LinkIcon,
  ExternalLink,
  Calendar,
  Bell,
  ChevronRight,
  AlertCircle,
  User,
  PieChart,
  ArrowRight
} from 'lucide-react';

import DashboardHeader from "./shared/DashboardHeader";
import { supabase } from "../lib/supabaseClient";
import { getStudentClassDetails } from "../services/student_service";
import { getAnnouncements } from "../services/announcement_service";

const StudentClassInterface = () => {
  const [classData, setClassData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
  const fetchData = async () => {
    try {
      setIsLoading(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log("StudentClassInterface: user =", user);
      if (userError || !user) throw new Error("User not logged in");

      const classDetails = await getStudentClassDetails(user.id);
      console.log("StudentClassInterface: classDetails =", classDetails);
      setClassData(classDetails);

      const classAnnouncements = await getAnnouncements(classDetails.id);
      setAnnouncements(classAnnouncements);

    } catch (err) {
      console.error("Failed to load student class info:", err);
      setError("Failed to load class information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
}, []);

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);
    // if (subjectId) {
    //   navigate(`/student/study-space/${subjectId}`);
    // }
  };

  const handleEnterStudySpace = () => {
    if (selectedSubject) {
      navigate(`/student/study-space/${selectedSubject}`);
    } else {
      alert("Please select a subject.");
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
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-indigo-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-indigo-50 to-white">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg max-w-md mx-auto">
          <AlertCircle className="h-8 w-8 mb-4" />
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error || "Class info not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <DashboardHeader userRole="student" />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center mb-2">
  <h1 className="text-3xl font-bold text-indigo-900">
    {classData.name} <span className="text-purple-600">Section {classData.section}</span>
  </h1>
</div>

              <div className="flex items-center gap-4 mt-2 text-indigo-700">
                <User className="h-5 w-5 mr-2" />
  <span className="font-medium">
    {classData.teachers && classData.teachers.length > 0
      ? classData.teachers.join(", ")
      : "No teacher assigned"}
  </span>

                <div className="relative group">
                  <select
                    value={selectedSubject}
                    onChange={handleSubjectChange}
                    className="w-full appearance-none px-4 pr-10 py-3 bg-gradient-to-r from-white to-indigo-50 border-2 border-indigo-200 rounded-lg text-indigo-700 font-medium shadow-sm hover:shadow-md hover:border-indigo-300 focus:outline-none focus:ring-3 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 ease-in-out cursor-pointer"
                  >
                    <option value="">📚 Select Subject</option>
                    {classData.subjects.map((subject, index) => (
                      <option key={index} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
    <svg
      className="w-5 h-5 text-indigo-500 group-hover:text-indigo-600 transition-all duration-300 group-focus-within:rotate-180"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
    </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleEnterStudySpace}
              className={`bg-indigo-600 text-white px-6 py-3 rounded-md transition duration-300 font-medium flex items-center ${
                !selectedSubject ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"
              }`}
              disabled={!selectedSubject}
            >
              Enter Classroom
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 mb-8">
          <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-indigo-600" />
            Your Performance
          </h2>

          <div className="mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-indigo-600">Overall Progress</span>
              <span className="text-sm font-medium">{classData.performance.overallProgress}%</span>
            </div>
            <div className="bg-indigo-100 rounded h-2.5 mt-1">
              <div
                className="bg-indigo-600 h-2.5 rounded"
                style={{ width: `${classData.performance.overallProgress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-indigo-50 p-4 rounded-md">
              <h3 className="text-sm text-indigo-600 mb-1">Quizzes</h3>
              <p className="text-xl font-bold">{classData.performance.quizzesAttempted}/{classData.performance.totalQuizzes}</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-md">
              <h3 className="text-sm text-indigo-600 mb-1">Assignments</h3>
              <p className="text-xl font-bold">{classData.performance.assignmentsSubmitted}/{classData.performance.totalAssignments}</p>
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
          <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-indigo-600" />
            Announcements
          </h2>

          {announcements.length ? (
            <div className="space-y-4">
              {announcements.map((a) => (
                <div key={a.announcement_id} className="border-b py-3">
                  <h3 className="text-indigo-900 font-medium">{a.title}</h3>
                  <span className="text-xs text-indigo-400 block mb-1">{formatDate(a.publish_date)}</span>
                  <p className="text-indigo-700">{a.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-indigo-500">No announcements yet.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentClassInterface;