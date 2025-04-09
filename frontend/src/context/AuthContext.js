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

// src/context/AuthContext.js
// In src/context/AuthContext.js
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Define the signup function within the component
  async function signup(email, password, displayName, role = 'candidate') {
    try {
      // Create the user
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name if provided
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        name: displayName || '',
        email: result.user.email,
        role: role,
        createdAt: new Date()
      });
      
      return result;
    } catch (error) {
      console.error("Error during signup:", error);
      throw error;
    }
  }

  // Your other functions like login, logout, etc.
  async function login(email, password) {
    // Implementation...
  }

  async function signInWithGoogle() {
    // Implementation...
  }

  function logout() {
    return signOut(auth);
  }

  // Rest of your component...

  // Context value - now signup will be defined
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