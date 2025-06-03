
import { lazy, Suspense } from "react";
import { HashRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ConnectionStatusBanner from "./components/ConnectionStatusBanner";
import AssignedClasses from "./components/InstructorDashboard";
import StudentStudySpace from "./components/StudentStudyPage";

console.log("App.jsx: Starting application...");

// Lazy load components to reduce initial load time
const LandingPage = lazy(() => import("./Pages/LandingPages/Landing"));
const LoginPage = lazy(() => import("./Pages/Login/Login"));

const ForgotPassword = lazy(() => import("./Pages/Password/ForgotPassword"));
const NotFoundPage = lazy(() => import("./components/NotFoundPage"));
const AuthRedirect = lazy(() => import("./components/AuthRedirect"));
const UserProfile = lazy(() => import("./components/profile/UserProfile"));

// Admin Components
//const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
//const AdminClassSelection = lazy(() => import("./components/AdminClassSelection"));

const StandardSelection = lazy(() => import("./components/StandardSelection"));
const StandardDashboard = lazy(() => import("./components/StandardDashboard"));
const DivisionDashboard = lazy(() => import("./components/DivisionDashboard"));

// Instructor Components
const InstructorDashboard = lazy(() => import("./components/InstructorDashboard"));
const InstructorStudySpace = lazy(() => import("./components/InstructorStudySpace"));
const AssignedClass = lazy(() => import("./components/AssignedClass"));
const StudyMaterialsManager = lazy(() => import("./components/instructor/StudyMaterialsManager"));
const RagAnalytics = lazy(() => import("./components/study/RagAnalytics"));

// Student Components
const StudentDashboard = lazy(() => import("./components/StudentClassInterface"));

const StudentStudyPage = lazy(() => import("./components/StudentStudyPage"));
const RagStudyAssistant = lazy(() => import("./components/study/RagStudyAssistant"));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-indigo-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      <p className="mt-4 text-indigo-600">Loading...</p>
    </div>
  </div>
);

function AppContent() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          {/*<Route path="/signup" element={<SignupPage />} />*/}
          <Route path="/redirect" element={<AuthRedirect />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Profile Page */}
          <Route path="/profile" element={<UserProfile />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/select-standard" replace />} />
          <Route path="/admin/select-standard" element={<StandardSelection />} />
          <Route path="/admin/:standardId" element={<StandardDashboard />} />
          <Route path="/admin/:standardId/divisions/:divisionId" element={<DivisionDashboard />} />
          
          <Route path="/admin/*" element={<Navigate to="/admin/select-standard" replace />} />

          {/* Instructor Routes */}
         
         {/* Instructor Routes */}
<Route path="/instructor" element={<InstructorDashboard />} />
<Route path="/instructor/dashboard" element={<Navigate to="/instructor" replace />} />

{/* 1️⃣ Instructor Dashboard (Assigned Classes) */}
<Route path="/instructor/classes" element={<InstructorDashboard />} />

{/* 2️⃣ Assigned Class Interface (Class Analytics, Announcements, Lecture Materials) */}
<Route path="/instructor/class/:classId" element={<AssignedClass />} />

{/* 3️⃣ Instructor Study Space (Quiz & Assignment Generation, AI Assistance) */}
<Route path="/instructor/class/:classId/study-space" element={<InstructorStudySpace />} />
<Route path="/instructor/class/:classId/study-space/:subject" element={<InstructorStudySpace />} />

{/* Additional Features */}
<Route path="/instructor/study-materials/:classId" element={<StudyMaterialsManager />} />
<Route path="/instructor/rag-analytics/:classId" element={<RagAnalytics />} />

{/* Catch-All Redirect */}
<Route path="/instructor/*" element={<Navigate to="/instructor" replace />} />


          {/* Student Routes */}
<Route path="/student" element={<StudentDashboard />} />
<Route path="/student/dashboard" element={<Navigate to="/student" replace />} />

{/* Study Page */}
<Route path="/student/study-space/:classId" element={<StudentStudySpace />} />

{/* Catch-all */}
<Route path="/student/*" element={<Navigate to="/student" replace />} />


          {/* Legacy Route Redirects */}
          <Route path="/teacherdash" element={<Navigate to="/instructor" replace />} />

          {/* 404 Not Found Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="app-container">
          <ConnectionStatusBanner />
          <AppContent />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
