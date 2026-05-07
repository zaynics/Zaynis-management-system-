import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, query, where, onSnapshot, serverTimestamp, setDoc, updateDoc, deleteDoc, getDocFromCache, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
// @ts-ignore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Test Connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

const provider = new GoogleAuthProvider();

export const login = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Data Services
export const getStudents = (callback: (students: any[]) => void) => {
  const q = collection(db, 'students');
  return onSnapshot(q, 
    (snapshot) => {
      const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(students);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'students')
  );
};

export const addStudent = async (name: string, studentClass: string) => {
  const docId = Math.random().toString(36).substring(2, 15);
  const path = `students/${docId}`;
  try {
    const data = {
      name,
      class: studentClass,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser?.uid,
    };
    await setDoc(doc(db, 'students', docId), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const deleteStudent = async (studentId: string) => {
  const path = `students/${studentId}`;
  try {
    await deleteDoc(doc(db, 'students', studentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const getGrades = (studentId: string | null, callback: (grades: any[]) => void) => {
  const q = studentId 
    ? query(collection(db, 'grades'), where('studentId', '==', studentId))
    : collection(db, 'grades');
  
  return onSnapshot(q,
    (snapshot) => {
      const grades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(grades);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'grades')
  );
};

export const addGrade = async (studentId: string, subject: string, mark: number) => {
  const docId = Math.random().toString(36).substring(2, 15);
  const path = `grades/${docId}`;
  try {
    const data = {
      studentId,
      subject,
      mark,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser?.uid,
    };
    await setDoc(doc(db, 'grades', docId), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const deleteGrade = async (gradeId: string) => {
  const path = `grades/${gradeId}`;
  try {
    await deleteDoc(doc(db, 'grades', gradeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};
