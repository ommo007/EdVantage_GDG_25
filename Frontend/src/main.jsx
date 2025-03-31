import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
import { initializeFirestoreCollections } from './firebase/initFirestore';
import { db } from './firebase/firebase';

// Immediately render the app - don't wait for initialization
console.log('Rendering app immediately...');
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

// Initialize Firestore in the background with reduced retries and timeouts
const initFirestore = async () => {
  // Use a shorter timeout - we don't want to block user experience
  await new Promise(resolve => setTimeout(resolve, 200));
  
  if (!db) {
    console.error('Firestore DB instance not available. Skipping initialization.');
    return;
  }
  
  try {
    console.log('Initializing Firestore collections...');
    // Set a shorter timeout for initialization
    const initPromise = initializeFirestoreCollections();
    
    // Add timeout to prevent initialization from hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Firestore initialization timeout')), 5000);
    });
    
    // Race between initialization and timeout
    const result = await Promise.race([initPromise, timeoutPromise]);
    console.log('Firestore collections initialization result:', result);
  } catch (error) {
    console.error('Error or timeout during Firestore initialization:', error);
    // Don't try again - just move on
  }
};

// Start initialization in background without blocking app startup
initFirestore();
