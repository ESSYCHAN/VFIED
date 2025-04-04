
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { 
//   getAuth, 
//   createUserWithEmailAndPassword, 
//   signInWithEmailAndPassword, 
//   signOut, 
//   onAuthStateChanged,
//   GoogleAuthProvider,
//   signInWithPopup
// } from 'firebase/auth';
// import { doc, getDoc, getFirestore } from 'firebase/firestore';
// import { auth, db } from '../lib/firebase';

// const AuthContext = createContext();

// export function useAuth() {
//   return useContext(AuthContext);
// }

// export function AuthProvider({ children }) {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [userRole, setUserRole] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   const auth = getAuth();
//   const db = getFirestore();

//   // Sign up function (unchanged)
//   async function signup(email, password) {
//     try {
//       setError(null);
//       return await createUserWithEmailAndPassword(auth, email, password);
//     } catch (err) {
//       console.error("Signup error:", err);
//       setError(err.message);
//       throw err;
//     }
//   }

//   // Login function (unchanged)
//   async function login(email, password) {
//     try {
//       setError(null);
//       return await signInWithEmailAndPassword(auth, email, password);
//     } catch (err) {
//       console.error("Login error:", err);
//       setError(err.message);
//       throw err;
//     }
//   }

//   // Google sign-in function (unchanged)
//   async function signInWithGoogle() {
//     try {
//       setError(null);
//       const provider = new GoogleAuthProvider();
//       return await signInWithPopup(auth, provider);
//     } catch (err) {
//       console.error("Google sign-in error:", err);
//       setError(err.message);
//       throw err;
//     }
//   }

//   // Logout function (unchanged)
//   async function logout() {
//     try {
//       setError(null);
//       return await signOut(auth);
//     } catch (err) {
//       console.error("Logout error:", err);
//       setError(err.message);
//       throw err;
//     }
//   }

//   // Fetch user role from Firestore (updated with employer role)
//   async function fetchUserRole(uid) {
//     try {
//       const userDoc = await getDoc(doc(db, 'users', uid));
//       if (userDoc.exists()) {
//         const userData = userDoc.data();
//         setUserRole(userData.role || 'user'); // Now supports 'employer' role
//       } else {
//         setUserRole('user');
//       }
//     } catch (err) {
//       console.error('Error fetching user role:', err);
//       setUserRole('user');
//     }
//   }

//   // Auth state listener (unchanged)
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       setCurrentUser(user);
//       if (user) {
//         await fetchUserRole(user.uid);
//       } else {
//         setUserRole(null);
//       }
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   // New role checkers (added these)
//   const isEmployer = userRole === 'employer';
//   const isRecruiter = userRole === 'recruiter';
//   const isAdmin = userRole === 'admin';
//   const isEmployerOrRecruiter = isEmployer || isRecruiter || isAdmin;

//   // Context value (updated with new role checkers)
//   const value = {
//     currentUser,
//     userRole,
//     isEmployer,
//     isRecruiter,
//     isAdmin,
//     isEmployerOrRecruiter,
//     login,
//     signup,
//     logout,
//     signInWithGoogle,
//     error,
//     setError
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// }

import { createContext } from 'react';
export const AuthContext = createContext(null);
export default AuthContext;