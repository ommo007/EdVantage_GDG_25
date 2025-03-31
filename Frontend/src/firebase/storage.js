import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, storage } from './firebase';
// Replace UUID with a built-in id generator since the package is missing
// import { v4 as uuidv4 } from 'uuid';

// Use the storage from firebase.js
// const storage = getStorage();
const STUDY_MATERIALS = 'study_materials';

// Generate a unique ID without using uuid
const generateUniqueId = () => {
  return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

// Upload a document to Firebase Storage and save metadata in Firestore
export const uploadStudyMaterial = async (file, metadata) => {
  try {
    console.log(`Uploading study material: ${file.name}`);
    // Use our custom ID generator instead of uuidv4
    const fileId = generateUniqueId();
    const fileExtension = file.name.split('.').pop();
    const filePath = `study_materials/${metadata.classId}/${fileId}.${fileExtension}`;
    const storageRef = ref(storage, filePath);

    // Upload the file to Firebase Storage
    console.log(`Uploading file to Firebase Storage: ${file.name}`);
    await uploadBytes(storageRef, file);

    // Get the download URL
    console.log(`Getting download URL for: ${file.name}`);
    const downloadURL = await getDownloadURL(storageRef);

    // Save metadata to Firestore
    const docData = {
      id: fileId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      filePath,
      downloadURL,
      uploadDate: new Date(),
      classId: metadata.classId,
      className: metadata.className,
      instructorId: metadata.instructorId,
      description: metadata.description || '',
      tags: metadata.tags || [],
      indexed: false, // Flag to indicate if the document has been indexed for RAG
    };

    console.log(`Saving metadata to Firestore for: ${file.name}`);
    const docRef = await addDoc(collection(db, STUDY_MATERIALS), docData);

    console.log(`Study material uploaded successfully with ID: ${docRef.id}`);
    return { id: docRef.id, ...docData };
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
};

// Get all study materials for a specific class
export const getStudyMaterialsByClass = async (classId) => {
  try {
    console.log(`Fetching study materials for class ID: ${classId}`);
    const q = query(
      collection(db, STUDY_MATERIALS),
      where("classId", "==", classId)
    );

    const querySnapshot = await getDocs(q);
    const materials = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(`Fetched ${materials.length} study materials for class ID: ${classId}`);
    return materials;
  } catch (error) {
    console.error("Error fetching study materials:", error);
    throw error;
  }
};

// Get all study materials for an instructor
export const getStudyMaterialsByInstructor = async (instructorId) => {
  try {
    console.log(`Fetching study materials for instructor ID: ${instructorId}`);
    const q = query(
      collection(db, STUDY_MATERIALS),
      where("instructorId", "==", instructorId)
    );

    const querySnapshot = await getDocs(q);
    const materials = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(`Fetched ${materials.length} study materials for instructor ID: ${instructorId}`);
    return materials;
  } catch (error) {
    console.error("Error fetching instructor study materials:", error);
    throw error;
  }
};

// Delete a study material
export const deleteStudyMaterial = async (materialId, filePath) => {
  try {
    console.log(`Deleting study material with ID: ${materialId}`);
    // Delete from Firestore
    await deleteDoc(doc(db, STUDY_MATERIALS, materialId));

    // Delete from Storage
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);

    console.log(`Study material deleted successfully with ID: ${materialId}`);
    return true;
  } catch (error) {
    console.error("Error deleting study material:", error);
    throw error;
  }
};

// Update the indexed status of a study material
export const updateMaterialIndexStatus = async (materialId, indexed) => {
  try {
    console.log(`Updating index status for material ID: ${materialId} to indexed: ${indexed}`);
    const materialRef = doc(db, STUDY_MATERIALS, materialId);
    await updateDoc(materialRef, { indexed });
    console.log(`Index status updated successfully for material ID: ${materialId}`);
    return true;
  } catch (error) {
    console.error("Error updating index status:", error);
    throw error;
  }
};
