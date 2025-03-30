// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

console.log("Initializing Firebase...");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmj3oPX2UgzN0ovH-tIPV-6Owk0N1-wYU",
  authDomain: "vision09.firebaseapp.com",
  projectId: "vision09",
  storageBucket: "vision09.firebasestorage.app",
  messagingSenderId: "204850414986",
  appId: "1:204850414986:web:696157845a0a384f92b473",
  measurementId: "G-ECCP5S7LP0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase initialized:", app);

const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics only in production environment
let analytics = null;
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // Dynamically import analytics to prevent SSR issues
  import('firebase/analytics').then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  }).catch(err => {
    console.error('Analytics failed to load:', err);
  });
}

export { app, auth, db, analytics };
