const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    // 1. Create PaymentIntent
    const intent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: 'usd',
      metadata: { requisitionId: req.body.requisitionId }
    });

    // 2. Log in Firestore
    await admin.firestore().collection('payment_intents').doc(intent.id).set({
      requisitionId: req.body.requisitionId,
      amount: req.body.amount,
      status: 'created'
    });

    res.status(200).json({
      client_secret: intent.client_secret,
      amount: intent.amount,
      requisitionId: req.body.requisitionId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}