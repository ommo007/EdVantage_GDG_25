

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Mock user roles and dashboard paths
const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin'
};

const getDashboardPath = (role) => {
  const paths = {
    [ROLES.STUDENT]: '/student-dashboard',
    [ROLES.TEACHER]: '/teacher-dashboard',
    [ROLES.ADMIN]: '/admin-dashboard'
  };
  return paths[role] || '/dashboard';
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error("useAuth must be used within an AuthProvider");
    return { 
      currentUser: null, 
      userProfile: null, 
      userRole: null, 
      loading: false, 
      isAuthenticated: false 
    };
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [authRedirect, setAuthRedirect] = useState(null);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Mock login - replace with actual authentication later
      const mockUser = { uid: '123', email };
      const mockRole = ROLES.STUDENT;
      
      setCurrentUser(mockUser);
      setUserRole(mockRole);
      setAuthRedirect(getDashboardPath(mockRole));
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setCurrentUser(null);
      setUserProfile(null);
      setUserRole(null);
      setAuthRedirect('/login');
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  };

  const signup = async (email, password, role = ROLES.STUDENT) => {
    setLoading(true);
    try {
      // Mock signup - replace with actual authentication later
      const mockUser = { uid: '123', email };
      setCurrentUser(mockUser);
      setUserRole(role);
      setAuthRedirect(getDashboardPath(role));
      return mockUser;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    userProfile,
    userRole,
    setUserRole,
    logout,
    login,
    signup,
    isAuthenticated: !!currentUser,
    loading,
    authRedirect,
    setAuthRedirect,
    error,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};