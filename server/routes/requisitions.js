// server/routes/requisitions.js
const express = require('express');
const router = express.Router();
const { db, admin } = require('../firebase/admin');
const auth = require('../middleware/auth');
const { validateJobRequisition } = require('../models/JobRequisition');
// const requisitionRoutes = require('./routes/requisitions');

// Register the routes
// app.use('/api/requisitions', requisitionRoutes);
/**
 * Create a new job requisition
 * POST /api/requisitions
 */
router.post('/', auth, async (req, res) => {
  try {
    // Check if user has employer or recruiter role
    if (req.user.role !== 'employer' && req.user.role !== 'recruiter' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Only employers and recruiters can create job requisitions' });
    }
    
    // Validate request body
    const { error, value } = validateJobRequisition({
      ...req.body,
      createdBy: req.user.uid
    });
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    // Add timestamps
    const requisitionData = {
      ...value,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Save to Firestore
    const requisitionRef = await db.collection('requisitions').add(requisitionData);
    
    // Create a record in user's requisitions collection
    await db.collection('users').doc(req.user.uid).collection('requisitions').doc(requisitionRef.id).set({
      requisitionId: requisitionRef.id,
      title: requisitionData.title,
      status: requisitionData.status,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(201).json({
      id: requisitionRef.id,
      ...requisitionData
    });
  } catch (error) {
    console.error('Error creating job requisition:', error);
    res.status(500).json({ error: 'Failed to create job requisition: ' + error.message });
  }
});

/**
 * Get all job requisitions for a company
 * GET /api/requisitions
 */
router.get('/', auth, async (req, res) => {
  try {
    // Check if user has appropriate role
    if (req.user.role !== 'employer' && req.user.role !== 'recruiter' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Only employers and recruiters can view company requisitions' });
    }
    
    const { status, limit = 20, startAfter, companyId } = req.query;
    
    // Build query
    let query = db.collection('requisitions').where('createdBy', '==', req.user.uid);
    
    // If company ID is provided, filter by it (for admins)
    if (req.user.role === 'admin' && companyId) {
      query = db.collection('requisitions').where('companyId', '==', companyId);
    }
    
    // Filter by status if provided
    if (status) {
      query = query.where('status', '==', status);
    }
    
    // Order by creation date
    query = query.orderBy('createdAt', 'desc');
    
    // Pagination
    if (startAfter) {
      const startAfterDoc = await db.collection('requisitions').doc(startAfter).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }
    
    // Limit results
    query = query.limit(parseInt(limit));
    
    // Execute query
    const snapshot = await query.get();
    
    const requisitions = [];
    snapshot.forEach(doc => {
      requisitions.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : null,
        updatedAt: doc.data().updatedAt ? doc.data().updatedAt.toDate() : null,
        postDate: doc.data().postDate ? doc.data().postDate.toDate() : null,
        expiryDate: doc.data().expiryDate ? doc.data().expiryDate.toDate() : null
      });
    });
    
    res.json({
      requisitions,
      count: requisitions.length,
      hasMore: requisitions.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching job requisitions:', error);
    res.status(500).json({ error: 'Failed to fetch job requisitions: ' + error.message });
  }
});

/**
 * Get a specific job requisition by ID
 * GET /api/requisitions/:id
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const requisitionId = req.params.id;
    
    // Get the requisition document
    const requisitionDoc = await db.collection('requisitions').doc(requisitionId).get();
    
    if (!requisitionDoc.exists) {
      return res.status(404).json({ error: 'Job requisition not found' });
    }
    
    const requisitionData = requisitionDoc.data();
    
    // Check if user has permission to view this requisition
    const isCreator = requisitionData.createdBy === req.user.uid;
    const isPublic = requisitionData.visibility === 'public';
    const isAdmin = req.user.role === 'admin';
    
    if (!isCreator && !isPublic && !isAdmin) {
      return res.status(403).json({ error: 'You do not have permission to view this job requisition' });
    }
    
    // Format dates
    const formattedRequisition = {
      id: requisitionDoc.id,
      ...requisitionData,
      createdAt: requisitionData.createdAt ? requisitionData.createdAt.toDate() : null,
      updatedAt: requisitionData.updatedAt ? requisitionData.updatedAt.toDate() : null,
      postDate: requisitionData.postDate ? requisitionData.postDate.toDate() : null,
      expiryDate: requisitionData.expiryDate ? requisitionData.expiryDate.toDate() : null
    };
    
    res.json(formattedRequisition);
  } catch (error) {
    console.error('Error fetching job requisition:', error);
    res.status(500).json({ error: 'Failed to fetch job requisition: ' + error.message });
  }
});

/**
 * Update a job requisition
 * PUT /api/requisitions/:id
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const requisitionId = req.params.id;
    
    // Get the requisition document
    const requisitionDoc = await db.collection('requisitions').doc(requisitionId).get();
    
    if (!requisitionDoc.exists) {
      return res.status(404).json({ error: 'Job requisition not found' });
    }
    
    const requisitionData = requisitionDoc.data();
    
    // Check if user has permission to update this requisition
    if (requisitionData.createdBy !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to update this job requisition' });
    }
    
    // Validate the update data
    const { error, value } = validateJobRequisition({
      ...requisitionData,
      ...req.body,
      createdBy: requisitionData.createdBy, // Preserve original creator
      companyId: requisitionData.companyId // Preserve company ID
    });
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    // Update requisition
    const updateData = {
      ...value,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('requisitions').doc(requisitionId).update(updateData);
    
    // Update the record in user's requisitions collection
    await db.collection('users').doc(requisitionData.createdBy).collection('requisitions').doc(requisitionId).update({
      title: updateData.title,
      status: updateData.status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({
      id: requisitionId,
      ...updateData
    });
  } catch (error) {
    console.error('Error updating job requisition:', error);
    res.status(500).json({ error: 'Failed to update job requisition: ' + error.message });
  }
});

/**
 * Delete a job requisition
 * DELETE /api/requisitions/:id
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const requisitionId = req.params.id;
    
    // Get the requisition document
    const requisitionDoc = await db.collection('requisitions').doc(requisitionId).get();
    
    if (!requisitionDoc.exists) {
      return res.status(404).json({ error: 'Job requisition not found' });
    }
    
    const requisitionData = requisitionDoc.data();
    
    // Check if user has permission to delete this requisition
    if (requisitionData.createdBy !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to delete this job requisition' });
    }
    
    // Delete the requisition
    await db.collection('requisitions').doc(requisitionId).delete();
    
    // Delete the record from user's requisitions collection
    await db.collection('users').doc(requisitionData.createdBy).collection('requisitions').doc(requisitionId).delete();
    
    res.json({ message: 'Job requisition deleted successfully' });
  } catch (error) {
    console.error('Error deleting job requisition:', error);
    res.status(500).json({ error: 'Failed to delete job requisition: ' + error.message });
  }
});

/**
 * Activate a job requisition (change status to active)
 * POST /api/requisitions/:id/activate
 */
router.post('/:id/activate', auth, async (req, res) => {
  try {
    const requisitionId = req.params.id;
    
    // Get the requisition document
    const requisitionDoc = await db.collection('requisitions').doc(requisitionId).get();
    
    if (!requisitionDoc.exists) {
      return res.status(404).json({ error: 'Job requisition not found' });
    }
    
    const requisitionData = requisitionDoc.data();
    
    // Check if user has permission
    if (requisitionData.createdBy !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to activate this job requisition' });
    }
    
    // Update status to active
    await db.collection('requisitions').doc(requisitionId).update({
      status: 'active',
      postDate: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update the record in user's requisitions collection
    await db.collection('users').doc(requisitionData.createdBy).collection('requisitions').doc(requisitionId).update({
      status: 'active',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ 
      message: 'Job requisition activated successfully',
      status: 'active',
      postDate: new Date()
    });
  } catch (error) {
    console.error('Error activating job requisition:', error);
    res.status(500).json({ error: 'Failed to activate job requisition: ' + error.message });
  }
});

/**
 * Search for public job requisitions
 * GET /api/requisitions/search
 */
router.get('/search', async (req, res) => {
  try {
    const { 
      keywords, 
      location, 
      workType, 
      minSalary, 
      skills,
      industry,
      limit = 20,
      startAfter
    } = req.query;
    
    // Base query for public, active requisitions
    let query = db.collection('requisitions')
      .where('visibility', '==', 'public')
      .where('status', '==', 'active');
    
    // TODO: Implement more sophisticated search logic
    // For now, just return active public requisitions
    
    // Order by creation date
    query = query.orderBy('createdAt', 'desc');
    
    // Pagination
    if (startAfter) {
      const startAfterDoc = await db.collection('requisitions').doc(startAfter).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }
    
    // Limit results
    query = query.limit(parseInt(limit));
    
    // Execute query
    const snapshot = await query.get();
    
    const requisitions = [];
    snapshot.forEach(doc => {
      requisitions.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : null,
        updatedAt: doc.data().updatedAt ? doc.data().updatedAt.toDate() : null,
        postDate: doc.data().postDate ? doc.data().postDate.toDate() : null,
        expiryDate: doc.data().expiryDate ? doc.data().expiryDate.toDate() : null
      });
    });
    
    res.json({
      requisitions,
      count: requisitions.length,
      hasMore: requisitions.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Error searching job requisitions:', error);
    res.status(500).json({ error: 'Failed to search job requisitions: ' + error.message });
  }
});

module.exports = router;