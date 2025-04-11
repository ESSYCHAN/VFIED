// src/pages/api/payments/job-posting.js
import { db } from '../../../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

// For testing purposes, mock the payment intent creation
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { requisitionId, amount } = req.body;
    
    if (!requisitionId) {
      return res.status(400).json({ error: 'Requisition ID is required' });
    }

    // In a real implementation, you would call Stripe API here
    // For now, we'll mock a successful payment intent
    const mockPaymentIntent = {
      id: 'mock_payment_' + Date.now(),
      amount: amount || 5000,
      currency: 'usd',
      status: 'requires_payment_method',
      client_secret: 'mock_secret_' + Math.random().toString(36).substring(2, 15),
      requisitionId
    };

    // Update the requisition with payment intent info
    const requisitionRef = doc(db, 'requisitions', requisitionId);
    await updateDoc(requisitionRef, {
      paymentIntentId: mockPaymentIntent.id,
      paymentStatus: 'pending',
      updatedAt: serverTimestamp()
    });
    
    res.status(200).json(mockPaymentIntent);
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent: ' + error.message });
  }
}