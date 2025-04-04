import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
// import { auth, db } from '../lib/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // For compatibility with Layout.js which uses user and not currentUser
  const [user, setUser] = useState(null);
  
  const auth = getAuth();
  const db = getFirestore();

  // Sign up function (unchanged)
  async function signup(email, password) {
    try {
      setError(null);
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message);
      throw err;
    }
  }

  // Login function (unchanged)
  async function login(email, password) {
    try {
      setError(null);
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
      throw err;
    }
  }

  // Google sign-in function (unchanged)
  async function signInWithGoogle() {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      return await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError(err.message);
      throw err;
    }
  }

  // Logout function (unchanged)
  async function logout() {
    try {
      setError(null);
      return await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
      setError(err.message);
      throw err;
    }
  }

  // Fetch user role from Firestore (updated with employer role)
  async function fetchUserRole(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRole(userData.role || 'user'); // Now supports 'employer' role
      } else {
        setUserRole('user');
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
      setUserRole('user');
    }
  }

  // Auth state listener (updated to set the user state too)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userData) => {
      setCurrentUser(userData);
      
      if (userData) {
        await fetchUserRole(userData.uid);
        // Set user state to match the user format expected by Layout
        setUser({
          uid: userData.uid,
          email: userData.email,
          role: userRole || 'user'
        });
      } else {
        setUserRole(null);
        setUser(null);
      }
      
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);
  
  // Update user when userRole changes
  useEffect(() => {
    if (currentUser && userRole) {
      setUser({
        uid: currentUser.uid,
        email: currentUser.email,
        role: userRole
      });
    }
  }, [currentUser, userRole]);

  // New role checkers (added these)
  const isEmployer = userRole === 'employer';
  const isRecruiter = userRole === 'recruiter';
  const isAdmin = userRole === 'admin';
  const isEmployerOrRecruiter = isEmployer || isRecruiter || isAdmin;

  // Context value (updated with new role checkers and user state)
  const value = {
    currentUser,
    userRole,
    user, // Add this for Layout compatibility
    loading,
    isEmployer: userRole === 'employer',
    isRecruiter: userRole === 'recruiter',
    isAdmin: userRole === 'admin',
    isEmployerOrRecruiter: ['employer', 'recruiter', 'admin'].includes(userRole),
    login,
    signup,
    logout,
    signInWithGoogle,
    error,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Keep only one useAuth export at the bottom
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}