

import { HashRouter as Router, Route, Routes, Navigate } from "react-router-dom";


import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LandingPage from "./Pages/LandingPages/Landing";
import SignupPage from "./Pages/Signup/Signup";
import LoginPage from "./Pages/Login/Login";
import NotFoundPage from "./components/NotFoundPage";

import AdminDashboard from "./components/AdminDashboard";
import AdminClassSelection from "./components/AdminClassSelection";
import AdminStudySpace from "./components/AdminStudySpace";

import InstructorDashboard from "./components/InstructorDashboard";
import ClassSelectionPage from "./components/ClassSelectionPage";

import StudyPage from "./components/StudyPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/classes" element={<AdminClassSelection />} />
        <Route path="/admin/study-space" element={<AdminStudySpace />} />

        {/* Instructor Routes */}
        <Route path="/instructor" element={<InstructorDashboard />} />
        <Route path="/instructor/classes" element={<ClassSelectionPage />} />

        {/* Study Page Route (Without classId) */}
        <Route path="/study" element={<StudyPage />} />

        {/* Redirects for Old Routes */}
        <Route path="/teacherdash" element={<Navigate to="/instructor" />} />
        <Route path="/admin/class-selection" element={<Navigate to="/admin/classes" />} />

        {/* 404 Not Found Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
