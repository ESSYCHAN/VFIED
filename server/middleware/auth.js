// server/middleware/auth.js
const { admin } = require('../firebase/admin');
const logger = require('../utils/logger');

/**
 * Authentication middleware to verify Firebase ID tokens
 * Checks user authentication and handles role-based access control
 */
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    // Extract the token from the Authorization header
    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
    }
    
    // Verify the token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Add the user to the request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      role: decodedToken.role || 'user' // Default role is 'user'
    };
    
    logger.debug(`User authenticated: ${req.user.uid}, Role: ${req.user.role}`);
    
    // Check role-based permissions for different API paths
    if (req.originalUrl.startsWith('/api/admin') && 
        req.user.role !== 'admin') {
      logger.warn(`Access denied: User ${req.user.uid} with role ${req.user.role} attempted to access admin endpoint`);
      return res.status(403).json({ error: 'Forbidden - Requires admin permissions' });
    }
    
    if (req.originalUrl.startsWith('/api/verification/admin') && 
        req.user.role !== 'admin' && 
        req.user.role !== 'verifier') {
      logger.warn(`Access denied: User ${req.user.uid} with role ${req.user.role} attempted to access verification admin endpoint`);
      return res.status(403).json({ error: 'Forbidden - Requires verifier permissions' });
    }
    
    if (req.originalUrl.startsWith('/api/ai-recruitment') && 
        req.user.role !== 'recruiter' && 
        req.user.role !== 'admin') {
      logger.warn(`Access denied: User ${req.user.uid} with role ${req.user.role} attempted to access recruitment endpoint`);
      return res.status(403).json({ error: 'Forbidden - Requires recruiter permissions' });
    }
    
    next();
  } catch (error) {
    logger.error('Authentication error:', { 
      error: error.message, 
      code: error.code,
      stack: error.stack
    });
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Unauthorized - Token expired' });
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({ error: 'Unauthorized - Token revoked' });
    }
    
    if (error.code === 'auth/argument-error') {
      return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
    }
    
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

// Role-based middleware factory
const requireRole = (roles) => {
  return (req, res, next) => {
    // If auth middleware has already run, req.user should exist
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Authentication required' });
    }
    
    // Check if user has one of the required roles
    if (!roles.includes(req.user.role)) {
      logger.warn(`Role-based access denied: User ${req.user.uid} with role ${req.user.role} attempted to access restricted endpoint`);
      return res.status(403).json({ error: `Forbidden - Requires one of these roles: ${roles.join(', ')}` });
    }
    
    next();
  };
};

module.exports = {
  auth,
  requireRole,
  // Convenience middleware for common role requirements
  requireAdmin: requireRole(['admin']),
  requireVerifier: requireRole(['admin', 'verifier']),
  requireRecruiter: requireRole(['admin', 'recruiter'])
};