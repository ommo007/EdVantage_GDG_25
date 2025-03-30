import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { auth } from "./firebase";
import { createUserProfile, getUserProfile, updateUserRole } from "./firestore";

// Configure auth persistence (stay logged in)
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Auth persistence error:", error);
  });

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if the user profile exists, if not create one
    const userProfile = await getUserProfile(user.uid);
    
    if (!userProfile) {
      await createUserProfile(user.uid, {
        email: user.email,
        displayName: user.displayName || "",
        role: "student", // Default role for Google sign-ins
        isActive: true,
        photoURL: user.photoURL || ""
      });
      return { 
        user, 
        profile: { 
          role: "student", 
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        } 
      };
    }
    
    return { user, profile: userProfile };
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

// Register a new user
export const registerUser = async (email, password, displayName, role) => {
  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user's display name
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    
    // Create user profile in Firestore
    await createUserProfile(user.uid, {
      email,
      displayName: displayName || "",
      role: role || "student", // Default role is student
      isActive: true
    });
    
    return {
      user,
      profile: {
        role: role || "student",
        displayName: displayName || "",
        email
      }
    };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Sign in existing user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Get user profile from Firestore
    const userProfile = await getUserProfile(userCredential.user.uid);
    
    return {
      user: userCredential.user,
      profile: userProfile
    };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Log out user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// Send password reset email
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
};

// Get current authenticated user with profile
export const getCurrentUserWithProfile = async () => {
  const user = auth.currentUser;
  
  if (!user) return null;
  
  try {
    const userProfile = await getUserProfile(user.uid);
    return {
      user,
      profile: userProfile
    };
  } catch (error) {
    console.error("Error fetching current user profile:", error);
    return { user, profile: null };
  }
};

// Get current authenticated user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Change user role
export const changeUserRole = async (uid, newRole) => {
  try {
    await updateUserRole(uid, newRole);
    return true;
  } catch (error) {
    console.error("Error changing user role:", error);
    throw error;
  }
};

// Listen for authentication state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
