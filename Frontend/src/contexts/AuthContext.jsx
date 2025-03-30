import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, logoutUser, changeUserRole } from '../firebase/auth';
import { getUserProfile } from '../firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error("useAuth must be used within an AuthProvider");
    // Return a default object to prevent app crashes
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
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [authRedirect, setAuthRedirect] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Setting up auth state observer...");
    
    const unsubscribe = onAuthStateChange(async (user) => {
      console.log("Auth state changed:", user ? `User ${user.uid}` : "No user");
      setCurrentUser(user);
      
      if (user) {
        try {
          // Get user profile from Firestore
          const profile = await getUserProfile(user.uid);
          console.log("User profile loaded:", profile);
          setUserProfile(profile);
          
          // Determine user role with fallback mechanism
          let role = null;
          
          // First check Firestore profile
          if (profile && profile.role) {
            role = profile.role;
            console.log("Using role from profile:", role);
          } 
          // Then check localStorage as backup
          else {
            const storedRole = localStorage.getItem('userRole');
            if (storedRole) {
              role = storedRole;
              console.log("Using role from localStorage:", role);
            } else {
              // Default fallback role
              role = 'student';
              console.log("Using default role:", role);
            }
          }
          
          // Set the role and store in localStorage for persistence
          setUserRole(role);
          localStorage.setItem('userRole', role);
        } catch (err) {
          console.error("Error fetching user profile:", err);
          // Set default role on error
          const fallbackRole = 'student';
          setUserRole(fallbackRole);
          localStorage.setItem('userRole', fallbackRole);
        }
      } else {
        // Clear user data when logged out
        setUserProfile(null);
        setUserRole(null);
        localStorage.removeItem('userRole');
      }
      
      setLoading(false);
    });

    return () => {
      console.log("Cleaning up auth state observer");
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      console.log("Logging out user");
      await logoutUser();
      setCurrentUser(null);
      setUserProfile(null);
      setUserRole(null);
      localStorage.removeItem('userRole');
      setAuthRedirect('/login');
      return true;
    } catch (err) {
      console.error("Logout error:", err);
      return false;
    }
  };

  const setRole = async (role, shouldRedirect = false) => {
    console.log("Setting user role:", role);
    
    if (!role || !['admin', 'instructor', 'student'].includes(role)) {
      console.error("Invalid role:", role);
      return false;
    }
    
    try {
      if (currentUser) {
        // Update role in Firestore
        await changeUserRole(currentUser.uid, role);
      }
      
      // Update state and localStorage
      setUserRole(role);
      localStorage.setItem('userRole', role);
      
      if (shouldRedirect) {
        setAuthRedirect(`/${role}`);
      }
      
      return true;
    } catch (err) {
      console.error("Error setting role:", err);
      return false;
    }
  };

  const value = {
    currentUser,
    userProfile,
    userRole,
    setRole,
    logout,
    isAuthenticated: !!currentUser,
    loading,
    authRedirect,
    setAuthRedirect,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
