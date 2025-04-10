// src/services/stripeService.js
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe with your publishable key
let stripePromise;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

/**
 * Create a checkout session for job posting payment
 * 
 * @param {Object} options Options for creating the checkout
 * @param {string} options.requisitionId ID of the job requisition
 * @param {string} options.userId ID of the user making the payment
 * @param {number} options.amount Amount in cents
 * @returns {Promise<Object>} The created checkout session
 */
export const createJobPostingCheckout = async ({ requisitionId, userId, amount = 9900 }) => {
  try {
    const response = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId: requisitionId,
        userId,
        amount,
        type: 'job_posting'
      }),
    });

    const { sessionId } = await response.json();
    const stripe = await getStripe();
    
    // Redirect to Stripe Checkout
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Create a checkout session for subscription payments
 * 
 * @param {Object} options Options for creating the checkout
 * @param {string} options.userId ID of the user making the payment
 * @param {string} options.plan Subscription plan (basic, premium, pro)
 * @param {string} options.userType Type of user (candidate, employer, recruiter)
 * @returns {Promise<Object>} The created checkout session
 */
export const createSubscriptionCheckout = async ({ userId, plan, userType }) => {
  try {
    const response = await fetch('/api/stripe/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        plan,
        userType
      }),
    });

    const { sessionId } = await response.json();
    const stripe = await getStripe();
    
    // Redirect to Stripe Checkout
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error creating subscription checkout:', error);
    throw error;
  }
};

/**
 * Create a payment intent for credential verification
 * 
 * @param {Object} options Options for creating the payment intent
 * @param {string} options.credentialId ID of the credential being verified
 * @param {string} options.userId ID of the user making the payment
 * @param {number} options.amount Amount in cents
 * @returns {Promise<Object>} The created payment intent
 */
export const createVerificationPaymentIntent = async ({ credentialId, userId, amount = 2500 }) => {
  try {
    const response = await fetch('/api/stripe/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        credentialId,
        userId,
        amount,
        type: 'verification'
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Get payment history for a user
 * 
 * @param {string} userId ID of the user
 * @returns {Promise<Array>} Array of payment objects
 */
export const getPaymentHistory = async (userId) => {
  try {
    const response = await fetch(`/api/stripe/payment-history?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return await response.json();
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};

/**
 * Get subscription details for a user
 * 
 * @param {string} userId ID of the user
 * @returns {Promise<Object>} Subscription details
 */
export const getSubscriptionDetails = async (userId) => {
  try {
    const response = await fetch(`/api/stripe/subscription?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return await response.json();
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    throw error;
  }
};

/**
 * Cancel subscription for a user
 * 
 * @param {string} subscriptionId ID of the subscription
 * @returns {Promise<Object>} Result of the cancellation
 */
export const cancelSubscription = async (subscriptionId) => {
  try {
    const response = await fetch('/api/stripe/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

export default {
  getStripe,
  createJobPostingCheckout,
  createSubscriptionCheckout,
  createVerificationPaymentIntent,
  getPaymentHistory,
  getSubscriptionDetails,
  cancelSubscription
};