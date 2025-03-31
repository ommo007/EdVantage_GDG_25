import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { ROLES } from '../services/RoleManager';

// Helper: Create a placeholder document in a collection if it doesn't exist
const createPlaceholder = async (collectionName) => {
  const placeholderRef = doc(db, collectionName, 'placeholder_doc');
  try {
    const placeholderSnap = await getDoc(placeholderRef);
    if (!placeholderSnap.exists()) {
      await setDoc(placeholderRef, { temp: true, createdAt: serverTimestamp() });
      console.log(`Placeholder document created in ${collectionName}`);
    } else {
      console.log(`Placeholder document already exists in ${collectionName}`);
    }
  } catch (error) {
    console.error(`Error creating placeholder document in ${collectionName}:`, error);
  }
};

/**
 * Initialize required Firestore collections with sample documents
 * Firestore will automatically create collections when documents are added
 */
export const initializeFirestoreCollections = async () => {
  try {
    console.log('Starting Firestore collections initialization...');

    // Verify Firestore connection
    if (!db) {
      console.error('Firestore instance is not initialized properly');
      return false;
    }

    // Create demo users with explicit error handling for each
    console.log('Creating demo users...');
    const adminCreated = await createDemoUserWithErrorHandling('admin@example.com', 'Admin User', ROLES.ADMIN);
    const instructorCreated = await createDemoUserWithErrorHandling('instructor@example.com', 'Instructor User', ROLES.INSTRUCTOR);
    const studentCreated = await createDemoUserWithErrorHandling('student@example.com', 'Student User', ROLES.STUDENT);

    console.log(`Demo users creation status: Admin=${adminCreated}, Instructor=${instructorCreated}, Student=${studentCreated}`);

    // Create sample class with retry logic
    let classRef = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts && !classRef) {
      try {
        attempts++;
        console.log(`Attempting to create sample class (attempt ${attempts}/${maxAttempts})...`);

        classRef = await addDoc(collection(db, 'classes'), {
          name: 'Introduction to Computer Science',
          description: 'Learn the fundamentals of programming and computer science',
          instructorId: 'demo-instructor',
          instructorName: 'Instructor User',
          created: serverTimestamp(),
          updated: serverTimestamp(),
          enrollmentCount: 0,
          isActive: true
        });

        console.log('Sample class created successfully with ID:', classRef.id);
      } catch (error) {
        console.error(`Error creating sample class (attempt ${attempts}/${maxAttempts}):`, error);
        if (attempts === maxAttempts) {
          console.error('Max attempts reached for creating sample class');
          return false;
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Only proceed with study materials if class was created
    if (classRef) {
      try {
        console.log('Creating sample study material...');
        const materialRef = await addDoc(collection(db, 'study_materials'), {
          fileName: 'Introduction.pdf',
          fileType: 'application/pdf',
          fileSize: 1024567,
          filePath: `study_materials/${classRef.id}/intro.pdf`,
          downloadURL: 'https://example.com/sample.pdf',
          classId: classRef.id,
          className: 'Introduction to Computer Science',
          instructorId: 'demo-instructor',
          uploadDate: serverTimestamp(),
          description: 'Introduction to the course',
          tags: ['intro', 'course'],
          indexed: false
        });

        console.log('Sample study material created with ID:', materialRef.id);
      } catch (error) {
        console.error('Error creating sample study material:', error);
        // Continue even if study material creation fails
      }
    }

    // Create sample enrollment to connect student with class
    if (classRef && studentCreated) {
      try {
        console.log('Creating sample enrollment...');
        const enrollmentRef = await addDoc(collection(db, 'enrollments'), {
          userId: 'demo-student',
          classId: classRef.id,
          enrolledAt: serverTimestamp(),
          status: 'active',
          progress: 0,
          lastAccessed: serverTimestamp()
        });

        console.log('Sample enrollment created with ID:', enrollmentRef.id);
      } catch (error) {
        console.error('Error creating sample enrollment:', error);
        // Continue even if enrollment creation fails
      }
    }

    // Create placeholder docs so empty collections are created
    await createPlaceholder('users');
    await createPlaceholder('classes');
    await createPlaceholder('enrollments');
    await createPlaceholder('study_materials');

    console.log('Firestore collections successfully initialized');
    return true;
  } catch (error) {
    console.error('Error initializing Firestore collections:', error);
    return false;
  }
};

/**
 * Create a demo user with explicit error handling
 */
const createDemoUserWithErrorHandling = async (email, displayName, role) => {
  const userId = `demo-${role}`;
  const userRef = doc(db, 'users', userId);

  try {
    // Check if user already exists
    console.log(`Checking if demo ${role} user exists...`);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      console.log(`Demo ${role} user already exists.`);
      return true;
    }

    console.log(`Creating demo ${role} user...`);
    await setDoc(userRef, {
      uid: userId,
      email,
      displayName,
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Verify the document was created
    const verifyDoc = await getDoc(userRef);
    if (verifyDoc.exists()) {
      console.log(`Demo ${role} user successfully created and verified.`);
      return true;
    } else {
      console.error(`Failed to verify creation of demo ${role} user.`);
      return false;
    }
  } catch (error) {
    console.error(`Error creating demo ${role} user:`, error);
    return false;
  }
};
