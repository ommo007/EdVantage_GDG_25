// import { lazy, Suspense, useState } from "react";
// import { HashRouter as Router, Route, Routes, Navigate } from "react-router-dom";
// import { useEffect } from "react";
// import { AuthProvider, useAuth } from "./contexts/AuthContext";
// import ErrorBoundary from "./components/ErrorBoundary";
// import ConnectionStatusBanner from "./components/ConnectionStatusBanner";

// console.log("App.jsx: Starting application...");

// // Lazy load components to reduce initial load time
// const LandingPage = lazy(() => import("./Pages/LandingPages/Landing"));
// const LoginPage = lazy(() => import("./Pages/Login/Login"));
// const SignupPage = lazy(() => import("./Pages/Signup/Signup"));
// const ForgotPassword = lazy(() => import("./Pages/Password/ForgotPassword"));
// const NotFoundPage = lazy(() => import("./components/NotFoundPage"));
// const AuthRedirect = lazy(() => import("./components/AuthRedirect"));
// const UserProfile = lazy(() => import("./components/profile/UserProfile"));

// // Admin Components
// const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
// const AdminClassSelection = lazy(() => import("./components/AdminClassSelection"));
// const AdminStudySpace = lazy(() => import("./components/AdminStudySpace"));

// // Instructor Components
// const InstructorDashboard = lazy(() => import("./components/InstructorDashboard"));
// const StudyMaterialsManager = lazy(() => import("./components/instructor/StudyMaterialsManager"));
// const RagAnalytics = lazy(() => import("./components/study/RagAnalytics"));

// // Student Components
// const StudentDashboard = lazy(() => import("./components/StudentDashboard"));
// const ClassSelectionPage = lazy(() => import("./components/ClassSelectionPage"));
// const StudyPage = lazy(() => import("./components/StudyPage"));
// const RagStudyAssistant = lazy(() => import("./components/study/RagStudyAssistant"));

// // Loading fallback
// const LoadingFallback = () => (
//   <div className="flex items-center justify-center h-screen bg-indigo-50">
//     <div className="text-center">
//       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
//       <p className="mt-4 text-indigo-600">Loading...</p>
//     </div>
//   </div>
// );

// // Enhanced Protected Route component with mock and Firebase toggle
// const ProtectedRoute = ({ element, allowedRole }) => {
//   const { currentUser, userRole, loading } = useAuth();
//   const pathname = window.location.pathname;

//   console.log(`ProtectedRoute check: path=${pathname}, user=${!!currentUser}, role=${userRole}, requiredRole=${allowedRole}`);

//   /* Mock Implementation: Allow all paths for testing */
//   return element;

//   /* Firebase Implementation: Uncomment this block for actual authentication
//   // Show loading state while authentication is being determined
//   if (loading) {
//     return <LoadingFallback />;
//   }

//   // If not logged in, redirect to login with a return path
//   if (!currentUser) {
//     console.log("No authenticated user - redirecting to login");
//     return <Navigate to="/login" state={{ from: pathname }} replace />;
//   }

//   // Handle role-specific access
//   if (allowedRole) {
//     if (userRole !== allowedRole) {
//       console.log(`Access denied: User role (${userRole}) doesn't match required role (${allowedRole})`);
//       return <Navigate to={`/${userRole}`} replace />;
//     }
//   }

//   // Access granted
//   console.log("Access granted to:", pathname);
//   return element;
//   */
// };

// function AppContent() {
//   const { userRole, authRedirect, setAuthRedirect } = useAuth();

//   useEffect(() => {
//     if (authRedirect) {
//       console.log(`Auth redirect triggered to: ${authRedirect}`);
//       setAuthRedirect(null);
//     }
//   }, [authRedirect, setAuthRedirect]);

//   return (
//     <Router>
//       <Suspense fallback={<LoadingFallback />}>
//         <Routes>
//           {/* Public Routes */}
//           <Route path="/" element={<LandingPage />} />
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/signup" element={<SignupPage />} />
//           <Route path="/redirect" element={<AuthRedirect />} />
//           <Route path="/forgot-password" element={<ForgotPassword />} />

//           {/* Profile Page - Available for all authenticated users */}
//           <Route path="/profile" element={
//             <ProtectedRoute element={<UserProfile />} />
//           } />

//           {/* Admin Routes */}
//           <Route path="/admin" element={
//             <ProtectedRoute element={<AdminDashboard />} allowedRole="admin" />
//           } />
//           <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
//           <Route path="/admin/classes" element={
//             <ProtectedRoute element={<AdminClassSelection />} allowedRole="admin" />
//           } />
//           <Route path="/admin/study-space" element={
//             <ProtectedRoute element={<AdminStudySpace />} allowedRole="admin" />
//           } />
//           <Route path="/admin/*" element={
//             <ProtectedRoute element={<AdminDashboard />} allowedRole="admin" />
//           } />

