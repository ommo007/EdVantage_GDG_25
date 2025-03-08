

import { HashRouter as Router, Route, Routes, Navigate } from "react-router-dom";


import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LandingPage from "./Pages/LandingPages/Landing";
import SignupPage from "./Pages/Signup/Signup";
import AdminDashboard from "./components/AdminDashboard";
import AdminClassSelection from "./components/AdminClassSelection";
import AdminStudySpace from "./components/AdminStudySpace";
import InstructorDashboard from "./components/InstructorDashboard";
import ClassSelectionPage from "./components/ClassSelectionPage";
import StudyPage from "./components/StudyPage";
// Assuming you'll create these components later
import LoginPage from "./Pages/Login/Login";
import NotFoundPage from "./components/NotFoundPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin">
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="classes" element={<AdminClassSelection />} />
          <Route path="study-space" element={<AdminStudySpace />} />
        </Route>
        
        {/* Instructor Routes */}
        <Route path="/instructor">
          <Route index element={<InstructorDashboard />} />
          <Route path="dashboard" element={<InstructorDashboard />} />
          <Route path="classes" element={<ClassSelectionPage />} />
        </Route>
        
        {/* Teacher Routes (renamed from teacherdash for consistency) */}
        <Route path="/teacher">
          <Route index element={<ClassSelectionPage />} />
          <Route path="dashboard" element={<ClassSelectionPage />} />
        </Route>
        
        {/* Study Routes */}
        <Route path="/study">
          <Route index element={<Navigate to="/instructor/classes" />} />
          <Route path=":classId" element={<StudyPage />} />
        </Route>
        
        {/* Legacy route support - redirects to new structure */}
        <Route path="/teacherdash" element={<Navigate to="/teacher/dashboard" />} />
        <Route path="/admin/class-selection" element={<Navigate to="/admin/classes" />} />
        
        {/* 404 - Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App