import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
//import { initializeFirestoreCollections } from './firebase/initFirestore';
//import { db } from './firebase/firebase';

// Immediately render the app - don't wait for initialization
console.log('Rendering app immediately...');
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

// Comment out Firebase initialization code for now
/*
const initFirestore = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  if (!db) {
    console.error('Firestore DB instance not available. Skipping initialization.');
    return;
  }
  
  try {
    console.log('Initializing Firestore collections...');
    const initPromise = initializeFirestoreCollections();
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Firestore initialization timeout')), 5000);
    });
    
    const result = await Promise.race([initPromise, timeoutPromise]);
    console.log('Firestore collections initialization result:', result);
  } catch (error) {
    console.error('Error or timeout during Firestore initialization:', error);
  }
};

initFirestore();
*/