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
import { auth } from '../lib/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // Add this line
  const [loading, setLoading] = useState(true);

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    // Use a try-catch block to handle any potential initialization errors
    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        
        if (user) {
          // Get the user's ID token to check for custom claims (roles)
          try {
            const tokenResult = await user.getIdTokenResult();
            // Set role from custom claims
            const role = tokenResult.claims?.role || 'user';
            setUserRole(role);
          } catch (error) {
            console.error("Error getting token:", error);
            setUserRole('user');
          }
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error("Auth state change error:", error);
      setLoading(false);
    }
  }, []);

  const value = {
    currentUser,
    userRole,  // Add this
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