const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { db } = require('../firebase/admin');

router.get('/user-info', auth, async (req, res) => {
  try {
    // Get the user from Firestore directly
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    // Send back detailed debug info
    res.json({
      auth: {
        uid: req.user.uid,
        email: req.user.email,
        role: req.user.role,
        claims: req.user.claims || 'none'
      },
      firestore: userDoc.exists ? userDoc.data() : 'No user document',
      headers: {
        authorization: req.headers.authorization ? 'Bearer token exists' : 'No bearer token'
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;