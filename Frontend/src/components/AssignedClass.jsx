
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Users,
  ArrowRight,
  BookOpen,
  Activity,
  CheckCircle,
  UserCheck,
  Award,
  Bell,
  LogOut,
  Plus,
  X,
} from 'lucide-react';

import DashboardHeader from './shared/DashboardHeader';
import StatCard from './shared/StatCard';
import DashboardInitializer from './shared/DashboardInitializer';

import { getClassDetails } from '../services/classroom_service';
import { getSubjectsForClass } from '../services/material_service';
import { getAnnouncements, createAnnouncement } from '../services/announcement_service';
import { getStudentsByClassId } from '../services/student_service';

const AssignedClass = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [classData, setClassData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementDesc, setAnnouncementDesc] = useState('');
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetchClassroomData();
  }, [classId]);

  const fetchClassroomData = async () => {
  try {
    setIsLoading(true);

    const classDetails = await getClassDetails(classId); // Supabase → classes
    const subjects = await getSubjectsForClass(classId); // Supabase → class_subjects + subjects
    const announcementsData = await getAnnouncements(classId);
    const students = await getStudentsByClassId(classId);

    setClassData({
      ...classDetails,
      subjects: subjects.map(s => s.name || s),
      studentCount: students.length,
      section: classDetails.section, // ✅ Use actual section/division now
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
    });

    setAnnouncements(announcementsData);
  } catch (err) {
    console.error(err);
    setError('Failed to load classroom data');
  } finally {
    setIsLoading(false);
  }
};

 const handleAddAnnouncement = async () => {
  if (!announcementTitle.trim() || !announcementDesc.trim()) {
    alert("Please fill in both title and description.");
    return;
  }

  const newAnnouncement = {
    title: announcementTitle,
    content: announcementDesc,
    publish_date: new Date().toISOString(),
  };


    try {
      const saved = await createAnnouncement(classId, newAnnouncement);
      setAnnouncements((prev) => [saved, ...prev]);
      setAnnouncementTitle('');
      setAnnouncementDesc('');
      setShowAnnouncementModal(false);
    } catch (e) {
      alert("Failed to save announcement");
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
                {classData.subjects?.join(', ') || 'No subjects'} • {classData.studentCount} Students
              </p>

              <div className="mt-2 relative group">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full appearance-none px-4 py-3 bg-gradient-to-r from-white to-indigo-50 border-2 border-indigo-200 rounded-lg text-indigo-700 font-medium shadow-sm hover:shadow-md hover:border-indigo-300 focus:outline-none focus:ring-3 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 ease-in-out cursor-pointer"
                >
                  <option value="" disabled className="text-gray-500 font-normal">
                    📚 Select Subject
                  </option>
                  {classData.subjects.map((subject, index) => (
                    <option key={index} value={subject} className="text-indigo-700 font-medium py-2">
                      {subject}
                    </option>
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

            <div className="flex items-center space-x-4">
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-md transition duration-300 flex items-center hover:bg-indigo-700"
                onClick={() => setShowAnnouncementModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Announcement
              </button>
              <button
                className={`bg-indigo-600 text-white px-4 py-2 rounded-md transition duration-300 flex items-center ${
                  !selectedSubject ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
                }`}
                onClick={() => {
                  if (selectedSubject) {
                    navigate(`/instructor/class/${classData.id}/study-space/${selectedSubject}`);
                  } else {
                    alert('Please select a subject to proceed to the study space.');
                  }
                }}
                disabled={!selectedSubject}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Enter Classroom
              </button>
            </div>
          </div>

          {/* Announcement Modal */}
          {showAnnouncementModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-indigo-600"
                  onClick={() => setShowAnnouncementModal(false)}
                >
                  <X className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Create Announcement
                </h2>
                <div className="mb-4">
                  <label className="block text-indigo-700 font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={announcementTitle}
                    onChange={e => setAnnouncementTitle(e.target.value)}
                    className="w-full border border-indigo-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter announcement title"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-indigo-700 font-medium mb-1">Description</label>
                  <textarea
                    value={announcementDesc}
                    onChange={e => setAnnouncementDesc(e.target.value)}
                    className="w-full border border-indigo-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter announcement details"
                    rows={4}
                  />
                </div>
                <button
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition w-full"
                  onClick={handleAddAnnouncement}
                >
                  Post Announcement
                </button>
              </div>
            </div>
          )}

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
                  activeTab === 'announcements'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-indigo-400 hover:text-indigo-600'
                }`}
                onClick={() => setActiveTab('announcements')}
              >
                <Bell className="h-4 w-4 mr-2" />
                Announcements
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard icon={<UserCheck className="h-6 w-6 text-indigo-600" />} title="Daily Attendance" value={`${classData.attendance.daily}%`} bgColor="bg-indigo-100" textColor="text-indigo-700" />
              <StatCard icon={<Award className="h-6 w-6 text-purple-600" />} title="Avg. Quiz Score" value={`${classData.performance.avgQuizScore}%`} bgColor="bg-purple-100" textColor="text-purple-700" />
              <StatCard icon={<CheckCircle className="h-6 w-6 text-green-600" />} title="Assignment Completion" value={`${classData.performance.assignmentCompletion}%`} bgColor="bg-green-100" textColor="text-green-700" />
            </div>
          )}

          {activeTab === 'announcements' && (
            <div>
              <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Announcements
              </h2>
              {announcements.length === 0 ? (
                <p className="text-indigo-600">No announcements yet.</p>
              ) : (
                <ul className="space-y-3">
                  {announcements.map((a) => (
                    <li key={a.announcement_id} className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-indigo-800">{a.title}</span>
                        <span className="text-xs text-indigo-400">{new Date(a.publish_date).toLocaleDateString()}</span>
                      </div>
                      <div className="text-indigo-700 mt-1">{a.content}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'students' && (
            <div>
              <h2 className="text-xl font-bold text-indigo-900 mb-4">Student Management</h2>
              <p className="text-indigo-700">Manage your students here. (Coming soon – currently showing stub)</p>
            </div>
          )}
        </main>
      </div>
    </DashboardInitializer>
  );
};

export default AssignedClass;
