import Stripe from 'stripe';
import { getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../../lib/firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
        await updateDoc(doc(db, 'requisitions', session.client_reference_id), {
          'payment.status': 'paid',
          'payment.paidAt': new Date(),
          'payment.receiptUrl': session.receipt_url,
          status: 'active'
        });
        break;

      case 'checkout.session.expired':
        const expiredSession = event.data.object;
        await updateDoc(doc(db, 'requisitions', expiredSession.client_reference_id), {
          'payment.status': 'expired'
        });
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