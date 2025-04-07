// pages/api/stripe/create-checkout.js
import Stripe from 'stripe';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { auth, db } from '../../../lib/firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ 
      error: 'Method Not Allowed',
      message: 'Only POST requests are accepted' 
    });
  }

  // Validate request body
  const { jobId, userId } = req.body;
  if (!jobId || !userId) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Missing jobId or userId in request body'
    });
  }

  try {
    // Verify user authentication
    // This is a server-side API, so we can't use client-side auth
    // Instead, use Firebase Admin SDK or JWT verification
    // For now, we'll skip this step
    
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Job Posting Publication',
            description: '30-day premium job listing'
          },
          unit_amount: 9900, // $99.00 in cents
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
        type: 'job_posting'
      }
    });

    // Update Firestore document
    // Note: This should be moved to a webhook handler for production
    try {
      await updateDoc(doc(db, 'requisitions', jobId), {
        payment: {
          status: 'pending',
          sessionId: session.id,
          amount: 9900,
          currency: 'usd',
          createdAt: new Date().toISOString()
        },
        lastUpdated: new Date().toISOString()
      });
    } catch (dbError) {
      console.error('Error updating Firestore:', dbError);
      // Continue even if Firestore update fails
    }

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