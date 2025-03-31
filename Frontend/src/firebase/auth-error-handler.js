import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Handle authentication errors and provide user-friendly messages
 * @param {Error} error - Firebase authentication error
 * @returns {string} - User-friendly error message
 */
export const handleAuthError = (error) => {
  console.error("Firebase Auth Error:", error);
  
  // Common network errors
  if (error.code === "auth/network-request-failed") {
    if (!navigator.onLine) {
      return "You appear to be offline. Please check your internet connection and try again.";
    }
    return "Network connection error. Please check your internet connection or try again later.";
  }
  
  switch (error.code) {
    case "auth/invalid-email":
      return "The email address is not valid.";
    case "auth/user-disabled":
      return "This user account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "This email address is already in use.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters.";
    case "auth/operation-not-allowed":
      return "This operation is not allowed.";
    case "auth/popup-closed-by-user":
      return "Authentication canceled. Please try again.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for OAuth operations.";
    case "auth/too-many-requests":
      return "Too many unsuccessful login attempts. Please try again later.";
    default:
      return `Authentication error: ${error.message}`;
  }
};

/**
 * Utility to diagnose network issues for Firebase connectivity.
 * This implementation uses the Firebase SDK to query the 'users' collection
 * instead of directly calling a Firestore internal endpoint.
 */
export const diagnoseNetworkIssue = async () => {
  try {
    // Use the SDK to fetch a small subset from the 'users' collection.
    await getDocs(collection(db, 'users'), { source: 'server' });
    return { isConnected: true };
  } catch (error) {
    console.error("Firestore connectivity test error:", error);
    return { isConnected: false, error: error.message };
  }
};
