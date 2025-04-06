import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  ArrowRight,
  BookOpen,
  FilePlus,
  Activity,
  CheckCircle,
  Clock,
  GraduationCap,
  Database,
  FileText,
  UserCheck,
  Award,
  PieChart,
  MessageSquare,
  BarChart2,
  Upload,
  Bell,
  LogOut,
  Brain,
} from 'lucide-react';

import DashboardHeader from './shared/DashboardHeader';
import StatCard from './shared/StatCard';
import DashboardInitializer from './shared/DashboardInitializer';

// Mock data for classroom details
const mockClassroomData = {
  standard5A: {
    id: 'standard5A',
    name: 'Standard 5',
    section: 'A',
    studentCount: 25,
    subjects: ['Mathematics', 'Science', 'English'],
    attendance: {
      daily: 92,
      weekly: 88,
      monthly: 85,
    },
    performance: {
      avgQuizScore: 76,
      assignmentCompletion: 82,
      participationRate: 78,
    },
    engagement: {
      studySpaceTime: '4.2 hrs/week',
      chatbotInteractions: 156,
      liveParticipation: 84,
    },
    topStudents: [
      { name: 'Alex Johnson', score: 95, avatar: 'AJ' },
      { name: 'Priya Sharma', score: 92, avatar: 'PS' },
      { name: 'Michael Wong', score: 90, avatar: 'MW' },
    ],
    recentAnnouncements: [
      {
        id: 1,
        title: 'Mathematics Quiz',
        date: '2025-04-05',
        content: 'Quiz on Chapter 5 - Fractions and Decimals',
      },
      {
        id: 2,
        title: 'Science Project Deadline',
        date: '2025-04-10',
        content: 'Final submission for the Environmental Science project',
      },
    ],
    studyMaterials: [
      { id: 1, name: 'Mathematics Chapter 5 Notes', type: 'PDF' },
      { id: 2, name: 'Science Experiment Guidelines', type: 'DOCX' },
      { id: 3, name: 'English Grammar Exercises', type: 'PDF' },
    ],
  },
};

const AssignedClass = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSubject, setSelectedSubject] = useState(""); // Add this state
  useEffect(() => {
    fetchClassroomData();
  }, [classId]);

  const fetchClassroomData = async () => {
    try {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Fetch data based on classId
      const data = mockClassroomData[classId] || Object.values(mockClassroomData)[0];
      setClassData(data);
    } catch (err) {
      setError('Failed to load classroom data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardInitializer expectedRole="teacher">
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardInitializer>
    );
  }

  if (error || !classData) {
    return (
      <DashboardInitializer expectedRole="teacher">
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-8">
          <div className="bg-red-50 text-red-600 p-6 rounded-lg max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-2">Error</h3>
            <p>{error || 'Classroom not found'}</p>
            <Link to="/assigned-classes" className="mt-4 inline-block text-indigo-600 font-medium">
              Back to Assigned Classes
            </Link>
          </div>
        </div>
      </DashboardInitializer>
    );
  }

  return (
    <DashboardInitializer expectedRole="teacher">
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
        {/* Header */}
        <DashboardHeader userRole="teacher" />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Classroom Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center">
                <Link to="/instructor" className="text-indigo-600 hover:text-indigo-800 mr-2">
                  <ArrowRight className="h-5 w-5 transform rotate-180" />
                </Link>
                <h1 className="text-3xl font-bold text-indigo-900">
                  {classData.name} <span className="text-indigo-600">Section {classData.section}</span>
                </h1>
              </div>
              <p className="text-indigo-600 mt-2">
                {classData.subjects.join(', ')} • {classData.studentCount} Students
              </p>
              {/* Subject Dropdown */}
<div className="mt-2">
  <select
    value={selectedSubject}
    onChange={(e) => setSelectedSubject(e.target.value)} // Update the selected subject
    className="px-3 py-2 border border-indigo-300 rounded-md text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
  >
    <option value="">Select Subject</option>
    {classData.subjects.map((subject, index) => (
      <option key={index} value={subject}>
        {subject}
      </option>
    ))}
  </select>
</div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-4 py-2 rounded-md transition duration-300 flex items-center"
                onClick={() => alert('Announcements feature coming soon!')}
              >
                <Bell className="h-4 w-4 mr-2" />
                Announcements
              </button>
              <button
  className={`bg-indigo-600 text-white px-4 py-2 rounded-md transition duration-300 flex items-center ${
    !selectedSubject ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
  }`}
  onClick={() => {
    if (selectedSubject) {
      // Navigate to the selected subject's study space
      navigate(`/instructor/class/${classData.id}/study-space/${selectedSubject}`);
    } else {
      alert('Please select a subject to proceed to the study space.');
    }
  }}
  disabled={!selectedSubject} // Disable the button if no subject is selected
>
  <LogOut className="h-4 w-4 mr-2" />
  Enter Classroom
</button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="bg-white rounded-t-xl shadow-sm border border-indigo-100 mb-6 overflow-x-auto">
            <div className="flex">
              <button
                className={`px-6 py-4 font-medium text-center flex items-center ${
                  activeTab === 'overview'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-indigo-400 hover:text-indigo-600'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                <Activity className="h-4 w-4 mr-2" />
                Overview & Statistics
              </button>
              <button
                className={`px-6 py-4 font-medium text-center flex items-center ${
                  activeTab === 'resources'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-indigo-400 hover:text-indigo-600'
                }`}
                onClick={() => setActiveTab('resources')}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Lecture & Study Resources
              </button>
              <button
                className={`px-6 py-4 font-medium text-center flex items-center ${
                  activeTab === 'students'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-indigo-400 hover:text-indigo-600'
                }`}
                onClick={() => setActiveTab('students')}
              >
                <Users className="h-4 w-4 mr-2" />
                Student Management
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div>
              {/* Overview Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  icon={<UserCheck className="h-6 w-6 text-indigo-600" />}
                  title="Daily Attendance"
                  value={`${classData.attendance.daily}%`}
                  bgColor="bg-indigo-100"
                  textColor="text-indigo-700"
                />
                <StatCard
                  icon={<Award className="h-6 w-6 text-purple-600" />}
                  title="Avg. Quiz Score"
                  value={`${classData.performance.avgQuizScore}%`}
                  bgColor="bg-purple-100"
                  textColor="text-purple-700"
                />
                <StatCard
                  icon={<CheckCircle className="h-6 w-6 text-green-600" />}
                  title="Assignment Completion"
                  value={`${classData.performance.assignmentCompletion}%`}
                  bgColor="bg-green-100"
                  textColor="text-green-700"
                />
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div>
              {/* Resources Content */}
              <h2 className="text-xl font-bold text-indigo-900 mb-4">Lecture & Study Resources</h2>
              <p>Manage your study materials here.</p>
            </div>
          )}

          {activeTab === 'students' && (
            <div>
              {/* Students Content */}
              <h2 className="text-xl font-bold text-indigo-900 mb-4">Student Management</h2>
              <p>Manage your students here.</p>
            </div>
          )}
        </main>
      </div>
    </DashboardInitializer>
  );
};

export default AssignedClass;