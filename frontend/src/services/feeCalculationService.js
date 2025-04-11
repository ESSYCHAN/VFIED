// services/feeCalculationService.js
import { 
    doc, 
    getDoc, 
    collection, 
    query, 
    where, 
    getDocs,
    limit,
    orderBy 
  } from 'firebase/firestore';
  import { db } from '../lib/firebase';
  
  /**
   * FeeCalculationService
   * 
   * This service handles all transaction fee calculations based on:
   * 1. Transaction type
   * 2. Transaction amount
   * 3. User status/tier
   * 4. Volume discounts
   * 5. Special promotions
   */
  
  // Base fee rates (percentage as decimal)
  const BASE_FEE_RATES = {
    job_posting_fee: 0.05,      // 5% of transaction
    verification_fee: 0.10,     // 10% of transaction
    hire_success_fee: 0.07,     // 7% of transaction
    subscription: 0.02,         // 2% of subscription amount
    default: 0.05               // Default 5% for unspecified transaction types
  };
  
  // Minimum fee amounts in cents
  const MINIMUM_FEES = {
    job_posting_fee: 100,      // $1.00 minimum
    verification_fee: 50,       // $0.50 minimum
    hire_success_fee: 500,      // $5.00 minimum
    subscription: 50,           // $0.50 minimum
    default: 100                // $1.00 minimum default
  };
  
  // Maximum fee amounts in cents
  const MAXIMUM_FEES = {
    job_posting_fee: 1000,      // $10.00 maximum
    verification_fee: 500,      // $5.00 maximum
    hire_success_fee: 2500,     // $25.00 maximum
    subscription: 1000,         // $10.00 maximum
    default: 1000               // $10.00 maximum default
  };
  
  // User tier discount rates
  const TIER_DISCOUNTS = {
    free: 0,                    // No discount
    premium: 0.10,              // 10% discount
    enterprise: 0.20,           // 20% discount
    partner: 0.30               // 30% discount for partners
  };
  
  // Volume threshold tiers (in cents) and discounts
  const VOLUME_DISCOUNT_TIERS = [
    { threshold: 1000000, discount: 0.05 },    // $10,000 - 5% discount
    { threshold: 5000000, discount: 0.10 },    // $50,000 - 10% discount
    { threshold: 10000000, discount: 0.15 },   // $100,000 - 15% discount
    { threshold: 25000000, discount: 0.20 }    // $250,000 - 20% discount
  ];
  
  /**
   * Calculate transaction fee for a given transaction
   * 
   * @param {string} transactionType - Type of transaction (job_posting_fee, verification_fee, etc.)
   * @param {number} amount - Transaction amount in cents
   * @param {string} userId - User ID for user-specific calculations
   * @returns {Promise<number>} - Calculated fee amount in cents
   */
  export async function calculateTransactionFee(transactionType, amount, userId) {
    try {
      // Validate inputs
      if (!transactionType || !amount || amount <= 0) {
        console.error('Invalid transaction parameters', { transactionType, amount });
        return 0;
      }
  
      // 1. Get base fee rate for this transaction type
      const baseRate = BASE_FEE_RATES[transactionType] || BASE_FEE_RATES.default;
      let calculatedFee = Math.round(amount * baseRate);
      
      // 2. Apply minimum and maximum fee constraints
      const minFee = MINIMUM_FEES[transactionType] || MINIMUM_FEES.default;
      const maxFee = MAXIMUM_FEES[transactionType] || MAXIMUM_FEES.default;
      calculatedFee = Math.max(minFee, Math.min(calculatedFee, maxFee));
  
      // If no user ID, return base calculated fee
      if (!userId) {
        return calculatedFee;
      }
  
      // 3. Get user data for tier-based discounts
      const userDiscount = await getUserDiscountRate(userId);
      
      // Apply user tier discount
      if (userDiscount > 0) {
        calculatedFee = Math.round(calculatedFee * (1 - userDiscount));
      }
  
      // 4. Check for volume discounts
      const volumeDiscount = await getVolumeDiscountRate(userId);
      
      // Apply volume discount
      if (volumeDiscount > 0) {
        calculatedFee = Math.round(calculatedFee * (1 - volumeDiscount));
      }
  
      // 5. Check for promotional discounts
      const promoDiscount = await getPromotionalDiscount(userId, transactionType);
      
      // Apply promotional discount
      if (promoDiscount > 0) {
        calculatedFee = Math.round(calculatedFee * (1 - promoDiscount));
      }
  
      // 6. Apply minimum fee constraint after all discounts
      calculatedFee = Math.max(minFee, calculatedFee);
  
      // Log the fee calculation for debugging
      console.log('Fee calculation result:', {
        transactionType,
        amount,
        userId,
        baseRate,
        userDiscount,
        volumeDiscount,
        promoDiscount,
        calculatedFee
      });
  
      return calculatedFee;
    } catch (error) {
      console.error('Fee calculation error:', error);
      // Return default fee in case of error
      return MINIMUM_FEES[transactionType] || MINIMUM_FEES.default;
    }
  }
  
  /**
   * Get the discount rate for a user based on their tier
   * 
   * @param {string} userId - User ID
   * @returns {Promise<number>} - Discount rate (0-1)
   */
  async function getUserDiscountRate(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return 0; // No discount for non-existent users
      }
      
      const userData = userDoc.data();
      
      // Check for subscription tier
      if (userData.subscription && userData.subscription.status === 'active') {
        const tier = userData.subscription.plan;
        
        // Convert tier to discount rate
        if (tier.includes('premium')) {
          return TIER_DISCOUNTS.premium;
        } else if (tier.includes('enterprise')) {
          return TIER_DISCOUNTS.enterprise;
        } else if (tier.includes('partner')) {
          return TIER_DISCOUNTS.partner;
        }
      }
      
      // Check for special role-based discounts
      if (userData.specialRole === 'partner') {
        return TIER_DISCOUNTS.partner;
      }
      
      // Check for custom discount rate if exists
      if (userData.feeSettings && typeof userData.feeSettings.discountRate === 'number') {
        return Math.min(1, Math.max(0, userData.feeSettings.discountRate)); // Ensure between 0-1
      }
      
      return 0; // Default: no discount
    } catch (error) {
      console.error('Error getting user discount rate:', error);
      return 0;
    }
  }
  
  /**
   * Get volume-based discount rate based on total transaction volume
   * 
   * @param {string} userId - User ID
   * @returns {Promise<number>} - Volume discount rate (0-1)
   */
  async function getVolumeDiscountRate(userId) {
    try {
      // Get user's total transaction volume over the past year
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef,
        where('userId', '==', userId),
        where('status', '==', 'completed'),
        where('timestamp', '>=', oneYearAgo)
      );
      
      const snapshot = await getDocs(q);
      
      // Calculate total volume
      let totalVolume = 0;
      snapshot.forEach(doc => {
        const transaction = doc.data();
        totalVolume += transaction.amount || 0;
      });
      
      // Determine which volume discount tier applies
      for (let i = VOLUME_DISCOUNT_TIERS.length - 1; i >= 0; i--) {
        if (totalVolume >= VOLUME_DISCOUNT_TIERS[i].threshold) {
          return VOLUME_DISCOUNT_TIERS[i].discount;
        }
      }
      
      return 0; // No volume discount
    } catch (error) {
      console.error('Error calculating volume discount:', error);
      return 0;
    }
  }
  
  /**
   * Check for any active promotional discounts
   * 
   * @param {string} userId - User ID
   * @param {string} transactionType - Type of transaction
   * @returns {Promise<number>} - Promotional discount rate (0-1)
   */
  async function getPromotionalDiscount(userId, transactionType) {
    try {
      const now = new Date();
      
      // Check for global promotions first
      const globalPromosQuery = query(
        collection(db, 'promotions'),
        where('active', '==', true),
        where('startDate', '<=', now),
        where('endDate', '>=', now),
        where('transactionTypes', 'array-contains', transactionType)
      );
      
      const globalSnapshot = await getDocs(globalPromosQuery);
      
      if (!globalSnapshot.empty) {
        // Use the highest discount rate if multiple promotions apply
        let highestDiscount = 0;
        
        globalSnapshot.forEach(doc => {
          const promo = doc.data();
          if (promo.discountRate > highestDiscount) {
            highestDiscount = promo.discountRate;
          }
        });
        
        return highestDiscount;
      }
      
      // Check for user-specific promotions
      const userPromosQuery = query(
        collection(db, 'user_promotions'),
        where('userId', '==', userId),
        where('active', '==', true),
        where('startDate', '<=', now),
        where('endDate', '>=', now),
        where('transactionTypes', 'array-contains', transactionType)
      );
      
      const userSnapshot = await getDocs(userPromosQuery);
      
      if (!userSnapshot.empty) {
        // Use the highest discount rate if multiple promotions apply
        let highestDiscount = 0;
        
        userSnapshot.forEach(doc => {
          const promo = doc.data();
          if (promo.discountRate > highestDiscount) {
            highestDiscount = promo.discountRate;
          }
        });
        
        return highestDiscount;
      }
      
      return 0; // No active promotions
    } catch (error) {
      console.error('Error checking for promotional discounts:', error);
      return 0;
    }
  }
  
  /**
   * Get transaction fee history for a user
   * 
   * @param {string} userId - User ID
   * @param {number} limit - Maximum number of records to return
   * @returns {Promise<Array>} - Array of transaction fee records
   */
  export async function getUserFeeHistory(userId, limit = 20) {
    try {
      if (!userId) {
        return [];
      }
      
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef,
        where('userId', '==', userId),
        where('fee', '>', 0),
        orderBy('fee', 'desc'),
        orderBy('timestamp', 'desc'),
        limit(limit)
      );
      
      const snapshot = await getDocs(q);
      
      const feeHistory = [];
      snapshot.forEach(doc => {
        const transaction = doc.data();
        feeHistory.push({
          id: doc.id,
          amount: transaction.amount,
          fee: transaction.fee,
          feePercentage: transaction.fee / transaction.amount,
          type: transaction.type,
          timestamp: transaction.timestamp?.toDate() || null
        });
      });
      
      return feeHistory;
    } catch (error) {
      console.error('Error fetching user fee history:', error);
      return [];
    }
  }
  
  /**
   * Get aggregated fee statistics for a user
   * 
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Fee statistics
   */
  export async function getUserFeeStatistics(userId) {
    try {
      if (!userId) {
        return {
          totalFees: 0,
          totalTransactions: 0,
          averageFeePercentage: 0
        };
      }
      
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef,
        where('userId', '==', userId),
        where('status', '==', 'completed')
      );
      
      const snapshot = await getDocs(q);
      
      let totalFees = 0;
      let totalTransactionAmount = 0;
      let totalTransactions = 0;
      
      snapshot.forEach(doc => {
        const transaction = doc.data();
        if (transaction.fee && transaction.amount) {
          totalFees += transaction.fee;
          totalTransactionAmount += transaction.amount;
          totalTransactions++;
        }
      });
      
      const averageFeePercentage = totalTransactionAmount > 0 
        ? (totalFees / totalTransactionAmount) 
        : 0;
      
      return {
        totalFees,
        totalTransactions,
        totalTransactionAmount,
        averageFeePercentage
      };
    } catch (error) {
      console.error('Error calculating user fee statistics:', error);
      return {
        totalFees: 0,
        totalTransactions: 0,
        averageFeePercentage: 0
      };
    }
  }
  
  /**
   * Apply a special fee configuration for a user
   * 
   * @param {string} userId - User ID
   * @param {Object} feeConfig - Custom fee configuration
   * @returns {Promise<boolean>} - Success status
   */
  export async function applyCustomFeeConfiguration(userId, feeConfig) {
    try {
      if (!userId || !feeConfig) {
        return false;
      }
      
      // Validate fee configuration
      if (feeConfig.discountRate !== undefined && (feeConfig.discountRate < 0 || feeConfig.discountRate > 1)) {
        throw new Error('Discount rate must be between 0 and 1');
      }
      
      // Update user's fee settings
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'feeSettings': feeConfig,
        'feeSettings.updatedAt': serverTimestamp(),
        'feeSettings.updatedBy': 'system' // This should be the admin user's ID in practice
      });
      
      return true;
    } catch (error) {
      console.error('Error applying custom fee configuration:', error);
      return false;
    }
  }