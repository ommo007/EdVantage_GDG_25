import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { ROLES, isValidRole, getDefaultRole } from './RoleManager';

// Constants for Firestore collections
export const COLLECTIONS = {
  USERS: 'users',
  CLASSES: 'classes',
  ENROLLMENTS: 'enrollments',
  MATERIALS: 'study_materials'
};

// Add timeout utility for Firestore operations
const withTimeout = async (promise, timeoutMs = 5000, fallback = null) => {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Firestore operation timeout')), timeoutMs);
    });
    
    return await Promise.race([promise, timeoutPromise]);
  } catch (error) {
    console.error(`Firestore operation timed out after ${timeoutMs}ms:`, error);
    return fallback;
  }
};

/**
 * Create or update a user document in Firestore with role information
 * With timeout to prevent blocking UI
 */
export const createOrUpdateUserDocument = async (uid, userData) => {
  if (!uid) throw new Error('User ID is required');
  
  // Create operation with timeout
  return withTimeout(
    (async () => {
      try {
        // Check if user document already exists
        const userRef = doc(db, COLLECTIONS.USERS, uid);
        
        // Use a short timeout for the existence check
        const userSnapshot = await withTimeout(
          getDoc(userRef),
          2000,
          { exists: () => false } // fallback if timeout
        );
        
        if (userSnapshot.exists()) {
          // User document exists, update it
          console.log(`Updating existing user document for ${uid}`);
          await updateDoc(userRef, {
            ...userData,
            updatedAt: serverTimestamp()
          });
        } else {
          // User document doesn't exist, create a new one
          console.log(`Creating new user document for ${uid}`);
          
          // Ensure role is valid
          const role = isValidRole(userData.role) ? userData.role : getDefaultRole();
          
          await setDoc(userRef, {
            uid,
            email: userData.email || '',
            displayName: userData.displayName || '',
            photoURL: userData.photoURL || '',
            role: role,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        
        console.log(`User document operation successful for ${uid}`);
        return true;
      } catch (error) {
        console.error('Error in Firestore user document operation:', error);
        throw error;
      }
    })(),
    5000,  // 5 second timeout
    true   // Return success even on timeout to prevent blocking
  );
};

/**
 * Get user document from Firestore by UID with timeout
 */
export const getUserDocument = async (uid) => {
  if (!uid) return null;
  
  return withTimeout(
    (async () => {
      try {
        const userRef = doc(db, COLLECTIONS.USERS, uid);
        const userSnapshot = await getDoc(userRef);
        
        if (userSnapshot.exists()) {
          return {
            id: userSnapshot.id,
            ...userSnapshot.data()
          };
        }
        
        return null;
      } catch (error) {
        console.error('Error getting user document:', error);
        return null;
      }
    })(),
    3000,  // 3 second timeout
    null   // Return null on timeout
  );
};

/**
 * Update user role in Firestore
 * With timeout to prevent blocking UI
 */
export const updateUserRole = async (uid, role) => {
  if (!uid) throw new Error('User ID is required');
  if (!isValidRole(role)) throw new Error(`Invalid role: ${role}`);
  
  return withTimeout(
    (async () => {
      try {
        const userRef = doc(db, COLLECTIONS.USERS, uid);
        await updateDoc(userRef, {
          role,
          updatedAt: serverTimestamp()
        });
        
        console.log(`User role updated to ${role} for ${uid}`);
        return true;
      } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
      }
    })(),
    5000,  // 5 second timeout
    false  // Return false on timeout
  );
};

/**
 * Get users by role
 * With timeout to prevent blocking UI
 */
export const getUsersByRole = async (role) => {
  if (!isValidRole(role)) throw new Error(`Invalid role: ${role}`);
  
  return withTimeout(
    (async () => {
      try {
        const usersRef = collection(db, COLLECTIONS.USERS);
        const q = query(usersRef, where('role', '==', role));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error getting users by role:', error);
        return [];
      }
    })(),
    5000,  // 5 second timeout
    []     // Return empty array on timeout
  );
};
