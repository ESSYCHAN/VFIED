// src/lib/auth-helpers.js
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Verify authentication token from request headers
 * 
 * @param {Object} req - HTTP request object
 * @returns {Promise<Object>} User information if authentication is successful
 * @throws {Error} If authentication fails
 */
export async function verifyAuth(req) {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }
    
    // Extract the token
    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      throw new Error('No token provided');
    }
    
    // Verify the token
    let decoded;
    try {
      decoded = await auth.verifyIdToken(token);
    } catch (error) {
      throw new Error('Invalid authentication token');
    }
    
    if (!decoded.uid) {
      throw new Error('Invalid user ID in token');
    }
    
    // Get user data from Firestore
    const userRef = doc(db, 'users', decoded.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userSnap.data();
    
    // Return user info
    return {
      userId: decoded.uid,
      email: decoded.email || userData.email,
      role: decoded.role || userData.role || 'user',
      userData
    };
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}

/**
 * Check if user has required role(s)
 * 
 * @param {Object} req - HTTP request object
 * @param {string|string[]} requiredRoles - Required role(s)
 * @returns {Promise<Object>} User information if authorized
 * @throws {Error} If user doesn't have required role
 */
export async function checkRole(req, requiredRoles) {
  try {
    // Verify authentication first
    const user = await verifyAuth(req);
    
    // Convert requiredRoles to array if it's a string
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    // Admin has access to everything
    if (user.role === 'admin') {
      return user;
    }
    
    // Check if user has any of the required roles
    if (roles.length > 0 && !roles.includes(user.role)) {
      throw new Error(`Access denied: Required role(s): ${roles.join(', ')}`);
    }
    
    return user;
  } catch (error) {
    console.error('Role check error:', error);
    throw error;
  }
}