import { HashRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LandingPage from "./Pages/LandingPages/Landing";
import SignupPage from "./Pages/Signup/Signup";
import LoginPage from "./Pages/Login/Login";
import NotFoundPage from "./components/NotFoundPage";

// Admin Components
import AdminDashboard from "./components/AdminDashboard";
import AdminClassSelection from "./components/AdminClassSelection";
import AdminStudySpace from "./components/AdminStudySpace";

// Instructor Components
import InstructorDashboard from "./components/InstructorDashboard";

// Student Components
import StudentDashboard from "./components/StudentDashboard";
import ClassSelectionPage from "./components/ClassSelectionPage";
import StudyPage from "./components/StudyPage";

// Protected Route wrapper component
const ProtectedRoute = ({ element, allowedRole }) => {
  const userRole = localStorage.getItem("userRole");
  
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to={`/${userRole}`} replace />;
  }
  
  return element;
};

function App() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Check for user role on app load
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard />} allowedRole="admin" />} />
        <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/classes" element={<ProtectedRoute element={<AdminClassSelection />} allowedRole="admin" />} />
        <Route path="/admin/study-space" element={<ProtectedRoute element={<AdminStudySpace />} allowedRole="admin" />} />
        <Route path="/admin/class-selection" element={<Navigate to="/admin/classes" replace />} />

        {/* Instructor Routes */}
        <Route path="/instructor" element={<ProtectedRoute element={<InstructorDashboard />} allowedRole="instructor" />} />
        <Route path="/instructor/dashboard" element={<Navigate to="/instructor" replace />} />
        <Route path="/instructor/classes" element={<ProtectedRoute element={<ClassSelectionPage />} allowedRole="instructor" />} />

        {/* Student Routes */}
        <Route path="/student" element={<ProtectedRoute element={<StudentDashboard />} allowedRole="student" />} />
        <Route path="/student/dashboard" element={<Navigate to="/student" replace />} />
        <Route path="/student/classes" element={<ProtectedRoute element={<ClassSelectionPage />} allowedRole="student" />} />
        <Route path="/study/:classId?" element={<ProtectedRoute element={<StudyPage />} />} />

        {/* Legacy Route Redirects */}
        <Route path="/teacherdash" element={<Navigate to="/instructor" />} />
        
        {/* 404 Not Found Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
