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
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// Collections
const USERS = "users";
const CLASSES = "classes";
const ENROLLMENTS = "enrollments";

// Create a new user profile in Firestore
export const createUserProfile = async (uid, userData) => {
  try {
    console.log(`Creating user profile for UID: ${uid}`);
    await setDoc(doc(db, USERS, uid), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`User profile created successfully for UID: ${uid}`);
    return true;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

// Get a user's profile from Firestore
export const getUserProfile = async (uid) => {
  try {
    console.log(`Fetching user profile for UID: ${uid}`);
    const userRef = doc(db, USERS, uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      console.log(`User profile found for UID: ${uid}`);
      return { id: userDoc.id, ...userDoc.data() };
    } else {
      console.log(`User profile not found for UID: ${uid}`);
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
    console.log(`Updating user profile for UID: ${uid}`);
    const userRef = doc(db, USERS, uid);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    });
    console.log(`User profile updated successfully for UID: ${uid}`);
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Update a user's role
export const updateUserRole = async (uid, role) => {
  try {
    console.log(`Updating user role for UID: ${uid} to role: ${role}`);
    const userRef = doc(db, USERS, uid);
    await updateDoc(userRef, {
      role: role,
      updatedAt: serverTimestamp(),
    });
    console.log(`User role updated successfully for UID: ${uid} to role: ${role}`);
    return true;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

// Get users by role
export const getUsersByRole = async (role) => {
  try {
    console.log(`Fetching users by role: ${role}`);
    const usersRef = collection(db, USERS);
    const q = query(usersRef, where("role", "==", role));
    const querySnapshot = await getDocs(q);

    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(`Fetched ${users.length} users with role: ${role}`);
    return users;
  } catch (error) {
    console.error("Error fetching users by role:", error);
    throw error;
  }
};
