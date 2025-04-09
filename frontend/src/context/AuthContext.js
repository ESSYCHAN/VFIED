// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider, 
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Create auth context
const AuthContext = createContext({});

// Export the useAuth hook
export function useAuth() {
  return useContext(AuthContext);
}

// Create AuthProvider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientSide, setClientSide] = useState(false);

  // Set clientSide to true when component mounts (client-side only)
  useEffect(() => {
    setClientSide(true);
  }, []);

  // Sign up function
  async function signup(email, password, displayName, role = 'candidate') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: displayName || '',
        email: email,
        role: role,
        createdAt: new Date()
      });
      
      return userCredential;
    } catch (error) {
      console.error("Error during signup:", error);
      throw error;
    }
  }

  // Login function
  async function login(email, password) {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Google sign-in function
  async function signInWithGoogle() {
    try {
      if (typeof window !== 'undefined' && !navigator.onLine) {
        throw new Error('You are offline. Please check your internet connection and try again.');
      }
      
      const provider = new GoogleAuthProvider();
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
      console.error("Google sign-in error:", error);
      throw error;
    }
  }

  // Logout function
  function logout() {
    return signOut(auth);
  }

  // Subscribe to auth state changes
  useEffect(() => {
    if (!clientSide) return;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role || 'candidate');
          } else {
            setUserRole('candidate');
          }
        } catch (error) {
          console.error("Error getting user role:", error);
          setUserRole('candidate');
        }
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });
    
    return unsubscribe;
  }, [clientSide]);

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

  // Only render children when on client-side
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}