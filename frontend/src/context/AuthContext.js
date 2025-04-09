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
      // Check for online status first
      if (typeof window !== 'undefined' && !navigator.onLine) {
        throw new Error('Network connection unavailable. Please check your internet connection and try again.');
      }
      
      const provider = new GoogleAuthProvider();
      
      // Configure persistence to use local storage
      await setPersistence(auth, browserLocalPersistence);
      
      const result = await signInWithPopup(auth, provider);
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          name: result.user.displayName || '',
          email: result.user.email,
          role: 'candidate',
          createdAt: new Date()
        });
      }
      
      return result;
    } catch (error) {
      if (error.code === 'auth/network-request-failed' || 
          (typeof window !== 'undefined' && !navigator.onLine)) {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      }
      throw new Error(`Failed to sign in with Google: ${error.message}`);
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