// src/pages/api/stripe/create-checkout.js
import Stripe from 'stripe';
import { doc, updateDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { verifyAuth } from '../../../lib/auth-helpers';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ 
      error: 'Method Not Allowed',
      message: 'Only POST requests are accepted' 
    });
  }

  try {
    // Verify authentication
    const { userId } = await verifyAuth(req);
    
    // Validate request body
    const { jobId, amount, type = 'job_posting' } = req.body;
    
    if (!jobId || !amount) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required parameters in request body'
      });
    }
    
    // Get job information to use in the checkout description
    const requisitionRef = doc(db, 'requisitions', jobId);
    const requisitionDoc = await getDoc(requisitionRef);
    
    if (!requisitionDoc.exists()) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Job requisition not found'
      });
    }
    
    const requisitionData = requisitionDoc.data();
    
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Job Posting Publication',
            description: `30-day premium job listing: ${requisitionData.title}`
          },
          unit_amount: amount, // Amount in cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin}/employer/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/employer/dashboard?payment=canceled`,
      client_reference_id: jobId,
      metadata: {
        userId,
        jobId,
        type
      }
    });

    // Create a payment record in Firestore
    const paymentRef = doc(db, 'payments', session.id);
    await setDoc(paymentRef, {
      userId,
      amount,
      currency: 'usd',
      status: 'pending',
      type,
      provider: 'stripe',
      providerTransactionId: session.id,
      metadata: {
        requisitionId: jobId
      },
      createdAt: serverTimestamp()
    });

    // Update the requisition with payment information
    await updateDoc(requisitionRef, {
      'payment': {
        status: 'pending',
        sessionId: session.id,
        amount,
        currency: 'usd',
        createdAt: serverTimestamp()
      },
      updatedAt: serverTimestamp()
    });

    return res.status(200).json({
      success: true,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to create checkout session'
    });
  }
}