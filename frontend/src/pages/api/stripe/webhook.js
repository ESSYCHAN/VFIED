// src/pages/api/stripe/webhook.js
import Stripe from 'stripe';
import { buffer } from 'micro';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Disable body parsing, we need the raw body for webhook verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method not allowed');
  }
  
  try {
    // Get the raw body as a buffer
    const rawBody = await buffer(req);
    
    // Get the Stripe signature from headers
    const signature = req.headers['stripe-signature'];
    
    // Verify the webhook
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Process the event based on its type
    switch (event.type) {
      // Handle successful payments
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Update payment record in Firestore
        const paymentRef = doc(db, 'payments', session.id);
        const paymentDoc = await getDoc(paymentRef);
        
        if (paymentDoc.exists()) {
          await updateDoc(paymentRef, {
            status: 'completed',
            completedAt: serverTimestamp(),
            providerTransactionId: session.payment_intent || session.id
          });
          
          // If this is a job posting payment, update the requisition
          if (session.metadata.type === 'job_posting' && session.metadata.jobId) {
            const requisitionRef = doc(db, 'requisitions', session.metadata.jobId);
            const requisitionDoc = await getDoc(requisitionRef);
            
            if (requisitionDoc.exists()) {
              await updateDoc(requisitionRef, {
                'payment.status': 'completed',
                'payment.completedAt': serverTimestamp(),
                'paid': true,
                'status': 'active', // Automatically activate the job posting
                updatedAt: serverTimestamp()
              });
            }
          }
          
          // If this is a credential verification payment, update the credential
          if (session.metadata.type === 'verification' && session.metadata.credentialId) {
            const credentialRef = doc(db, 'credentials', session.metadata.credentialId);
            const credentialDoc = await getDoc(credentialRef);
            
            if (credentialDoc.exists()) {
              await updateDoc(credentialRef, {
                'payment.status': 'completed',
                'payment.completedAt': serverTimestamp(),
                'paid': true,
                updatedAt: serverTimestamp()
              });
            }
          }
          
          // If this is a subscription payment, create or update subscription record
          if (session.metadata.type === 'subscription' && session.subscription) {
            // Retrieve the subscription details from Stripe
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            
            // Update the subscription in Firestore
            const subscriptionRef = doc(db, 'subscriptions', subscription.id);
            await updateDoc(subscriptionRef, {
              status: subscription.status,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              updatedAt: serverTimestamp()
            });
          }
        }
        
        break;
      }
      
      // Handle failed payments
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object;
        
        // Update payment record in Firestore
        const paymentRef = doc(db, 'payments', session.id);
        const paymentDoc = await getDoc(paymentRef);
        
        if (paymentDoc.exists()) {
          await updateDoc(paymentRef, {
            status: 'failed',
            updatedAt: serverTimestamp()
          });
          
          // If this is a job posting payment, update the requisition
          if (session.metadata.type === 'job_posting' && session.metadata.jobId) {
            const requisitionRef = doc(db, 'requisitions', session.metadata.jobId);
            await updateDoc(requisitionRef, {
              'payment.status': 'failed',
              updatedAt: serverTimestamp()
            });
          }
        }
        
        break;
      }
      
      // Handle subscription events
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        // Update subscription in Firestore
        const subscriptionRef = doc(db, 'subscriptions', subscription.id);
        const subscriptionDoc = await getDoc(subscriptionRef);
        
        const subscriptionData = {
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          updatedAt: serverTimestamp()
        };
        
        if (subscriptionDoc.exists()) {
          await updateDoc(subscriptionRef, subscriptionData);
        }
        
        break;
      }
      
      // Handle subscription cancellations
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Update subscription in Firestore
        const subscriptionRef = doc(db, 'subscriptions', subscription.id);
        const subscriptionDoc = await getDoc(subscriptionRef);
        
        if (subscriptionDoc.exists()) {
          await updateDoc(subscriptionRef, {
            status: 'canceled',
            canceledAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        
        break;
      }
      
      // Handle other events
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    // Return success response
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}