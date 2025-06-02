import { lazy, Suspense } from "react";
import { HashRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ConnectionStatusBanner from "./components/ConnectionStatusBanner";
import ProtectedRoute from "./components/ProtectedRoute";

console.log("App.jsx: Starting application...");

// Lazy load components to reduce initial load time
const LandingPage = lazy(() => import("./Pages/LandingPages/Landing"));
const LoginPage = lazy(() => import("./Pages/Login/Login"));
const ForgotPassword = lazy(() => import("./Pages/Password/ForgotPassword"));
const NotFoundPage = lazy(() => import("./components/NotFoundPage"));
const AuthRedirect = lazy(() => import("./components/AuthRedirect"));
const UserProfile = lazy(() => import("./components/profile/UserProfile"));

// Admin Components
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
          <Route path="/redirect" element={<AuthRedirect />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Profile Page */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />

          {/* Admin Routes - Protected */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <Navigate to="/admin/select-standard" replace />
            </ProtectedRoute>
          } />
          <Route path="/admin/select-standard" element={
            <ProtectedRoute requiredRole="admin">
              <StandardSelection />
            </ProtectedRoute>
          } />
          <Route path="/admin/:standardId" element={
            <ProtectedRoute requiredRole="admin">
              <StandardDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/:standardId/divisions/:divisionId" element={
            <ProtectedRoute requiredRole="admin">
              <DivisionDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/*" element={
            <ProtectedRoute requiredRole="admin">
              <Navigate to="/admin/select-standard" replace />
            </ProtectedRoute>
          } />

          {/* Instructor Routes - Protected */}
          <Route path="/instructor" element={
            <ProtectedRoute requiredRole="instructor">
              <InstructorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/instructor/dashboard" element={
            <ProtectedRoute requiredRole="instructor">
              <Navigate to="/instructor" replace />
            </ProtectedRoute>
          } />
          <Route path="/instructor/classes" element={
            <ProtectedRoute requiredRole="instructor">
              <InstructorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/instructor/class/:classId" element={
            <ProtectedRoute requiredRole="instructor">
              <AssignedClass />
            </ProtectedRoute>
          } />
          <Route path="/instructor/class/:classId/study-space" element={
            <ProtectedRoute requiredRole="instructor">
              <InstructorStudySpace />
            </ProtectedRoute>
          } />
          <Route path="/instructor/class/:classId/study-space/:subject" element={
            <ProtectedRoute requiredRole="instructor">
              <InstructorStudySpace />
            </ProtectedRoute>
          } />
          <Route path="/instructor/study-materials/:classId" element={
            <ProtectedRoute requiredRole="instructor">
              <StudyMaterialsManager />
            </ProtectedRoute>
          } />
          <Route path="/instructor/rag-analytics/:classId" element={
            <ProtectedRoute requiredRole="instructor">
              <RagAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/instructor/*" element={
            <ProtectedRoute requiredRole="instructor">
              <Navigate to="/instructor" replace />
            </ProtectedRoute>
          } />

          {/* Student Routes - Protected */}
          <Route path="/student" element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/dashboard" element={
            <ProtectedRoute requiredRole="student">
              <Navigate to="/student" replace />
            </ProtectedRoute>
          } />
          <Route path="/student/study-space/:classId" element={
            <ProtectedRoute requiredRole="student">
              <StudentStudyPage />
            </ProtectedRoute>
          } />
          <Route path="/student/*" element={
            <ProtectedRoute requiredRole="student">
              <Navigate to="/student" replace />
            </ProtectedRoute>
          } />

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
