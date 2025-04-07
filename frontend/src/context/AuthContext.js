// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// Create the context with a default value
const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Enable persistence
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log("Persistence enabled");
      })
      .catch((error) => {
        console.error("Error enabling persistence:", error);
      });
  }, []);

  // Sign up function
  async function signup(email, password, displayName, role = 'candidate') {
    // Add a timeout promise
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Signup request timed out')), 10000)
    );
    
    try {
      // Race against the timeout
      await Promise.race([
        createUserWithEmailAndPassword(auth, email, password),
        timeoutPromise
      ]);
      // Rest of signup code
    } catch (error) {
      console.error("Error during signup:", error);
      throw error;
    }
  }
  

  // Login function with error handling
  async function login(email, password) {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login error:", error.code, error.message);
      // Check if the error is related to connectivity
      if (error.code === 'auth/network-request-failed') {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      }
      throw error;
    }
  }

  // Google sign-in function
  // Modified signInWithGoogle function for frontend/src/context/AuthContext.js
async function signInWithGoogle() {
  try {
    console.log("Starting Google sign-in process...");
    
    // Check for online status first (only in browser)
    if (typeof window !== 'undefined' && !navigator.onLine) {
      throw new Error('Network connection unavailable. Please check your internet connection and try again.');
    }
    
    const provider = new GoogleAuthProvider();
    console.log("Created Google Auth Provider");
    
    // Add scopes if needed
    provider.addScope('profile');
    provider.addScope('email');
    
    // Configure persistence to use local storage
    await setPersistence(auth, browserLocalPersistence);
    
    console.log("Attempting popup sign-in...");
    // Add timeout handling
    const signInPromise = signInWithPopup(auth, provider);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Sign-in request timed out. Please try again.')), 30000)
    );
    
    const result = await Promise.race([signInPromise, timeoutPromise]);
    
    console.log("Google sign-in successful", result.user.uid);
    
    // Check if user document exists
    console.log("Checking if user exists in Firestore...");
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    
    if (!userDoc.exists()) {
      console.log("User doesn't exist, creating document...");
      await setDoc(doc(db, 'users', result.user.uid), {
        name: result.user.displayName || '',
        email: result.user.email,
        role: 'candidate',
        createdAt: new Date()
      });
      console.log("User document created successfully");
    } else {
      console.log("User already exists in Firestore");
    }
    
    return result;
  } catch (error) {
    console.error("Detailed Google sign-in error:", {
      code: error.code,
      message: error.message,
      email: error.email,
      credential: error.credential
    });
    
    // Provide more user-friendly error messages
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Network connection failed. Please check your internet connection and try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in was cancelled. Please try again and complete the Google sign-in process.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Another sign-in attempt is in progress. Please wait for it to complete or refresh the page and try again.');
    } else if (typeof window !== 'undefined' && !navigator.onLine) {
      throw new Error('You appear to be offline. Please check your internet connection and try again.');
    } else {
      throw new Error(`Failed to sign in with Google: ${error.message || 'because the client is offline'}`);
    }
  }
}

  // Logout function
  function logout() {
    return signOut(auth);
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Get user's role from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role || 'candidate');
          } else {
            // Create user document if it doesn't exist
            await setDoc(doc(db, 'users', user.uid), {
              name: user.displayName || '',
              email: user.email,
              role: 'candidate',
              createdAt: new Date()
            });
            setUserRole('candidate');
          }
        } catch (error) {
          console.error("Error getting user role:", error);
          setUserRole('candidate'); // Default fallback
        }
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  // Context value
  const value = {
    currentUser,
    userRole,
    signup,
    login,
    signInWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}