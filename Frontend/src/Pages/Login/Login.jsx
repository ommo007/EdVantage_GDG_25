import React from 'react';
import { User, GraduationCap, Shield, BookOpen, ChevronRight } from 'lucide-react';
import { useNavigate } from "react-router-dom"; // <-- Add this
import Logo from "../../components/Logo";

const ColorfulLoginPage = () => {
  const navigate = useNavigate(); 

  const handleLogin = (role, roleName) => {
    const routes = {
      student: '/student', // Update this to your actual student class interface route if needed
      instructor: '/instructor',
      admin: '/admin'
    };
    
    navigate(routes[role]);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-full blur-2xl opacity-20"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-gradient-to-br from-purple-300 to-indigo-300 rounded-full blur-2xl opacity-15"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-300 to-indigo-300 rounded-full blur-xl opacity-25"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="text-center mb-12">
            <Logo />
            <h1 className="text-3xl font-bold text-indigo-800 mt-6 mb-2">Welcome</h1>
            <p className="text-indigo-600">Choose how you'd like to access the platform</p>
          </div>

          {/* Login Options */}
          <div className="space-y-4">
            {/* Student Option */}
            <button
              onClick={() => handleLogin('student', 'Student')}
              className="w-full group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-indigo-200/50 rounded-2xl p-6 text-left transition-all duration-300 hover:bg-white/90 hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:border-indigo-400 focus:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-indigo-800 text-lg">Student</h3>
                    <p className="text-indigo-600 text-sm">Start learning with AI assistance</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            {/* Teacher Option */}
            <button
              onClick={() => handleLogin('instructor', 'Teacher')}
              className="w-full group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-indigo-200/50 rounded-2xl p-6 text-left transition-all duration-300 hover:bg-white/90 hover:border-purple-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:border-purple-400 focus:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-indigo-800 text-lg">Teacher</h3>
                    <p className="text-indigo-600 text-sm">Manage courses and students</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:text-purple-600 transition-colors" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            {/* Admin Option */}
            <button
              onClick={() => handleLogin('admin', 'Admin')}
              className="w-full group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-indigo-200/50 rounded-2xl p-6 text-left transition-all duration-300 hover:bg-white/90 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:border-blue-400 focus:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-indigo-800 text-lg">Admin</h3>
                    <p className="text-indigo-600 text-sm">Platform administration panel</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <div className="inline-block bg-white/60 backdrop-blur-sm border border-indigo-200/50 rounded-full px-4 py-2">
              <p className="text-indigo-600 text-sm font-medium">
                All features available in demo mode
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorfulLoginPage;