// frontend/src/lib/creditService.js
import { doc, getDoc, updateDoc, collection, addDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Check if a user has available credits
 * @param {string} userId - User ID
 * @param {string} creditType - Credit type (verification or posting)
 * @returns {Promise<Object>} - Object with hasCredits and count properties
 */
export async function checkUserCredits(userId, creditType) {
  try {
    const creditsRef = doc(db, 'user_credits', userId);
    const creditsDoc = await getDoc(creditsRef);
    
    if (!creditsDoc.exists()) {
      return { hasCredits: false, count: 0 };
    }
    
    const credits = creditsDoc.data();
    
    if (creditType === 'verification') {
      return {
        hasCredits: credits.verificationCredits > 0,
        count: credits.verificationCredits || 0
      };
    } else if (creditType === 'posting') {
      return {
        hasCredits: credits.postingCredits > 0,
        count: credits.postingCredits || 0
      };
    }
    
    return { hasCredits: false, count: 0 };
  } catch (error) {
    console.error('Error checking credits:', error);
    throw error;
  }
}

/**
 * Use a credit
 * @param {string} userId - User ID
 * @param {string} creditType - Credit type (verification or posting)
 * @param {string} resourceId - ID of resource using the credit
 * @returns {Promise<boolean>} - Whether credit was successfully used
 */
export async function useCredit(userId, creditType, resourceId) {
  try {
    const creditsRef = doc(db, 'user_credits', userId);
    const creditsDoc = await getDoc(creditsRef);
    
    if (!creditsDoc.exists()) {
      return false;
    }
    
    const credits = creditsDoc.data();
    
    // Check if user has credits of this type
    if ((creditType === 'verification' && credits.verificationCredits <= 0) ||
        (creditType === 'posting' && credits.postingCredits <= 0)) {
      return false;
    }
    
    // Update credit count
    const updateData = {};
    if (creditType === 'verification') {
      updateData.verificationCredits = increment(-1);
    } else if (creditType === 'posting') {
      updateData.postingCredits = increment(-1);
    }
    
    await updateDoc(creditsRef, updateData);
    
    // Record credit usage
    await addDoc(collection(db, 'credit_usage'), {
      userId,
      creditType,
      resourceId,
      usedAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error using credit:', error);
    throw error;
  }
}