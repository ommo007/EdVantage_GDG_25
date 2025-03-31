import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { isValidRole, getDefaultRole } from '../services/RoleManager';
import { createOrUpdateUserDocument, getUserDocument } from '../services/FirestoreService';
import { handleAuthError, diagnoseNetworkIssue } from './auth-error-handler';

const auth = getAuth();
const googleProvider = new GoogleAuthProvider();

// Utility to retry operations on network failure
const withRetry = async (operation, maxRetries = 2, delayMs = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // If not the first attempt, check connectivity first
      if (attempt > 0) {
        const networkCheck = await diagnoseNetworkIssue();
        if (!networkCheck.isConnected) {
          console.log(`Network still unavailable (attempt ${attempt}), retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          // Increase delay for next attempt
          delayMs = delayMs * 1.5;
        }
      }
      
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Only retry network errors
      if (error.code !== 'auth/network-request-failed') {
        throw error;
      }
      
      console.log(`Network error (attempt ${attempt}), retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      // Increase delay for next attempt
      delayMs = delayMs * 1.5;
    }
  }
  
  // If we get here, all retries failed
  throw lastError;
};

// Add the registerUser function that is used in the SignupPage component
export const registerUser = async (email, password, displayName, userType = 'student') => {
  try {
    return await withRetry(async () => {
      // Validate the user role using the role manager
      if (!isValidRole(userType)) {
        console.warn(`Invalid role provided: ${userType}, defaulting to ${getDefaultRole()}`);
        userType = getDefaultRole();
      }
      
      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create the user profile in Firestore with validated role
      const userProfile = {
        email: user.email,
        role: userType,
        displayName: displayName || email.split('@')[0],
        createdAt: new Date(),
      };
      
      // Log the role being stored
      console.log(`Creating new user with role: ${userType}`);
      
      // Use the FirestoreService to create the user document
      await createOrUpdateUserDocument(user.uid, userProfile);
      
      console.log("User registered successfully:", user.uid);
      
      // Return both the user and profile as expected by the signup component
      return { 
        user, 
        profile: userProfile 
      };
    });
  } catch (error) {
    console.error("Error registering user:", error);
    const errorMessage = handleAuthError(error);
    error.userMessage = errorMessage;
    throw error;
  }
};

// Create a new user with email and password
export const createUser = async (email, password, role = 'student') => {
  try {
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Use our centralized FirestoreService
    await createOrUpdateUserDocument(user.uid, {
      email: user.email,
      role: role,
      displayName: user.displayName || email.split('@')[0],
    });
    
    console.log("User created successfully:", user.uid);
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Sign in with email and password
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in:", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    return await withRetry(async () => {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getUserDocument(user.uid);
      
      if (!userDoc) {
        // New user, create profile with default role
        const userProfile = {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: getDefaultRole(),
        };
        
        await createOrUpdateUserDocument(user.uid, userProfile);
        console.log(`New Google user created in Firestore with role: ${getDefaultRole()}`);
        return { user, profile: userProfile };
      } else {
        // Existing user - get profile and validate role
        const role = isValidRole(userDoc.role) ? userDoc.role : getDefaultRole();
        
        console.log(`Existing Google user signed in with role: ${role}`);
        return { user, profile: { ...userDoc, role } };
      }
    });
  } catch (error) {
    console.error("Google sign-in error:", error);
    const errorMessage = handleAuthError(error);
    error.userMessage = errorMessage;
    throw error;
  }
};

// Log out the user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// Change user role
export const changeUserRole = async (userId, newRole) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { role: newRole });
    console.log(`User ${userId} role changed to ${newRole}`);
    return true;
  } catch (error) {
    console.error("Role change error:", error);
    throw error;
  }
};

// Auth state change listener for outside components
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
