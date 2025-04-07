// pages/api/stripe/webhook.js
import Stripe from 'stripe';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method not allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        // Update Firestore when payment succeeds
        try {
          await updateDoc(doc(db, 'requisitions', session.client_reference_id), {
            'payment.status': 'paid',
            'payment.paidAt': new Date(),
            'payment.receiptUrl': session.receipt_url,
            status: 'active'
          });
        } catch (error) {
          console.error('Error updating document:', error);
        }
        break;

      case 'checkout.session.expired':
        const expiredSession = event.data.object;
        try {
          await updateDoc(doc(db, 'requisitions', expiredSession.client_reference_id), {
            'payment.status': 'expired'
          });
        } catch (error) {
          console.error('Error updating document:', error);
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}