// server/routes/verification.js
const express = require('express');
const router = express.Router();
const { db, admin } = require('../firebase/admin');
const auth = require('../middleware/auth');

/**
 * Submit a credential for verification
 * POST /api/verification/request
 */
router.post('/request', auth, async (req, res) => {
  try {
    const { credentialId, verificationNotes } = req.body;
    const userId = req.user.uid;
    
    if (!credentialId) {
      return res.status(400).json({ error: 'Credential ID is required' });
    }
    
    // Get the credential document
    const credentialRef = db.collection('credentials').doc(credentialId);
    const credentialDoc = await credentialRef.get();
    
    if (!credentialDoc.exists) {
      return res.status(404).json({ error: 'Credential not found' });
    }
    
    const credentialData = credentialDoc.data();
    
    // Verify that the credential belongs to the user
    if (credentialData.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to verify this credential' });
    }
    
    // Check if the credential is already in verification
    if (credentialData.verificationStatus && 
        ['pending', 'inProgress', 'verified'].includes(credentialData.verificationStatus)) {
      return res.status(400).json({ 
        error: `Credential is already in ${credentialData.verificationStatus} status`,
        status: credentialData.verificationStatus
      });
    }
    
    // Create a verification request
    const verificationRequestRef = await db.collection('verificationRequests').add({
      credentialId,
      userId,
      credentialType: credentialData.type,
      credentialTitle: credentialData.title,
      credentialIssuer: credentialData.issuer,
      submissionDate: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending',
      verificationNotes,
      documentUrl: credentialData.documentUrl,
      timeline: [
        {
          status: 'submitted',
          date: admin.firestore.FieldValue.serverTimestamp(),
          note: 'Verification request submitted'
        }
      ]
    });
    
    // Update the credential status
    await credentialRef.update({
      verificationStatus: 'pending',
      verificationRequestId: verificationRequestRef.id,
      dateSubmitted: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(201).json({
      message: 'Verification request submitted successfully',
      requestId: verificationRequestRef.id,
      status: 'pending'
    });
  } catch (error) {
    console.error('Error submitting verification request:', error);
    res.status(500).json({ error: 'Failed to submit verification request: ' + error.message });
  }
});

/**
 * Get verification status for a credential
 * GET /api/verification/status/:credentialId
 */
router.get('/status/:credentialId', auth, async (req, res) => {
  try {
    const { credentialId } = req.params;
    const userId = req.user.uid;
    
    // Get the credential document
    const credentialRef = db.collection('credentials').doc(credentialId);
    const credentialDoc = await credentialRef.get();
    
    if (!credentialDoc.exists) {
      return res.status(404).json({ error: 'Credential not found' });
    }
    
    const credentialData = credentialDoc.data();
    
    // Verify that the credential belongs to the user
    if (credentialData.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to view this credential' });
    }
    
    // If no verification has been requested
    if (!credentialData.verificationRequestId) {
      return res.json({
        status: credentialData.verificationStatus || 'draft',
        timeline: [
          {
            status: 'created',
            date: credentialData.createdAt || credentialData.dateUploaded,
            note: 'Credential uploaded'
          }
        ]
      });
    }
    
    // Get the verification request
    const requestRef = db.collection('verificationRequests').doc(credentialData.verificationRequestId);
    const requestDoc = await requestRef.get();
    
    if (!requestDoc.exists) {
      return res.status(404).json({ error: 'Verification request not found' });
    }
    
    const requestData = requestDoc.data();
    
    res.json({
      status: credentialData.verificationStatus,
      timeline: requestData.timeline || [],
      submissionDate: requestData.submissionDate,
      lastUpdated: requestData.lastUpdated,
      notes: requestData.publicNotes || null
    });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    res.status(500).json({ error: 'Failed to fetch verification status: ' + error.message });
  }
});

/**
 * Get all verification requests for an administrator
 * GET /api/verification/admin/requests
 */
router.get('/admin/requests', auth, async (req, res) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'admin' && req.user.role !== 'verifier') {
      return res.status(403).json({ error: 'You do not have permission to access this resource' });
    }
    
    const { status, limit = 20, startAfter } = req.query;
    
    let query = db.collection('verificationRequests');
    
    // Filter by status if provided
    if (status) {
      query = query.where('status', '==', status);
    }
    
    // Order by submission date
    query = query.orderBy('submissionDate', 'desc');
    
    // Pagination
    if (startAfter) {
      const startAfterDoc = await db.collection('verificationRequests').doc(startAfter).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }
    
    // Limit results
    query = query.limit(parseInt(limit));
    
    const snapshot = await query.get();
    
    const requests = [];
    snapshot.forEach(doc => {
      requests.push({
        id: doc.id,
        ...doc.data(),
        submissionDate: doc.data().submissionDate ? doc.data().submissionDate.toDate() : null,
        lastUpdated: doc.data().lastUpdated ? doc.data().lastUpdated.toDate() : null
      });
    });
    
    res.json({
      requests,
      count: requests.length,
      hasMore: requests.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching verification requests:', error);
    res.status(500).json({ error: 'Failed to fetch verification requests: ' + error.message });
  }
});

/**
 * Update verification status (admin only)
 * PUT /api/verification/admin/update/:requestId
 */
router.put('/admin/update/:requestId', auth, async (req, res) => {
  try {
    // Check if user has admin role
    if (req.user.role !== 'admin' && req.user.role !== 'verifier') {
      return res.status(403).json({ error: 'You do not have permission to access this resource' });
    }
    
    const { requestId } = req.params;
    const { status, notes, publicNotes } = req.body;
    
    if (!status || !['pending', 'inProgress', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }
    
    // Get the verification request
    const requestRef = db.collection('verificationRequests').doc(requestId);
    const requestDoc = await requestRef.get();
    
    if (!requestDoc.exists) {
      return res.status(404).json({ error: 'Verification request not found' });
    }
    
    const requestData = requestDoc.data();
    const credentialId = requestData.credentialId;
    
    // Add a new timeline entry
    const timelineEntry = {
      status,
      date: admin.firestore.FieldValue.serverTimestamp(),
      note: notes || `Status updated to ${status}`,
      updatedBy: req.user.uid
    };
    
    // Update the verification request
    await requestRef.update({
      status,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      publicNotes: publicNotes || null,
      adminNotes: notes || null,
      timeline: admin.firestore.FieldValue.arrayUnion(timelineEntry)
    });
    
    // Update the credential status
    const credentialRef = db.collection('credentials').doc(credentialId);
    await credentialRef.update({
      verificationStatus: status,
      lastVerificationUpdate: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // If status is verified, add blockchain verification data (mock for now)
    if (status === 'verified') {
      // Generate a random hash for demonstration
      const blockchainHash = Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      await credentialRef.update({
        blockchainVerified: true,
        blockchainHash,
        blockchainTimestamp: admin.firestore.FieldValue.serverTimestamp(),
        verificationDate: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    // If status is rejected, add rejection date
    if (status === 'rejected') {
      await credentialRef.update({
        rejectionDate: admin.firestore.FieldValue.serverTimestamp(),
        rejectionReason: publicNotes || null
      });
    }
    
    res.json({
      message: 'Verification status updated successfully',
      status,
      timeline: timelineEntry
    });
  } catch (error) {
    console.error('Error updating verification status:', error);
    res.status(500).json({ error: 'Failed to update verification status: ' + error.message });
  }
});

module.exports = router;