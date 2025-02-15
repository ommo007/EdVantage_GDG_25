
import { HashRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import LandingPage from "./Pages/LandingPages/Landing";  // ✅ Correct path
import SignupPage from "./Pages/Signup/Signup";  // ✅ Correct path
import AdminDashboard from "./components/AdminDashboard";  // ✅ Fixed path
import AdminClassSelection from "./components/AdminClassSelection";  // ✅ Fixed path
import AdminStudySpace from "./components/AdminStudySpace";  // ✅ Fixed path
import InstructorDashboard from "./components/InstructorDashboard";  // ✅ Fixed path
import ClassSelectionPage from "./components/ClassSelectionPage";  // ✅ Fixed path
import StudyPage from "./components/StudyPage";  // ✅ Fixed path


const PrivateRoute = ({ element: Element, role, ...rest }) => {
  const userRole = localStorage.getItem("userRole")
  return userRole === role ? <Element {...rest} /> : <Navigate to="/login" />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* <Route path="/admin/dashboard" element={<PrivateRoute element={AdminDashboard} role="admin" />} />
        <Route path="/admin/class-selection" element={<PrivateRoute element={AdminClassSelection} role="admin" />} />
        <Route path="/admin/study-space" element={<PrivateRoute element={AdminStudySpace} role="admin" />} />
        <Route
          path="/instructor/dashboard"
          element={<PrivateRoute element={InstructorDashboard} role="instructor" />}
        /> */}
        <Route path="/admin/dashboard" element={AdminDashboard} />
        <Route path="/admin/class-selection" element={AdminClassSelection} />
        <Route path="/admin/study-space" element={AdminStudySpace} />
        <Route path="/instructor/dashboard" element={InstructorDashboard} />
        <Route path="/teacherdash" element={<ClassSelectionPage />} />
        <Route path="/study/:classId" element={<StudyPage />} />
      </Routes>
    </Router>
  )
}

export default App

