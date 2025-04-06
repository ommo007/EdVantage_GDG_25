import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users,
  BookOpen,
  FileText,
  Video,
  Link as LinkIcon,
  ExternalLink,
  Download,
  Calendar,
  Award,
  CheckCircle,
  Bell,
  ChevronRight,
  AlertCircle,
  User,
  BookmarkIcon,
  PieChart,
  ArrowRight
} from 'lucide-react';
import DashboardHeader from "./shared/DashboardHeader";

// Mock data for student's enrolled class
const mockClassData = {
  id: "class123",
  name: "Standard 5 ",
  section:"A",
 
  teacher: {
    name: "Dr. Sarah Johnson"
    
  },
  subjects: [
    { id: "math101", name: "Mathematics" },
    { id: "sci101", name: "Science" },
    { id: "eng101", name: "English" },
  ],
  announcements: [
    {
      id: 1,
      date: "2025-04-03",
      title: "Quiz on Linear Equations",
      description: "Reminder: We will have a quiz on linear equations next Monday. The quiz will cover chapters 3-5 from your textbook."
    },
    {
      id: 2,
      date: "2025-04-01",
      title: "Group Project Teams",
      description: "Group project teams have been finalized. Please check the document in the materials section for your assigned team members."
    },
    {
      id: 3,
      date: "2025-03-28",
      title: "Office Hours Change",
      description: "My office hours will be changed to Tuesdays and Thursdays from 2-4 PM starting next week."
    }
  ],
  materials: [
    {
      id: 1,
      title: "Chapter 3 - Linear Equations",
      type: "pdf",
      size: "2.4 MB",
      uploadDate: "2025-03-25"
    },
    {
      id: 2,
      title: "Group Project Teams",
      type: "docx",
      size: "534 KB",
      uploadDate: "2025-04-01"
    },
    {
      id: 3,
      title: "Quadratic Functions Video Tutorial",
      type: "video",
      duration: "18:24",
      uploadDate: "2025-03-29"
    },
    {
      id: 4,
      title: "Math Resource Website",
      type: "link",
      url: "https://mathresources.edu",
      uploadDate: "2025-03-22"
    }
  ],
  performance: {
    totalQuizzes: 8,
    quizzesAttempted: 7,
    totalAssignments: 10,
    assignmentsSubmitted: 9,
    overallProgress: 78
  }
};

