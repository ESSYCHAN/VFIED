// frontend/src/services/paymentService.js
import { getIdToken } from '../authService';

/**
 * Create a job posting payment intent
 * @param {string} requisitionId - Job requisition ID
 * @param {number} amount - Payment amount in cents (default: 5000)
 * @returns {Promise<Object>} Payment intent details
 */
export async function createJobPostingPayment(requisitionId, amount = 5000) {
  try {
    const token = await getIdToken();
    
    const response = await fetch('/api/payments/job-posting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        requisitionId,
        amount
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create payment');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating job posting payment:', error);
    throw error;
  }
}

/**
 * Create a verification payment intent
 * @param {string} credentialId - Credential ID
 * @param {number} amount - Payment amount in cents (default: 1500)
 * @returns {Promise<Object>} Payment intent details
 */
export async function createVerificationPayment(credentialId, amount = 1500) {
  try {
    const token = await getIdToken();
    
    const response = await fetch('/api/payments/verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        credentialId,
        amount
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create payment');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating verification payment:', error);
    throw error;
  }
}

/**
 * Create a hire success fee payment intent
 * @param {string} candidateId - Candidate user ID
 * @param {string} requisitionId - Job requisition ID
 * @param {number} amount - Payment amount in cents (default: 10000)
 * @returns {Promise<Object>} Payment intent details
 */
export async function createHireFeePayment(candidateId, requisitionId, amount = 10000) {
  try {
    const token = await getIdToken();
    
    const response = await fetch('/api/payments/hire-fee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        candidateId,
        requisitionId,
        amount
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create payment');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating hire fee payment:', error);
    throw error;
  }
}