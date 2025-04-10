// frontend/src/lib/feeService.js
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Default fee structure
const DEFAULT_FEES = {
  job_posting_fee: process.env.NEXT_PUBLIC_JOB_POSTING_FEE || 5000,
  verification_fee: process.env.NEXT_PUBLIC_VERIFICATION_FEE || 1500,
  hire_success_fee: process.env.NEXT_PUBLIC_HIRE_SUCCESS_FEE || 10000
};

// Fee adjustments by role
const ROLE_ADJUSTMENTS = {
  admin: {
    job_posting_fee: 0,
    verification_fee: 0,
    hire_success_fee: 0
  },
  partner: {
    job_posting_fee: DEFAULT_FEES.job_posting_fee * 0.5, // 50% discount
    verification_fee: DEFAULT_FEES.verification_fee * 0.5,
    hire_success_fee: DEFAULT_FEES.hire_success_fee * 0.5
  },
  early_adopter: {
    job_posting_fee: DEFAULT_FEES.job_posting_fee * 0.8, // 20% discount
    verification_fee: DEFAULT_FEES.verification_fee * 0.8,
    hire_success_fee: DEFAULT_FEES.hire_success_fee * 0.8
  }
};

/**
 * Calculate the appropriate fee for a user
 * @param {string} userId - User ID
 * @param {string} feeType - Fee type (job_posting_fee, verification_fee, etc.)
 * @returns {Promise<number>} - Fee amount in cents
 */
export async function calculateFee(userId, feeType) {
  try {
    // Get default fee
    const defaultFee = DEFAULT_FEES[feeType];
    
    if (!defaultFee) {
      return 0;
    }
    
    // Get user document to check for special roles
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return defaultFee;
    }
    
    const userData = userDoc.data();
    
    // Check for special roles
    if (userData.specialRole && ROLE_ADJUSTMENTS[userData.specialRole]) {
      return ROLE_ADJUSTMENTS[userData.specialRole][feeType] || defaultFee;
    }
    
    // Check for custom pricing
    if (userData.customFees && userData.customFees[feeType] !== undefined) {
      return userData.customFees[feeType];
    }
    
    // Return default fee
    return defaultFee;
  } catch (error) {
    console.error('Error calculating fee:', error);
    return DEFAULT_FEES[feeType] || 0;
  }
}