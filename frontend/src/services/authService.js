// frontend/src/authService.js
import { auth } from '../lib/firebase';

/**
 * Get the current user's ID token
 * @returns {Promise<string>} Promise resolving to the user's ID token
 */
export const getIdToken = async () => {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error('No user is currently signed in');
  }
  
  try {
    // Force refresh to ensure the token is up to date
    const token = await currentUser.getIdToken(true);
    return token;
  } catch (error) {
    console.error('Error getting ID token:', error);
    throw error;
  }
};

/**
 * Get the current user
 * @returns {Object|null} The current user object or null if not signed in
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Check if user is authenticated
 * @returns {boolean} Whether a user is currently signed in
 */
export const isAuthenticated = () => {
  return !!auth.currentUser;
};

/**
 * Sign in with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} - Firebase user credential
 */
export const signInWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    return userCredential;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

/**
 * Sign up with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} - Firebase user credential
 */
export const signUpWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    return userCredential;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

/**
 * Send password reset email
 * @param {string} email - User's email
 * @returns {Promise<void>}
 */
export const sendPasswordResetEmail = async (email) => {
  try {
    await auth.sendPasswordResetEmail(email);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (profileData) => {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error('No user is currently signed in');
  }
  
  try {
    await currentUser.updateProfile(profileData);
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
};

/**
 * Change user password
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
export const updatePassword = async (newPassword) => {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error('No user is currently signed in');
  }
  
  try {
    await currentUser.updatePassword(newPassword);
  } catch (error) {
    console.error('Password update error:', error);
    throw error;
  }
};

/**
 * Set up auth state change observer
 * @param {Function} callback - Callback function to run on auth state change
 * @returns {Function} - Unsubscribe function
 */
export const onAuthStateChanged = (callback) => {
  return auth.onAuthStateChanged(callback);
};