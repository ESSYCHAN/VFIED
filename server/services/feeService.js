// server/services/feeService.js
const { db } = require('../firebase/admin');

// Default fee structure (in cents)
const DEFAULT_FEES = {
  job_posting_fee: 5000,    // $50.00
  verification_fee: 1500,   // $15.00
  hire_success_fee: 10000   // $100.00
};

// Fee adjustments by user role
const ROLE_ADJUSTMENTS = {
  admin: {
    job_posting_fee: 0,
    verification_fee: 0,
    hire_success_fee: 0
  },
  partner: {
    job_posting_fee: 2500,    // 50% discount
    verification_fee: 750,     // 50% discount
    hire_success_fee: 5000     // 50% discount
  },
  early_adopter: {
    job_posting_fee: 4000,    // 20% discount
    verification_fee: 1200,    // 20% discount
    hire_success_fee: 8000     // 20% discount
  }
};

/**
 * Calculate fee amount for a specific user and fee type
 * @param {string} userId - User ID
 * @param {string} feeType - Fee type ('job_posting_fee', 'verification_fee', 'hire_success_fee')
 * @returns {Promise<number>} - Fee amount in cents
 */
async function calculateFeeAmount(userId, feeType) {
  try {
    // Get default fee
    const defaultFee = DEFAULT_FEES[feeType] || 0;
    
    // If no default fee exists for this type
    if (defaultFee === 0) {
      return 0;
    }
    
    // Get user's details to check special status
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return defaultFee;
    }
    
    const userData = userDoc.data();
    
    // Check for special role-based adjustments
    if (userData.specialRole && ROLE_ADJUSTMENTS[userData.specialRole]) {
      return ROLE_ADJUSTMENTS[userData.specialRole][feeType] || defaultFee;
    }
    
    // Check for custom fee structure in user document
    if (userData.customFees && userData.customFees[feeType] !== undefined) {
      return userData.customFees[feeType];
    }
    
    // Check if there's an active promotion
    const now = new Date();
    const promotionsQuery = await db.collection('promotions')
      .where('active', '==', true)
      .where('startDate', '<=', now)
      .where('endDate', '>=', now)
      .where('feeType', '==', feeType)
      .get();
    
    if (!promotionsQuery.empty) {
      // Use the first matching promotion (could enhance to select best discount)
      const promotion = promotionsQuery.docs[0].data();
      
      if (promotion.discountType === 'percentage') {
        const discountAmount = defaultFee * (promotion.discountValue / 100);
        return Math.max(0, defaultFee - discountAmount);
      } else if (promotion.discountType === 'fixed') {
        return Math.max(0, defaultFee - promotion.discountValue);
      }
    }
    
    // No adjustments apply, return default fee
    return defaultFee;
  } catch (error) {
    console.error('Error calculating fee amount:', error);
    return DEFAULT_FEES[feeType] || 0;
  }
}

/**
 * Apply a custom fee structure to a user
 * @param {string} userId - User ID
 * @param {Object} customFees - Custom fee structure
 * @param {string} reason - Reason for custom fees
 * @returns {Promise<boolean>} - Whether custom fees were applied successfully
 */
async function applyCustomFees(userId, customFees, reason) {
  try {
    // Update user document with custom fees
    await db.collection('users').doc(userId).update({
      customFees: customFees,
      'feeAdjustments.updatedAt': admin.firestore.FieldValue.serverTimestamp(),
      'feeAdjustments.reason': reason,
      'feeAdjustments.updatedBy': context.auth?.uid || 'system'
    });
    
    return true;
  } catch (error) {
    console.error('Error applying custom fees:', error);
    return false;
  }
}

module.exports = {
  calculateFeeAmount,
  applyCustomFees,
  DEFAULT_FEES
};