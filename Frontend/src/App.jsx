import { lazy, Suspense } from "react";
import { HashRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";

console.log("App.jsx: Starting application...");

// Lazy load components to reduce initial load time
const LandingPage = lazy(() => import("./Pages/LandingPages/Landing"));
const LoginPage = lazy(() => import("./Pages/Login/Login"));
const SignupPage = lazy(() => import("./Pages/Signup/Signup"));
const ForgotPassword = lazy(() => import("./Pages/Password/ForgotPassword"));
const NotFoundPage = lazy(() => import("./components/NotFoundPage"));
const AuthRedirect = lazy(() => import("./components/AuthRedirect"));
const UserProfile = lazy(() => import("./components/profile/UserProfile"));

// Admin Components
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const AdminClassSelection = lazy(() => import("./components/AdminClassSelection"));
const AdminStudySpace = lazy(() => import("./components/AdminStudySpace"));

// Instructor Components
const InstructorDashboard = lazy(() => import("./components/InstructorDashboard"));

// Student Components
const StudentDashboard = lazy(() => import("./components/StudentDashboard"));
const ClassSelectionPage = lazy(() => import("./components/ClassSelectionPage"));
const StudyPage = lazy(() => import("./components/StudyPage"));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-indigo-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      <p className="mt-4 text-indigo-600">Loading...</p>
    </div>
  </div>
);

// Protected Route wrapper component
const ProtectedRoute = ({ element, allowedRole }) => {
  const { currentUser, userRole, loading } = useAuth();

  console.log(`ProtectedRoute: path=${window.location.pathname}, currentUser=${!!currentUser}, userRole=${userRole}, allowedRole=${allowedRole}, loading=${loading}`);

  if (loading) {
    return <LoadingFallback />;
  }

  // If not logged in, redirect to login
  if (!currentUser) {
    console.log("No user - redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // If role is required and doesn't match, redirect to appropriate dashboard
  if (allowedRole && userRole !== allowedRole) {
    console.log(`Role mismatch - redirecting from ${allowedRole} to ${userRole}`);
    return <Navigate to={`/${userRole}`} replace />;
  }

  // Otherwise render the protected component
  return element;
};

function AppContent() {
  const { userRole, authRedirect, setAuthRedirect } = useAuth();

  useEffect(() => {
    if (authRedirect) {
      console.log(`Auth redirect triggered to: ${authRedirect}`);
      setAuthRedirect(null);
    }
  }, [authRedirect, setAuthRedirect]);

  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/redirect" element={<AuthRedirect />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Profile Page - Available for all authenticated users */}
          <Route path="/profile" element={
            <ProtectedRoute element={<UserProfile />} />
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute element={<AdminDashboard />} allowedRole="admin" />
          } />
          <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/classes" element={
            <ProtectedRoute element={<AdminClassSelection />} allowedRole="admin" />
          } />
          <Route path="/admin/study-space" element={
            <ProtectedRoute element={<AdminStudySpace />} allowedRole="admin" />
          } />
          <Route path="/admin/*" element={
            <ProtectedRoute element={<AdminDashboard />} allowedRole="admin" />
          } />

          {/* Instructor Routes */}
          <Route path="/instructor" element={
            <ProtectedRoute element={<InstructorDashboard />} allowedRole="instructor" />
          } />
          <Route path="/instructor/dashboard" element={<Navigate to="/instructor" replace />} />
          <Route path="/instructor/classes" element={
            <ProtectedRoute element={<ClassSelectionPage />} allowedRole="instructor" />
          } />
          <Route path="/instructor/*" element={
            <ProtectedRoute element={<InstructorDashboard />} allowedRole="instructor" />
          } />

          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute element={<StudentDashboard />} allowedRole="student" />
          } />
          <Route path="/student/dashboard" element={<Navigate to="/student" replace />} />
          <Route path="/student/classes" element={
            <ProtectedRoute element={<ClassSelectionPage />} allowedRole="student" />
          } />
          <Route path="/student/calendar" element={
            <ProtectedRoute element={<StudentDashboard />} allowedRole="student" />
          } />
          <Route path="/student/*" element={
            <ProtectedRoute element={<StudentDashboard />} allowedRole="student" />
          } />
          
          {/* Study page - accessible by all roles */}
          <Route path="/study/:classId?" element={
            <ProtectedRoute element={<StudyPage />} />
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
          <AppContent />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;