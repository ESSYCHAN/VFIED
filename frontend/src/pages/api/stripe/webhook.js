// pages/api/stripe/webhook.js
import Stripe from 'stripe';
import { buffer } from 'micro';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  collection, 
  addDoc, 
  setDoc, 
  increment,
  runTransaction
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { sendPaymentReceipt } from '../../../lib/emailService';
import { generateReceipt } from '../../../services/receiptGeneratorService';
import { calculateTransactionFee } from '../../../services/feeCalculationService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Disable body parser to get raw request body
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // Get the raw request body for signature verification
    const rawBody = await buffer(req);
    const signature = req.headers['stripe-signature'];

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Process based on event type
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
        
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
        
      case 'subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
        
      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return success response
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    const { id, metadata, amount, currency } = paymentIntent;
    const { type, userId, employerId, requisitionId, credentialId, candidateId } = metadata;
    
    // Get the payment intent document from Firestore
    const paymentIntentRef = doc(db, 'payment_intents', id);
    const paymentIntentDoc = await getDoc(paymentIntentRef);
    
    // If already processed, avoid duplicate processing
    if (paymentIntentDoc.exists() && paymentIntentDoc.data().status === 'succeeded') {
      console.log(`Payment ${id} already processed`);
      return;
    }
    
    // Calculate transaction fee
    const fee = await calculateTransactionFee(type, amount, userId || employerId);
    const netAmount = amount - fee;
    
    // Run as a transaction to ensure data consistency
    await runTransaction(db, async (transaction) => {
      // Update payment intent status
      transaction.set(paymentIntentRef, {
        status: 'succeeded',
        processedAt: serverTimestamp(),
        fee,
        netAmount
      }, { merge: true });
      
      // Create transaction record
      const transactionRef = doc(collection(db, 'transactions'));
      transaction.set(transactionRef, {
        paymentIntentId: id,
        userId: userId || employerId,
        amount,
        fee,
        netAmount,
        currency,
        type,
        status: 'completed',
        timestamp: serverTimestamp(),
        metadata: {
          requisitionId,
          credentialId,
          candidateId
        }
      });
      
      // Process based on payment type
      switch (type) {
        case 'job_posting_fee':
          await processJobPostingPayment(transaction, requisitionId, employerId);
          break;
          
        case 'verification_fee':
          await processVerificationPayment(transaction, credentialId, userId);
          break;
          
        case 'hire_success_fee':
          await processHireSuccessFee(transaction, requisitionId, employerId, candidateId);
          break;
      }
      
      // Update user's payment history
      const userRef = doc(db, 'users', userId || employerId);
      transaction.update(userRef, {
        paymentTotal: increment(amount),
        lastPayment: serverTimestamp(),
        paymentCount: increment(1)
      });
    });
    
    // Generate receipt
    const userRef = doc(db, 'users', userId || employerId);
    const userDoc = await getDoc(userRef);
    const user = userDoc.data();
    
    // Generate receipt PDF
    const receiptData = {
      id,
      type,
      amount,
      fee,
      netAmount,
      currency,
      timestamp: new Date(),
      user: {
        name: user.displayName || user.name || 'VFied User',
        email: user.email
      }
    };
    
    const receiptUrl = await generateReceipt(receiptData);
    
    // Update payment with receipt URL
    await updateDoc(paymentIntentRef, {
      receiptUrl
    });
    
    // Send receipt email
    if (user.email) {
      await sendPaymentReceipt(user, {
        id,
        type,
        amount,
        timestamp: new Date(),
        receiptUrl
      });
    }
    
    console.log(`Successfully processed payment ${id} of type ${type}`);
  } catch (error) {
    console.error('Error handling payment_intent.succeeded:', error);
    throw error;
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent) {
  try {
    const { id, metadata, last_payment_error } = paymentIntent;
    const { type, userId, employerId, requisitionId, credentialId } = metadata;
    
    // Update payment intent status
    const paymentIntentRef = doc(db, 'payment_intents', id);
    await updateDoc(paymentIntentRef, {
      status: 'failed',
      error: last_payment_error?.message || 'Payment failed',
      processedAt: serverTimestamp()
    });
    
    // Create failed transaction record
    await addDoc(collection(db, 'transactions'), {
      paymentIntentId: id,
      userId: userId || employerId,
      type,
      status: 'failed',
      error: last_payment_error?.message || 'Payment failed',
      timestamp: serverTimestamp(),
      metadata: {
        requisitionId,
        credentialId
      }
    });
    
    // Update status based on payment type
    switch (type) {
      case 'job_posting_fee':
        if (requisitionId) {
          const requisitionRef = doc(db, 'requisitions', requisitionId);
          await updateDoc(requisitionRef, {
            paymentStatus: 'failed',
            updatedAt: serverTimestamp()
          });
        }
        break;
        
      case 'verification_fee':
        if (credentialId) {
          const credentialRef = doc(db, 'credentials', credentialId);
          await updateDoc(credentialRef, {
            paymentStatus: 'failed',
            updatedAt: serverTimestamp()
          });
        }
        break;
    }
    
    console.log(`Marked payment ${id} as failed`);
  } catch (error) {
    console.error('Error handling payment_intent.payment_failed:', error);
    throw error;
  }
}

