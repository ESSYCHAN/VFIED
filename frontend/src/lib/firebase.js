// frontend/src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Check if Firebase is configured properly
const isConfigValid = () => {
  return firebaseConfig.apiKey && 
         firebaseConfig.authDomain && 
         firebaseConfig.projectId;
};

// Initialize Firebase with error handling
let app;
let db;
let auth;

try {
  if (!isConfigValid()) {
    console.error('Firebase configuration is incomplete or missing. Check your environment variables.');
  }
  
  app = initializeApp(firebaseConfig, 'VFiedApp');
  db = getFirestore(app);
  auth = getAuth(app);
  
  console.log('Firebase initialized successfully');
  
  // Connect to emulators in development mode (only in browser environment)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('Connected to Firebase emulators');
    } catch (emulatorError) {
      console.error('Failed to connect to Firebase emulators:', emulatorError);
    }
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

// Helper functions
export const isFirebaseConfigured = () => !!app && !!auth && !!db;
export { db, auth, app, firebaseConfig };