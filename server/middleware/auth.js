// server/middleware/auth.js
const { admin } = require('../firebase/admin');

/**
 * Authentication middleware to verify Firebase ID tokens
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
    
    // Check if user has recruiter role for recruitment routes
    if (req.originalUrl.startsWith('/api/ai-recruitment') && 
        req.user.role !== 'recruiter' && 
        req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Requires recruiter permissions' });
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Unauthorized - Token expired' });
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({ error: 'Unauthorized - Token revoked' });
    }
    
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

module.exports = auth;