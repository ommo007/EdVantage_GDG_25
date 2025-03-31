import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider, getToken } from "firebase/app-check";

// Improved Firebase initialization with faster configuration
console.log("Initializing Firebase...");

// Get config from environment variables with fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCmj3oPX2UgzN0ovH-tIPV-6Owk0N1-wYU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vision09.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vision09",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vision09.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "204850414986",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:204850414986:web:696157845a0a384f92b473"
};

// Initialize Firebase immediately
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let appCheck;

try {
    // Initialize Firebase App Check (using ReCaptchaV3 provider)
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY), // Replace with your real site key
      isTokenAutoRefreshEnabled: true,
    });
    console.log("Firebase App Check initialized:", appCheck);

    // Log the App Check token (for debugging purposes)
    getToken(appCheck).then((tokenResponse) => {
      console.log("App Check token:", tokenResponse.token);
    }).catch((error) => {
      console.error("App Check token error:", error);
    });
} catch (error) {
    console.error("Error initializing App Check:", error);
}

console.log("Firebase services initialized synchronously");

// Enable offline persistence in the background without blocking
setTimeout(() => {
  enableIndexedDbPersistence(db)
    .then(() => {
      console.log("Offline persistence enabled successfully");
    })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn("Offline persistence couldn't be enabled because multiple tabs are open");
      } else if (err.code === 'unimplemented') {
        console.warn("The current browser doesn't support offline persistence");
      } else {
        console.error("Error enabling offline persistence:", err);
      }
    });
}, 1000); // Delay by 1 second to allow application to load first

// Export Firebase instances
export { app, auth, db, storage, appCheck };
