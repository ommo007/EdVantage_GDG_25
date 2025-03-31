import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

// Define valid roles
export const ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student'
};

// Debug helper
const logRoleOperation = (operation, uid, role, source) => {
  console.log(`[RoleManager] ${operation} for user ${uid}: ${role} (Source: ${source})`);
};

/**
 * Verify if a role is valid
 */
export const isValidRole = (role) => {
  return Object.values(ROLES).includes(role);
};

/**
 * Get the default role
 */
export const getDefaultRole = () => ROLES.STUDENT;

/**
 * Force refresh role from Firestore
 */
export const forceRefreshRole = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const role = userData.role;
      if (isValidRole(role)) {
        localStorage.setItem('userRole', role);
        logRoleOperation('Force refreshed role', uid, role, 'Firestore');
        return role;
      }
    }
    return getDefaultRole();
  } catch (error) {
    console.error("Error forcing role refresh:", error);
    return getDefaultRole();
  }
};

/**
 * Get a user's role with verification
 */
export const getUserRole = async (uid) => {
  try {
    // First check localStorage for cached role
    const storedRole = localStorage.getItem('userRole');
    if (storedRole && isValidRole(storedRole)) {
      logRoleOperation('Retrieved role', uid, storedRole, 'localStorage');
      return storedRole;
    }
    // If no valid cached role, get from Firestore
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const firebaseRole = userData.role;
      if (isValidRole(firebaseRole)) {
        localStorage.setItem('userRole', firebaseRole);
        logRoleOperation('Retrieved role', uid, firebaseRole, 'Firestore');
        return firebaseRole;
      }
    }
    logRoleOperation('Using default role', uid, getDefaultRole(), 'default');
    return getDefaultRole();
  } catch (error) {
    console.error("Error getting user role:", error);
    return getDefaultRole();
  }
};

/**
 * Set a user's role with verification
 */
export const setUserRole = async (uid, role) => {
  try {
    if (!isValidRole(role)) {
      console.error(`Invalid role: ${role}`);
      return false;
    }
    // Update in Firestore
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { role });
    localStorage.setItem('userRole', role);
    logRoleOperation('Set role', uid, role, 'API');
    return true;
  } catch (error) {
    console.error("Error setting user role:", error);
    return false;
  }
};

/**
 * Clear user role data
 */
export const clearRoleData = () => {
  localStorage.removeItem('userRole');
  console.log('[RoleManager] Cleared role data');
};

/**
 * Get dashboard path for given role
 */
export const getDashboardPath = (role) => {
  if (!isValidRole(role)) {
    return `/${getDefaultRole()}`;
  }
  return `/${role}`;
};