//           {/* Instructor Routes */}
//           <Route path="/instructor" element={
//             <ProtectedRoute element={<InstructorDashboard />} allowedRole="instructor" />
//           } />
//           <Route path="/instructor/dashboard" element={<Navigate to="/instructor" replace />} />
//           <Route path="/instructor/classes" element={
//             <ProtectedRoute element={<ClassSelectionPage />} allowedRole="instructor" />
//           } />
//           <Route path="/instructor/study-materials/:classId" element={
//             <ProtectedRoute element={<StudyMaterialsManager />} allowedRole="instructor" />
//           } />
//           <Route path="/instructor/rag-analytics/:classId" element={
//             <ProtectedRoute element={<RagAnalytics />} allowedRole="instructor" />
//           } />
//           <Route path="/instructor/*" element={
//             <ProtectedRoute element={<InstructorDashboard />} allowedRole="instructor" />
//           } />

//           {/* Student Routes */}
//           <Route path="/student" element={
//             <ProtectedRoute element={<StudentDashboard />} allowedRole="student" />
//           } />
//           <Route path="/student/dashboard" element={<Navigate to="/student" replace />} />
//           <Route path="/student/classes" element={
//             <ProtectedRoute element={<ClassSelectionPage />} allowedRole="student" />
//           } />
//           <Route path="/student/calendar" element={
//             <ProtectedRoute element={<StudentDashboard />} allowedRole="student" />
//           } />
//           <Route path="/student/*" element={
//             <ProtectedRoute element={<StudentDashboard />} allowedRole="student" />
//           } />
          
//           {/* Study page - accessible by all roles */}
//           <Route path="/study/:classId?" element={
//             <ProtectedRoute element={<StudyPage />} />
//           } />

//           {/* Legacy Route Redirects */}
//           <Route path="/teacherdash" element={<Navigate to="/instructor" replace />} />
          
//           {/* 404 Not Found Page */}
//           <Route path="*" element={<NotFoundPage />} />
//         </Routes>
//       </Suspense>
//     </Router>
//   );
// }

// function App() {
//   return (
//     <ErrorBoundary>
//       <AuthProvider>
//         <div className="app-container">
//           <ConnectionStatusBanner />
//           <AppContent />
//         </div>
//       </AuthProvider>
//     </ErrorBoundary>
//   );
// }

// export default App;

//Mock implementation by bypassing routes

import { lazy, Suspense } from "react";
import { HashRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ConnectionStatusBanner from "./components/ConnectionStatusBanner";
import AssignedClasses from "./components/InstructorDashboard";

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
//const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
//const AdminClassSelection = lazy(() => import("./components/AdminClassSelection"));
const AdminStudySpace = lazy(() => import("./components/AdminStudySpace"));
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
const StudentDashboard = lazy(() => import("./components/StudentDashboard"));
const ClassSelectionPage = lazy(() => import("./components/ClassSelectionPage"));
const StudyPage = lazy(() => import("./components/StudyPage"));
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
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/redirect" element={<AuthRedirect />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Profile Page */}
          <Route path="/profile" element={<UserProfile />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/select-standard" replace />} />
          <Route path="/admin/select-standard" element={<StandardSelection />} />
          <Route path="/admin/:standardId" element={<StandardDashboard />} />
          <Route path="/admin/:standardId/divisions/:divisionId" element={<DivisionDashboard />} />
          <Route path="/admin/study-space" element={<AdminStudySpace />} />
          <Route path="/admin/*" element={<Navigate to="/admin/select-standard" replace />} />

          {/* Instructor Routes */}
         
         <Route path="/instructor" element={<InstructorDashboard />} />
         <Route path="/instructor/dashboard" element={<Navigate to="/instructor" replace />} />
         
         {/* 1️⃣ Instructor Dashboard (Assigned Classes) */}
         <Route path="/instructor/classes" element={<InstructorDashboard />} />
         
         {/* 2️⃣ Assigned Class Interface (Class Analytics, Announcements, Lecture Materials) */}
         <Route path="/instructor/class/:classId" element={<AssignedClass />} />
         
         {/* 3️⃣ Instructor Study Space (Quiz & Assignment Generation, AI Assistance) */}
         <Route path="/instructor/class/:classId/study-space" element={<InstructorStudySpace />} />
         
         {/* Additional Features */}
         <Route path="/instructor/study-materials/:classId" element={<StudyMaterialsManager />} />
         <Route path="/instructor/rag-analytics/:classId" element={<RagAnalytics />} />
         
         {/* Catch-All Redirect */}
         <Route path="/instructor/*" element={<Navigate to="/instructor" replace />} />


          {/* Student Routes */}
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/dashboard" element={<Navigate to="/student" replace />} />
          <Route path="/student/classes" element={<ClassSelectionPage />} />
          <Route path="/student/calendar" element={<StudentDashboard />} />
          <Route path="/student/*" element={<Navigate to="/student" replace />} />

          {/* Study Page */}
          <Route path="/study/:classId?" element={<StudyPage />} />

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
