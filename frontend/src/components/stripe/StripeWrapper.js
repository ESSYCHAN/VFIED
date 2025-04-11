// Create a new file src/components/stripe/StripeWrapper.js
import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

export default function StripeWrapper({ children }) {
  const [stripePromise, setStripePromise] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_STRIPE_KEY;
    if (key) {
      const promise = loadStripe(key);
      setStripePromise(promise);
      setLoaded(true);
    } else {
      console.error('Stripe key not found in environment variables');
    }
  }, []);

  if (!loaded) {
    return <div>Loading payment system...</div>;
  }

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}