# EdVantage Database Structure

This document outlines the Firestore database structure used in EdVantage.

## Collections

### users

Stores user profile data including role information.

**Document ID**: Firebase Auth UID

**Fields**:
```json
{
  "uid": "firebase-generated-uid",
  "email": "user@example.com",
  "displayName": "User Name",
  "photoURL": "https://example.com/profile.jpg",
  "role": "student", // Can be "student", "instructor", or "admin"
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

### classes

Stores information about classes/courses.

**Document ID**: Auto-generated

**Fields**:
```json
{
  "name": "Introduction to Physics",
  "description": "Basic physics concepts",
  "instructorId": "instructor-uid",
  "instructorName": "Instructor Name",
  "created": Timestamp,
  "updated": Timestamp,
  "enrollmentCount": 25,
  "isActive": true
}
```

### enrollments

Tracks which students are enrolled in which classes.

**Document ID**: Auto-generated

**Fields**:
```json
{
  "userId": "student-uid",
  "classId": "class-id",
  "enrolledAt": Timestamp,
  "status": "active", // Can be "active", "completed", "dropped"
  "progress": 65, // Percentage of completion
  "lastAccessed": Timestamp
}
```

### study_materials

Stores information about uploaded study materials.

**Document ID**: Auto-generated

**Fields**:
```json
{
  "fileName": "lecture_notes.pdf",
  "fileType": "application/pdf",
  "fileSize": 1024567,
  "filePath": "study_materials/class-id/file-id.pdf",
  "downloadURL": "https://storage.url/path",
  "classId": "class-id",
  "className": "Class Name",
  "instructorId": "instructor-uid",
  "uploadDate": Timestamp,
  "description": "Lecture notes for Chapter 3",
  "tags": ["physics", "chapter3"],
  "indexed": true // Whether this document has been indexed for RAG
}
```

## Security Rules

Firestore security rules should be set up to:

1. Allow users to read/write their own data
2. Restrict student access to only their enrolled classes
3. Allow instructors to manage their own classes and materials
4. Allow admins full access to all collections

## Queries

Common queries used in the application:

1. Get user by ID: `doc(db, "users", uid)`
2. Get users by role: `query(collection(db, "users"), where("role", "==", "instructor"))`
3. Get classes for instructor: `query(collection(db, "classes"), where("instructorId", "==", uid))`
4. Get enrollments for student: `query(collection(db, "enrollments"), where("userId", "==", uid))`
