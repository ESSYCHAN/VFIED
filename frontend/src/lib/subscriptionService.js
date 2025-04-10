// frontend/src/lib/subscriptionService.js
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Define subscription plans and their features
const SUBSCRIPTION_FEATURES = {
  'employer_basic': {
    job_posting: { included: true, limit: 5 },
    verification: { included: false },
    candidate_search: { included: true, limit: 100 }
  },
  'employer_growth': {
    job_posting: { included: true, limit: 20 },
    verification: { included: false },
    candidate_search: { included: true, limit: 500 }
  },
  // Add other plan definitions...
};

/**
 * Check if a feature is included in a user's subscription
 * @param {string} userId - User ID
 * @param {string} feature - Feature to check (job_posting, verification, etc.)
 * @returns {Promise<Object>} - Object with feature availability info
 */
export async function checkSubscriptionFeature(userId, feature) {
  try {
    // Get user's subscription info
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return { hasFeature: false };
    }
    
    const userData = userDoc.data();
    
    // Check if user has an active subscription
    if (!userData.subscription || 
        userData.subscription.status !== 'active' ||
        !userData.subscription.plan) {
      return { hasFeature: false };
    }
    
    const plan = userData.subscription.plan;
    
    // Check if plan includes this feature
    if (!SUBSCRIPTION_FEATURES[plan] || !SUBSCRIPTION_FEATURES[plan][feature]) {
      return { hasFeature: false };
    }
    
    const featureConfig = SUBSCRIPTION_FEATURES[plan][feature];
    
    // If feature is not included in plan
    if (!featureConfig.included) {
      return { hasFeature: false };
    }
    
    // If feature has usage limits, check current usage
    if (featureConfig.limit !== undefined) {
      // Get current month's start date
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      // Query for usage this month
      let usageCount = 0;
      
      if (feature === 'job_posting') {
        const jobsQuery = query(
          collection(db, 'requisitions'),
          where('employerId', '==', userId),
          where('createdAt', '>=', startOfMonth),
          where('status', '!=', 'draft')
        );
        
        const jobsSnapshot = await getDocs(jobsQuery);
        usageCount = jobsSnapshot.size;
      } else if (feature === 'verification') {
        const verificationQuery = query(
          collection(db, 'verificationRequests'),
          where('userId', '==', userId),
          where('submissionDate', '>=', startOfMonth)
        );
        
        const verificationSnapshot = await getDocs(verificationQuery);
        usageCount = verificationSnapshot.size;
      }
      
      return {
        hasFeature: true,
        withinLimit: usageCount < featureConfig.limit,
        used: usageCount,
        limit: featureConfig.limit
      };
    }
    
    // Feature is included with no limits
    return { hasFeature: true, withinLimit: true };
  } catch (error) {
    console.error('Error checking subscription feature:', error);
    return { hasFeature: false, error: error.message };
  }
}