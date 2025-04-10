// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider, 
  signInWithPopup,
  signOut,
  getIdTokenResult
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

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
  const [authError, setAuthError] = useState(null);
  const [clientSide, setClientSide] = useState(false);

  // Set clientSide to true when component mounts (client-side only)
  useEffect(() => {
    setClientSide(true);
  }, []);

  // Clear error when dependencies change
  useEffect(() => {
    setAuthError(null);
  }, [currentUser, userRole]);

  // Sign up function
  async function signup(email, password, displayName, role = 'user') {
    try {
      setAuthError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        displayName: displayName || '',
        email: email,
        role: role,
        createdAt: new Date()
      });
      
      return userCredential;
    } catch (error) {
      console.error("Error during signup:", error);
      setAuthError(error.message);
      throw error;
    }
  }

  // Login function
  async function login(email, password) {
    try {
      setAuthError(null);
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login error:", error);
      setAuthError(error.message);
      throw error;
    }
  }

  // Google sign-in function
  async function signInWithGoogle() {
    try {
      setAuthError(null);
      if (typeof window !== 'undefined' && !navigator.onLine) {
        throw new Error('You are offline. Please check your internet connection and try again.');
      }
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // Create new user document if it doesn't exist
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          displayName: result.user.displayName || '',
          email: result.user.email,
          role: 'user', // Default role for new Google sign-ins
          createdAt: new Date()
        });
      }
      
      return result;
    } catch (error) {
      console.error("Google sign-in error:", error);
      setAuthError(error.message);
      throw error;
    }
  }

  // Logout function
  async function logout() {
    try {
      setAuthError(null);
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      setAuthError(error.message);
      throw error;
    }
  }

  // Update user role
  async function updateUserRole(uid, newRole) {
    try {
      setAuthError(null);
      
      // Find the user document by uid
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error("User not found");
      }
      
      // Update the role
      await updateDoc(userRef, { role: newRole });
      
      // If updating the current user, update the state
      if (currentUser && currentUser.uid === uid) {
        setUserRole(newRole);
      }
      
      return true;
    } catch (error) {
      console.error("Error updating user role:", error);
      setAuthError(error.message);
      throw error;
    }
  }

  // Force refresh token to pick up new role
  async function refreshUserToken() {
    try {
      if (!currentUser) return null;
      const token = await currentUser.getIdTokenResult(true);
      return token;
    } catch (error) {
      console.error("Error refreshing token:", error);
      setAuthError(error.message);
      return null;
    }
  }

  // Get ID token for API calls
  async function getIdToken() {
    try {
      if (!currentUser) return null;
      return await currentUser.getIdToken();
    } catch (error) {
      console.error("Error getting ID token:", error);
      setAuthError(error.message);
      return null;
    }
  }

  // Subscribe to auth state changes
  useEffect(() => {
    if (!clientSide) return;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // First check for role in token claims (more secure)
          const tokenResult = await getIdTokenResult(user);
          
          if (tokenResult.claims.role) {
            setUserRole(tokenResult.claims.role);
          } else {
            // Fallback to Firestore user document
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUserRole(userData.role || 'user');
            } else {
              setUserRole('user');
            }
          }
        } catch (error) {
          console.error("Error getting user role:", error);
          setUserRole('user');
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
    loading,
    authError,
    signup,
    login,
    signInWithGoogle,
    logout,
    updateUserRole,
    refreshUserToken,
    getIdToken
  };

  // Only render children when on client-side
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}