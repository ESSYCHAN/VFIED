// server/services/creditService.js
const { db, admin } = require('../firebase/admin');

/**
 * Create initial free credits for a new user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function createInitialCredits(userId) {
  try {
    // Create a credits document for the user
    await db.collection('user_credits').doc(userId).set({
      verificationCredits: 1,  // One free verification
      postingCredits: 0,       // No free job postings initially
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Create a credit history entry
    await db.collection('credit_history').add({
      userId: userId,
      creditType: 'verification',
      amount: 1,
      reason: 'new_user_bonus',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating initial credits:', error);
    throw error;
  }
}

/**
 * Check if a user has available credits
 * @param {string} userId - User ID
 * @param {string} creditType - Credit type ('verification' or 'posting')
 * @returns {Promise<boolean>} - Whether user has available credits
 */
async function hasAvailableCredits(userId, creditType) {
  try {
    const creditsDoc = await db.collection('user_credits').doc(userId).get();
    
    if (!creditsDoc.exists) {
      return false;
    }
    
    const credits = creditsDoc.data();
    
    if (creditType === 'verification') {
      return credits.verificationCredits > 0;
    } else if (creditType === 'posting') {
      return credits.postingCredits > 0;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking credits:', error);
    return false;
  }
}

/**
 * Use a credit for a service
 * @param {string} userId - User ID
 * @param {string} creditType - Credit type ('verification' or 'posting')
 * @param {string} resourceId - ID of resource (credential or requisition)
 * @returns {Promise<boolean>} - Whether credit was successfully used
 */
async function useCredit(userId, creditType, resourceId) {
  try {
    // Check if user has available credits
    const hasCredits = await hasAvailableCredits(userId, creditType);
    
    if (!hasCredits) {
      return false;
    }
    
    // Get a reference to the user's credits document
    const creditsRef = db.collection('user_credits').doc(userId);
    
    // Start a transaction
    await db.runTransaction(async (transaction) => {
      const creditsDoc = await transaction.get(creditsRef);
      
      if (!creditsDoc.exists) {
        throw new Error('User credits not found');
      }
      
      const credits = creditsDoc.data();
      
      // Determine which credit type to decrement
      if (creditType === 'verification') {
        if (credits.verificationCredits <= 0) {
          throw new Error('No verification credits available');
        }
        
        transaction.update(creditsRef, {
          verificationCredits: admin.firestore.FieldValue.increment(-1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } else if (creditType === 'posting') {
        if (credits.postingCredits <= 0) {
          throw new Error('No posting credits available');
        }
        
        transaction.update(creditsRef, {
          postingCredits: admin.firestore.FieldValue.increment(-1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        throw new Error('Invalid credit type');
      }
      
      // Create a credit history entry
      const historyRef = db.collection('credit_history').doc();
      transaction.set(historyRef, {
        userId: userId,
        creditType: creditType,
        resourceId: resourceId,
        amount: -1,
        reason: 'service_usage',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    return true;
  } catch (error) {
    console.error('Error using credit:', error);
    return false;
  }
}

/**
 * Award credits to a user (for promotions, referrals, etc.)
 * @param {string} userId - User ID
 * @param {string} creditType - Credit type ('verification' or 'posting')
 * @param {number} amount - Number of credits to award
 * @param {string} reason - Reason for awarding credits
 * @returns {Promise<boolean>} - Whether credits were successfully awarded
 */
async function awardCredits(userId, creditType, amount, reason) {
  try {
    if (amount <= 0) {
      throw new Error('Credit amount must be positive');
    }
    
    // Get a reference to the user's credits document
    const creditsRef = db.collection('user_credits').doc(userId);
    
    // Check if user has a credits document
    const creditsDoc = await creditsRef.get();
    
    if (!creditsDoc.exists) {
      // Create a new credits document if none exists
      await creditsRef.set({
        verificationCredits: creditType === 'verification' ? amount : 0,
        postingCredits: creditType === 'posting' ? amount : 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      // Update existing credits document
      const updateData = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      if (creditType === 'verification') {
        updateData.verificationCredits = admin.firestore.FieldValue.increment(amount);
      } else if (creditType === 'posting') {
        updateData.postingCredits = admin.firestore.FieldValue.increment(amount);
      }
      
      await creditsRef.update(updateData);
    }
    
    // Create a credit history entry
    await db.collection('credit_history').add({
      userId: userId,
      creditType: creditType,
      amount: amount,
      reason: reason,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error awarding credits:', error);
    return false;
  }
}

module.exports = {
  createInitialCredits,
  hasAvailableCredits,
  useCredit,
  awardCredits
};