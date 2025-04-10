// server/routes/payments.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const paymentService = require('../services/paymentService');
const subscriptionService = require('../services/subscriptionService');

/**
 * Create a job posting payment
 * POST /api/payments/job-posting
 */
// Update the job posting payment route
router.post('/job-posting', auth, async (req, res) => {
    try {
      const { requisitionId, amount } = req.body;
      const employerId = req.user.uid;
      
      if (!requisitionId) {
        return res.status(400).json({ error: 'Requisition ID is required' });
      }
      
      // Check if this is covered by the user's subscription
      const subscriptionCheck = await subscriptionService.checkSubscriptionFeature(
        employerId, 
        'job_posting'
      );
      
      // If feature is included in subscription and within limits
      if (subscriptionCheck.hasFeature && subscriptionCheck.withinLimit) {
        // Increment usage
        await subscriptionService.incrementFeatureUsage(employerId, 'job_posting');
        
        // Update requisition status to active
        await db.collection('requisitions').doc(requisitionId).update({
          status: 'active',
          paymentStatus: 'covered_by_subscription',
          activatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return res.json({
          success: true,
          paymentMethod: 'subscription',
          message: 'Job posting activated through subscription',
          usageInfo: {
            used: subscriptionCheck.used + 1,
            limit: subscriptionCheck.limit
          }
        });
      }
      
      // If not covered by subscription, proceed with payment intent
      const paymentIntent = await paymentService.createJobPostingPayment(
        employerId,
        requisitionId,
        amount || 5000 // Default to $50.00
      );
      
      res.json(paymentIntent);
    } catch (error) {
      console.error('Error handling job posting payment:', error);
      res.status(500).json({ error: 'Failed to process payment: ' + error.message });
    }
  });


/**
 * Create a verification payment
 * POST /api/payments/verification
 */
router.post('/verification', auth, async (req, res) => {
  try {
    const { credentialId, amount } = req.body;
    const userId = req.user.uid;
    
    if (!credentialId) {
      return res.status(400).json({ error: 'Credential ID is required' });
    }
    
    const paymentIntent = await paymentService.createVerificationPayment(
      userId,
      credentialId,
      amount || 1500 // Default to $15.00
    );
    
    res.json(paymentIntent);
  } catch (error) {
    console.error('Error creating verification payment:', error);
    res.status(500).json({ error: 'Failed to create payment: ' + error.message });
  }
});

/**
 * Create a hire success fee payment
 * POST /api/payments/hire-fee
 */
router.post('/hire-fee', auth, async (req, res) => {
  try {
    const { candidateId, requisitionId, amount } = req.body;
    const employerId = req.user.uid;
    
    if (!candidateId || !requisitionId) {
      return res.status(400).json({ error: 'Candidate ID and Requisition ID are required' });
    }
    
    const paymentIntent = await paymentService.createHireFeePayment(
      employerId,
      candidateId,
      requisitionId,
      amount || 10000 // Default to $100.00
    );
    
    res.json(paymentIntent);
  } catch (error) {
    console.error('Error creating hire fee payment:', error);
    res.status(500).json({ error: 'Failed to create payment: ' + error.message });
  }
});

module.exports = router;