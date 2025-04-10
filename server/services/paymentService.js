// server/services/paymentService.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { db, admin } = require('../firebase/admin');

/**
 * Create a payment intent for job posting
 * @param {string} employerId - Employer user ID
 * @param {string} requisitionId - Job requisition ID
 * @param {number} amount - Payment amount in cents
 * @returns {Promise<Object>} Stripe payment intent
 */
async function createJobPostingPayment(employerId, requisitionId, amount = 5000) {
  try {
    // Create a payment intent in Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      metadata: {
        type: 'job_posting_fee',
        employerId,
        requisitionId
      }
    });
    
    // Record the payment intent in Firestore
    await db.collection('payment_intents').doc(paymentIntent.id).set({
      employerId,
      requisitionId,
      amount,
      status: 'created',
      type: 'job_posting_fee',
      created: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update the requisition with payment intent info
    await db.collection('requisitions').doc(requisitionId).update({
      paymentIntentId: paymentIntent.id,
      paymentStatus: 'pending',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      clientSecret: paymentIntent.client_secret,
      amount,
      requisitionId
    };
  } catch (error) {
    console.error('Error creating job posting payment:', error);
    throw error;
  }
}

/**
 * Create a payment intent for credential verification
 * @param {string} userId - User ID
 * @param {string} credentialId - Credential ID
 * @param {number} amount - Payment amount in cents
 * @returns {Promise<Object>} Stripe payment intent
 */
async function createVerificationPayment(userId, credentialId, amount = 1500) {
  try {
    // Create a payment intent in Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      metadata: {
        type: 'verification_fee',
        userId,
        credentialId
      }
    });
    
    // Record the payment intent in Firestore
    await db.collection('payment_intents').doc(paymentIntent.id).set({
      userId,
      credentialId,
      amount,
      status: 'created',
      type: 'verification_fee',
      created: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update the credential with payment intent info
    await db.collection('credentials').doc(credentialId).update({
      paymentIntentId: paymentIntent.id,
      paymentStatus: 'pending',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      clientSecret: paymentIntent.client_secret,
      amount,
      credentialId
    };
  } catch (error) {
    console.error('Error creating verification payment:', error);
    throw error;
  }
}

/**
 * Create a payment intent for hire success fee
 * @param {string} employerId - Employer user ID
 * @param {string} candidateId - Hired candidate user ID
 * @param {string} requisitionId - Job requisition ID
 * @param {number} amount - Payment amount in cents
 * @returns {Promise<Object>} Stripe payment intent
 */
async function createHireFeePayment(employerId, candidateId, requisitionId, amount = 10000) {
  try {
    // Create a payment intent in Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      metadata: {
        type: 'hire_success_fee',
        employerId,
        candidateId,
        requisitionId
      }
    });
    
    // Record the payment intent in Firestore
    await db.collection('payment_intents').doc(paymentIntent.id).set({
      employerId,
      candidateId,
      requisitionId,
      amount,
      status: 'created',
      type: 'hire_success_fee',
      created: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update the hire record with payment intent info
    await db.collection('hires').add({
      employerId,
      candidateId,
      requisitionId,
      paymentIntentId: paymentIntent.id,
      paymentStatus: 'pending',
      hireDate: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      clientSecret: paymentIntent.client_secret,
      amount,
      requisitionId,
      candidateId
    };
  } catch (error) {
    console.error('Error creating hire fee payment:', error);
    throw error;
  }
}

module.exports = {
  createJobPostingPayment,
  createVerificationPayment,
  createHireFeePayment
};