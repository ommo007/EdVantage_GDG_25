import { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  getAuth,
  getIdTokenResult
} from "firebase/auth";
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { createUser, signInWithGoogle as firebaseSignInWithGoogle } from '../firebase/auth';
import { 
  getUserRole, 
  setUserRole as setFirestoreRole, 
  clearRoleData, 
  getDashboardPath,
  isValidRole,
  getDefaultRole 
} from '../services/RoleManager';
import { 
  createOrUpdateUserDocument, 
  getUserDocument,
  updateUserRole 
} from '../services/FirestoreService';

const AuthContext = createContext();

// Create a cache for user roles to avoid repeated Firestore calls
const userRoleCache = {};

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

  // Efficient way to set role and redirect with verification - OPTIMIZED
  const setRoleAndRedirect = async (uid, role) => {
    console.log(`Setting role and redirect for uid ${uid} to role ${role}`);
    
    if (!isValidRole(role)) {
      console.warn(`Invalid role detected: "${role}", defaulting to "${getDefaultRole()}"`);
      role = getDefaultRole();
    }
    
    // Update state immediately before Firestore operations
    setUserRole(role);
    
    // Cache the user role for future quick access
    userRoleCache[uid] = role;
    
    // Set redirect immediately - don't wait for Firestore
    const redirectPath = getDashboardPath(role);
    setAuthRedirect(redirectPath);
    console.log(`Role set to ${role}, redirecting to ${redirectPath}`);
    
    // Perform Firestore updates in the background without blocking
    Promise.all([
      setFirestoreRole(uid, role),
      updateUserRole(uid, role)
    ]).catch(err => {
      console.error("Background role update error:", err);
      // Still continue - the UI updates are already done
    });
  };

  // Helper function to get the user profile
  const getUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  };

  useEffect(() => {
    console.log("Setting up auth state observer...");
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? `User ${user.uid}` : "No user");
      setCurrentUser(user);
      
      if (user) {
        try {
          // Get custom token claims from Firebase Auth
          const tokenResult = await getIdTokenResult(user, true);
          const customRole = tokenResult.claims.role || getDefaultRole();
          console.log(`Retrieved role from token: ${customRole}`);
          
          // Cache role and update state immediately
          setUserRole(customRole);
          localStorage.setItem('userRole', customRole);
          
          // Optionally, get full profile from Firestore (if needed) in background
          const profile = await getUserDocument(user.uid);
          if (profile) {
            setUserProfile(profile);
          }
        } catch (err) {
          console.error("Error obtaining token claims:", err);
          setUserRole(getDefaultRole());
        } finally {
          setLoading(false);
        }
      } else {
        setUserProfile(null);
        setUserRole(null);
        clearRoleData();
        setLoading(false);
      }
    });

    return () => {
      console.log("Cleaning up auth state observer");
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      console.log("Logging out user");
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setUserRole(null);
      clearRoleData();
      setAuthRedirect('/login');
      return true;
    } catch (err) {
      console.error("Logout error:", err);
      return false;
    }
  };

  const setRole = async (role, shouldRedirect = false) => {
    console.log("Setting user role:", role);
    
    if (!isValidRole(role)) {
      console.error("Invalid role:", role);
      return false;
    }
    
    try {
      if (currentUser) {
        await setFirestoreRole(currentUser.uid, role);
        userRoleCache[currentUser.uid] = role;
      }
      
      // Update state
      setUserRole(role);
      
      if (shouldRedirect) {
        setAuthRedirect(getDashboardPath(role));
      }
      
      return true;
    } catch (err) {
      console.error("Error setting role:", err);
      return false;
    }
  };

  // Force refresh role directly from Firestore before login completion
  const refreshRoleFromFirestore = async (uid) => {
    try {
      // Get the most up-to-date role from Firestore
      const userDoc = await getDoc(doc(db, "users", uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role || getDefaultRole();
        
        // Validate role
        if (!isValidRole(role)) {
          console.warn(`Invalid role found in Firestore: ${role}`);
          return getDefaultRole();
        }
        
        console.log(`Role refreshed from Firestore for ${uid}: ${role}`);
        return role;
      }
      
      return getDefaultRole();
    } catch (error) {
      console.error("Error refreshing role from Firestore:", error);
      return getDefaultRole();
    }
  };

  // Optimize login to redirect faster without token verification
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      console.log("User logged in successfully:", uid);
      
      // Try to get role from cache first for instant response
      let role = userRoleCache[uid];
      if (!role) {
        const storedRole = localStorage.getItem('userRole');
        if (storedRole && isValidRole(storedRole)) {
          role = storedRole;
        }
      }
      
      // If no role available, force refresh from Firestore with timeout
      if (!role) {
        try {
          const rolePromise = refreshRoleFromFirestore(uid);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Role fetch timeout')), 3000)
          );
          role = await Promise.race([rolePromise, timeoutPromise]);
        } catch (err) {
          console.warn("Role fetch error or timeout, using default:", err);
          role = getDefaultRole();
        }
      }
      
      await setRoleAndRedirect(uid, role);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message);
      setLoading(false);
      throw error;
    }
  };

  // Similar changes in signInWithGoogle: remove storedToken check.
  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await firebaseSignInWithGoogle();
      const uid = result.user.uid;
      console.log("Google sign in successful for user:", uid);
      
      let role = userRoleCache[uid];
      if (!role) {
        const storedRole = localStorage.getItem('userRole');
        if (storedRole && isValidRole(storedRole)) {
          role = storedRole;
        }
      }
      
      if (!role) {
        try {
          const rolePromise = refreshRoleFromFirestore(uid);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Role fetch timeout')), 3000)
          );
          role = await Promise.race([rolePromise, timeoutPromise]);
        } catch (err) {
          console.warn("Role fetch error or timeout, using default:", err);
          role = getDefaultRole();
        }
      }
      
      await setRoleAndRedirect(uid, role);
      return { user: result.user, profile: { role } };
    } catch (error) {
      console.error("Google sign in error:", error);
      setError(error.message);
      setLoading(false);
      throw error;
    }
  };

  const signup = async (email, password, role = "student") => {
    setLoading(true);
    setError(null);
    
    try {
      // Create the user with Firebase auth
      const user = await createUser(email, password, role);
      
      // Create or update the user document in Firestore
      await createOrUpdateUserDocument(user.uid, {
        email: user.email,
        displayName: user.displayName || email.split('@')[0],
        role: role
      });
      
      // Set verified role and redirect
      await setRoleAndRedirect(user.uid, role);
      
      return user;
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message);
      setLoading(false);
      throw error;
    }
  };

  const value = {
    currentUser,
    userProfile,
    userRole,
    setRole,
    logout,
    login,
    signup,
    signInWithGoogle,
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
