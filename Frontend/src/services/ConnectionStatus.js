import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

/**
 * Service to monitor connection status to Firebase services
 */

// Global connection state
let connectionState = {
  firebase: {
    status: 'unknown',
    lastChecked: null,
    error: null
  },
  internet: navigator.onLine
};

// Add listeners for online/offline status
window.addEventListener('online', () => {
  connectionState.internet = true;
  // Trigger listeners
  notifyListeners();
});

window.addEventListener('offline', () => {
  connectionState.internet = false;
  // Trigger listeners
  notifyListeners();
});

// Listeners array
const listeners = [];

/**
 * Listen for connection status changes
 * @param {Function} callback - Function to call when status changes
 * @returns {Function} - Function to unsubscribe
 */
export const onConnectionStatusChange = (callback) => {
  listeners.push(callback);
  // Immediately notify with current status
  callback(connectionState);
  
  // Return unsubscribe function
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

/**
 * Notify all listeners of connection status changes
 */
const notifyListeners = () => {
  listeners.forEach(listener => {
    try {
      listener(connectionState);
    } catch (error) {
      console.error('Error in connection status listener:', error);
    }
  });
};

/**
 * Check Firebase connection using a lightweight Firestore query.
 * This uses the SDK (which handles auth & CORS) rather than directly calling Firestore endpoints.
 */
export const checkFirebaseConnection = async () => {
  connectionState.firebase.status = 'checking';
  connectionState.firebase.lastChecked = Date.now();
  notifyListeners();
  
  try {
    // Use a small query (for example, fetch at most one document from 'users')
    await getDocs(collection(db, 'users'), { source: 'server' });
    connectionState.firebase.status = 'connected';
    connectionState.firebase.error = null;
  } catch (error) {
    console.error("Firestore connectivity check error:", error);
    connectionState.firebase.status = 'error';
    connectionState.firebase.error = error.message;
  }
  
  connectionState.firebase.lastChecked = Date.now();
  notifyListeners();
  return connectionState;
};

// Check connection at startup
checkFirebaseConnection();

// Export the current state
export const getConnectionStatus = () => connectionState;
