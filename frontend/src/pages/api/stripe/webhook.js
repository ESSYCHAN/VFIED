import { buffer } from 'micro';
import { getFirestore } from 'firebase-admin/firestore';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = getFirestore();

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      await buffer(req),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const payment = event.data.object;
    await db.collection('payments').doc(payment.id).set({
      employerId: payment.metadata.userId,
      amount: payment.amount,
      currency: payment.currency,
      status: 'completed',
      timestamp: new Date()
    });
  }

  res.json({ received: true });
}