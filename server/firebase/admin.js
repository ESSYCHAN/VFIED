// server/firebase/admin.js
const admin = require('firebase-admin');
require('dotenv').config();

// Check if Firebase admin has already been initialized
if (!admin.apps.length) { 
  // Initialize Firebase Admin with service account credentials
  // For local development, you can use service account JSON file
  // For production, use environment variables
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Parse the service account JSON from environment variable
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Use service account file path
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
  } else {
    // For development, you can use a local service account file
    try {
      const serviceAccount = require('../serviceAccountKey.json');
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}.firebaseio.com`,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`
      });
    } catch (error) {
      console.error('Failed to initialize Firebase Admin SDK:', error);
      console.error('Please provide Firebase service account credentials.');
      process.exit(1);
    }
  }
}

// Get Firestore database instance
const db = admin.firestore();

// Export Firebase admin and Firestore database
module.exports = {
  admin,
  db
};