/**
 * Handle completed checkout session
 */
async function handleCheckoutSessionCompleted(session) {
  try {
    const { customer, metadata, subscription, amount_total } = session;
    const { userId, plan, planType } = metadata;
    
    if (subscription) {
      // This is a subscription, will be handled by subscription events
      console.log(`Checkout completed for subscription: ${subscription}`);
      return;
    }
    
    if (!userId) {
      console.error('No userId in session metadata');
      return;
    }
    
    // For one-time payments
    await addDoc(collection(db, 'transactions'), {
      userId,
      amount: amount_total,
      status: 'completed',
      type: 'one_time_payment',
      timestamp: serverTimestamp(),
      metadata: {
        checkoutSessionId: session.id,
        customerId: customer
      }
    });
    
    console.log(`Processed one-time payment for user ${userId}`);
  } catch (error) {
    console.error('Error handling checkout.session.completed:', error);
    throw error;
  }
}

/**
 * Handle subscription creation
 */
async function handleSubscriptionCreated(subscription) {
  try {
    const { id, customer, metadata, status, items, current_period_end } = subscription;
    const { userId } = metadata;
    
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }
    
    // Get the plan details
    const plan = items.data[0].price.product;
    const planId = items.data[0].price.id;
    
    // Get plan details from Stripe
    const product = await stripe.products.retrieve(plan);
    const planName = product.name;
    const planType = product.metadata.type || 'standard';
    
    // Update user's subscription
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'subscription.id': id,
      'subscription.status': status,
      'subscription.plan': planType,
      'subscription.planName': planName,
      'subscription.priceId': planId,
      'subscription.currentPeriodEnd': new Date(current_period_end * 1000),
      'subscription.updatedAt': serverTimestamp()
    });
    
    // Create subscription record
    await setDoc(doc(db, 'subscriptions', id), {
      userId,
      status,
      planType,
      planName,
      priceId: planId,
      customerId: customer,
      currentPeriodEnd: new Date(current_period_end * 1000),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log(`Subscription ${id} created for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription.created:', error);
    throw error;
  }
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription) {
  try {
    const { id, status, current_period_end, items } = subscription;
    
    // Get subscription from Firestore
    const subscriptionRef = doc(db, 'subscriptions', id);
    const subscriptionDoc = await getDoc(subscriptionRef);
    
    if (!subscriptionDoc.exists()) {
      console.error(`Subscription ${id} not found in Firestore`);
      return;
    }
    
    const { userId } = subscriptionDoc.data();
    
    // Get the plan details if available
    let planName = subscriptionDoc.data().planName;
    let planType = subscriptionDoc.data().planType;
    
    if (items?.data[0]?.price?.product) {
      const plan = items.data[0].price.product;
      const product = await stripe.products.retrieve(plan);
      planName = product.name;
      planType = product.metadata.type || planType;
    }
    
    // Update subscription record
    await updateDoc(subscriptionRef, {
      status,
      currentPeriodEnd: new Date(current_period_end * 1000),
      updatedAt: serverTimestamp()
    });
    
    // Update user's subscription
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'subscription.status': status,
      'subscription.currentPeriodEnd': new Date(current_period_end * 1000),
      'subscription.updatedAt': serverTimestamp()
    });
    
    console.log(`Subscription ${id} updated for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription.updated:', error);
    throw error;
  }
}

/**
 * Handle subscription deletion/cancellation
 */
async function handleSubscriptionDeleted(subscription) {
  try {
    const { id } = subscription;
    
    // Get subscription from Firestore
    const subscriptionRef = doc(db, 'subscriptions', id);
    const subscriptionDoc = await getDoc(subscriptionRef);
    
    if (!subscriptionDoc.exists()) {
      console.error(`Subscription ${id} not found in Firestore`);
      return;
    }
    
    const { userId } = subscriptionDoc.data();
    
    // Update subscription record
    await updateDoc(subscriptionRef, {
      status: 'canceled',
      updatedAt: serverTimestamp(),
      canceledAt: serverTimestamp()
    });
    
    // Update user's subscription
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'subscription.status': 'canceled',
      'subscription.updatedAt': serverTimestamp(),
      'subscription.canceledAt': serverTimestamp()
    });
    
    console.log(`Subscription ${id} canceled for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription.deleted:', error);
    throw error;
  }
}

/**
 * Process job posting payment
 */
async function processJobPostingPayment(transaction, requisitionId, employerId) {
  if (!requisitionId) return;
  
  const requisitionRef = doc(db, 'requisitions', requisitionId);
  const requisitionDoc = await getDoc(requisitionRef);
  
  if (!requisitionDoc.exists()) {
    console.error(`Requisition ${requisitionId} not found`);
    return;
  }
  
  // Update requisition status
  transaction.update(requisitionRef, {
    status: 'active',
    paymentStatus: 'completed',
    activatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  });
  
  // Update employer's job posting count
  const employerRef = doc(db, 'users', employerId);
  transaction.update(employerRef, {
    'stats.jobPostings': increment(1),
    updatedAt: serverTimestamp()
  });
}

/**
 * Process verification payment
 */
async function processVerificationPayment(transaction, credentialId, userId) {
  if (!credentialId) return;
  
  const credentialRef = doc(db, 'credentials', credentialId);
  const credentialDoc = await getDoc(credentialRef);
  
  if (!credentialDoc.exists()) {
    console.error(`Credential ${credentialId} not found`);
    return;
  }
  
  // Update credential payment status
  transaction.update(credentialRef, {
    paymentStatus: 'completed',
    verificationStatus: 'pending',
    updatedAt: serverTimestamp(),
    dateSubmitted: serverTimestamp()
  });
  
  // Create verification request
  const verificationRequestRef = doc(collection(db, 'verificationRequests'));
  transaction.set(verificationRequestRef, {
    credentialId,
    userId,
    credentialType: credentialDoc.data().type,
    credentialTitle: credentialDoc.data().title,
    credentialIssuer: credentialDoc.data().issuer,
    submissionDate: serverTimestamp(),
    status: 'pending',
    documentUrl: credentialDoc.data().documentUrl,
    timeline: [{
      status: 'submitted',
      date: serverTimestamp(),
      note: 'Verification payment received, request submitted'
    }]
  });
  
  // Update the credential with the verification request ID
  transaction.update(credentialRef, {
    verificationRequestId: verificationRequestRef.id
  });
}

/**
 * Process hire success fee
 */
async function processHireSuccessFee(transaction, requisitionId, employerId, candidateId) {
  if (!requisitionId || !candidateId) return;
  
  // Create hire record
  const hireRef = doc(collection(db, 'hires'));
  transaction.set(hireRef, {
    requisitionId,
    employerId,
    candidateId,
    status: 'completed',
    paymentStatus: 'completed',
    hireDate: serverTimestamp()
  });
  
  // Update requisition status
  const requisitionRef = doc(db, 'requisitions', requisitionId);
  transaction.update(requisitionRef, {
    status: 'filled',
    filledBy: candidateId,
    filledAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  // Update candidate status
  const candidateRef = doc(db, 'users', candidateId);
  transaction.update(candidateRef, {
    'stats.hires': increment(1),
    updatedAt: serverTimestamp()
  });
  
  // Update employer stats
  const employerRef = doc(db, 'users', employerId);
  transaction.update(employerRef, {
    'stats.hires': increment(1),
    updatedAt: serverTimestamp()
  });
}