// frontend/src/pages/api/payments/send-receipt.js
import { sendPaymentReceipt } from '../../../lib/emailService';
import { adminDb, adminAuth } from '../../../lib/firebase/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { userId, paymentId } = req.body;
    
    if (!userId || !paymentId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Get user data
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get payment data
    const paymentDoc = await adminDb.collection('transactions').doc(paymentId).get();
    if (!paymentDoc.exists) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    const user = userDoc.data();
    const payment = {
      id: paymentId,
      ...paymentDoc.data()
    };
    
    // Send receipt
    await sendPaymentReceipt(user, payment);
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending receipt:', error);
    return res.status(500).json({ error: 'Failed to send receipt' });
  }
}