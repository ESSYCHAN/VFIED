// server/services/subscriptionService.js
const { db } = require('../firebase/admin');

/**
 * Check if a user's subscription includes a specific feature
 * @param {string} userId - User ID
 * @param {string} feature - Feature to check ('job_posting', 'verification', 'candidate_search')
 * @returns {Promise<Object>} - Object with hasFeature and limits properties
 */
async function checkSubscriptionFeature(userId, feature) {
  try {
    // Get user's subscription
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return { hasFeature: false };
    }
    
    const userData = userDoc.data();
    
    // Check if user has an active subscription
    if (!userData.subscription || 
        userData.subscription.status !== 'active' ||
        !userData.subscription.plan) {
      return { hasFeature: false };
    }
    
    // Define feature limits by plan type
    const featureLimits = {
      // Employer plans
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
      'employer_enterprise': {
        job_posting: { included: true, limit: 999 },
        verification: { included: true, limit: 50 },
        candidate_search: { included: true, limit: 9999 }
      },
      
      // Recruiter plans
      'recruiter_essential': {
        job_posting: { included: true, limit: 10 },
        verification: { included: false },
        candidate_search: { included: true, limit: 200 }
      },
      'recruiter_professional': {
        job_posting: { included: true, limit: 30 },
        verification: { included: true, limit: 20 },
        candidate_search: { included: true, limit: 1000 }
      },
      'recruiter_agency': {
        job_posting: { included: true, limit: 999 },
        verification: { included: true, limit: 100 },
        candidate_search: { included: true, limit: 9999 }
      },
      
      // Candidate plans
      'candidate_free': {
        verification: { included: true, limit: 2 }
      },
      'candidate_premium': {
        verification: { included: true, limit: 10 }
      },
      'candidate_career_pro': {
        verification: { included: true, limit: 999 }
      }
    };
    
    const plan = userData.subscription.plan;
    
    // If plan doesn't exist or doesn't include this feature
    if (!featureLimits[plan] || !featureLimits[plan][feature]) {
      return { hasFeature: false };
    }
    
    const featureConfig = featureLimits[plan][feature];
    
    // If feature is not included in plan
    if (!featureConfig.included) {
      return { hasFeature: false };
    }
    
    // If we need to check usage against limits
    if (featureConfig.limit !== undefined) {
      // Get current usage for this feature
      const usageRef = db.collection('subscription_usage').doc(userId);
      const usageDoc = await usageRef.get();
      
      let currentUsage = 0;
      
      if (usageDoc.exists) {
        const usageData = usageDoc.data();
        currentUsage = usageData[`${feature}_count`] || 0;
      }
      
      // Check if user has reached their limit
      if (currentUsage >= featureConfig.limit) {
        return { 
          hasFeature: true, 
          withinLimit: false,
          used: currentUsage,
          limit: featureConfig.limit
        };
      }
      
      return { 
        hasFeature: true, 
        withinLimit: true,
        used: currentUsage,
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

/**
 * Increment usage count for a subscription feature
 * @param {string} userId - User ID
 * @param {string} feature - Feature being used
 * @returns {Promise<boolean>} - Whether increment was successful
 */
async function incrementFeatureUsage(userId, feature) {
  try {
    const usageRef = db.collection('subscription_usage').doc(userId);
    const usageDoc = await usageRef.get();
    
    const updateField = `${feature}_count`;
    
    if (!usageDoc.exists) {
      // Create new usage document
      const newUsage = {
        userId,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      };
      newUsage[updateField] = 1;
      
      await usageRef.set(newUsage);
    } else {
      // Update existing usage document
      const updateData = {
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      };
      updateData[updateField] = admin.firestore.FieldValue.increment(1);
      
      await usageRef.update(updateData);
    }
    
    return true;
  } catch (error) {
    console.error('Error incrementing feature usage:', error);
    return false;
  }
}

module.exports = {
  checkSubscriptionFeature,
  incrementFeatureUsage
};