const StudentClassInterface = () => {
  const [classData, setClassData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [selectedSubject, setSelectedSubject] = useState(""); // State for selected subject

const handleSubjectChange = (e) => {
  const subjectId = e.target.value;
  setSelectedSubject(subjectId);
  if (subjectId) {
    navigate(`/student/study-space/${subjectId}`); // Navigate to the selected subject's study space
  }
};

  useEffect(() => {
    fetchClassData();
  }, []);

  const fetchClassData = async () => {
    try {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In real app, you'd fetch actual data here
      setClassData(mockClassData);
    } catch (err) {
      setError("Failed to load class data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterStudySpace = () => {
    if (selectedSubject) {
      // Navigate to the selected subject's study space
      navigate(`/student/study-space/${selectedSubject}`);
    } else {
      alert("Please select a subject to enter the classroom."); // Optional: Show an alert
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

  // Function to get appropriate icon for material type
  const getMaterialIcon = (type) => {
    switch(type) {
      case 'pdf':
      case 'docx':
        return <FileText className="h-5 w-5 text-indigo-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-indigo-600" />;
      case 'link':
        return <LinkIcon className="h-5 w-5 text-indigo-600" />;
      default:
        return <BookmarkIcon className="h-5 w-5 text-indigo-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-8">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg max-w-md mx-auto">
          <AlertCircle className="h-8 w-8 mb-4" />
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error || "Class information not found"}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
  {/* Header */}
  <DashboardHeader userRole="student" />

  {/* Main Content */}
  <main className="container mx-auto px-4 py-6">
    {/* Class Header */}
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left Side */}
        <div>
          {/* Back Arrow and Heading in same line */}
          <div className="flex items-center mb-2">
            <Link to="/login" className="text-indigo-600 hover:text-indigo-800 mr-2">
              <ArrowRight className="h-5 w-5 transform rotate-180" />
            </Link>
            <h1 className="text-3xl font-bold text-indigo-900">
              {classData.name}{' '}
              <span className="text-purple-600">Section {classData.section}</span>
            </h1>
          </div>

          {/* Teacher name and Subject dropdown */}
          <div className="flex items-center mt-2 text-indigo-700">
            <User className="h-5 w-5 mr-2" />
            <span className="mr-4 font-medium">{classData.teacher.name}</span>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border border-indigo-300 rounded-md text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Subject</option>
              {classData.subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Side - Enter Classroom Button */}
        <button
  onClick={handleEnterStudySpace}
  className={`bg-indigo-600 text-white px-6 py-3 rounded-md transition duration-300 font-medium flex items-center ${
    !selectedSubject ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"
  }`}
  disabled={!selectedSubject} // Disable the button if no subject is selected
>
  Enter Classroom
  <ArrowRight className="ml-2 h-5 w-5" />
</button>
      </div>
    </div>
  



        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Performance & Announcements */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
              <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-indigo-600" />
                Your Performance
              </h2>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-indigo-700">Overall Progress</span>
                  <span className="text-sm font-medium text-indigo-700">{classData.performance.overallProgress}%</span>
                </div>
                <div className="w-full bg-indigo-100 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${classData.performance.overallProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="text-sm text-indigo-700 font-medium mb-1">Quizzes</h3>
                  <p className="text-xl font-bold text-indigo-900">
                    {classData.performance.quizzesAttempted}/{classData.performance.totalQuizzes}
                  </p>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="text-sm text-indigo-700 font-medium mb-1">Assignments</h3>
                  <p className="text-xl font-bold text-indigo-900">
                    {classData.performance.assignmentsSubmitted}/{classData.performance.totalAssignments}
                  </p>
                </div>
                
                
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
              <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-indigo-600" />
                Announcements
              </h2>
              
              {classData.announcements.length > 0 ? (
                <div className="space-y-4">
                  {classData.announcements.map((announcement) => (
                    <div key={announcement.id} className="border-b border-indigo-50 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 p-2 bg-indigo-50 rounded-md mr-4">
                          <Bell className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                            <h3 className="font-medium text-indigo-900">{announcement.title}</h3>
                            <span className="text-xs text-indigo-500">{formatDate(announcement.date)}</span>
                          </div>
                          <p className="text-indigo-700">{announcement.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-indigo-500">
                  No announcements yet
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Materials */}
          <div className="space-y-6">
            {/* Lecture Materials */}
            <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
              <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
                Lecture Materials
              </h2>
              
              {classData.materials.length > 0 ? (
                <div className="space-y-3">
                  {classData.materials.map((material) => (
                    <div 
                      key={material.id} 
                      className="border border-indigo-100 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          {getMaterialIcon(material.type)}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h3 className="font-medium text-indigo-900 truncate">{material.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-indigo-600 mt-1">
                            <span>{formatDate(material.uploadDate)}</span>
                            {material.type === 'video' && <span>{material.duration}</span>}
                            {(material.type === 'pdf' || material.type === 'docx') && <span>{material.size}</span>}
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          {material.type === 'link' ? (
                            <button className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-full transition-colors">
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          ) : (
                            <button className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-full transition-colors">
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-indigo-500">
                  No materials available yet
                </div>
              )}
            </div>
            
            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
              <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center">
                <ExternalLink className="h-5 w-5 mr-2 text-indigo-600" />
                Quick Links
              </h2>
              
              <div className="space-y-2">
                <a 
                  href="#" 
                  className="flex items-center justify-between p-3 text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-3 text-indigo-600" />
                    <span>My Grades</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </a>
                
                <a 
                  href="#" 
                  className="flex items-center justify-between p-3 text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-3 text-indigo-600" />
                    <span>Class Schedule</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </a>
                
                <a 
                  href="#" 
                  className="flex items-center justify-between p-3 text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-3 text-indigo-600" />
                    <span>Assignment Deadlines</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </a>
                
                <a 
                  href="#" 
                  className="flex items-center justify-between p-3 text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-3 text-indigo-600" />
                    <span>Contact Teacher</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentClassInterface;