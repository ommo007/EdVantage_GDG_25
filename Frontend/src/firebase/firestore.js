import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  deleteDoc
} from "firebase/firestore";
import { db } from "./firebase";

// Collections
const USERS = "users";
const CLASSES = "classes";
const ENROLLMENTS = "enrollments";

// Create a new user profile in Firestore
export const createUserProfile = async (uid, userData) => {
  try {
    await setDoc(doc(db, USERS, uid), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

// Get a user's profile from Firestore
export const getUserProfile = async (uid) => {
  try {
    const userRef = doc(db, USERS, uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Update a user's profile
export const updateUserProfile = async (uid, userData) => {
  try {
    const userRef = doc(db, USERS, uid);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Update a user's role
export const updateUserRole = async (uid, role) => {
  try {
    const userRef = doc(db, USERS, uid);
    await updateDoc(userRef, {
      role: role,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

// Get users by role
export const getUsersByRole = async (role) => {
  try {
    const usersRef = collection(db, USERS);
    const q = query(usersRef, where("role", "==", role));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching users by role:", error);
    throw error;
  }
};
