// frontend/src/components/credentials/VerificationPayment.js
import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { createVerificationPayment } from '../../services/paymentService';

const VerificationPayment = ({ credentialId, onPaymentComplete, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create payment intent
      const paymentIntent = await createVerificationPayment(credentialId);
      
      // Confirm card payment
      const result = await stripe.confirmCardPayment(paymentIntent.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: 'VFied User',
          },
        },
      });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      if (result.paymentIntent.status === 'succeeded') {
        onPaymentComplete(result.paymentIntent);
      } else {
        throw new Error('Payment failed to complete. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message);
      onPaymentError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4">Verification Fee</h3>
      <p className="mb-4 text-sm text-gray-600">
        A one-time fee of $15 is required to verify this credential. 
        Our team will review your documentation and confirm its authenticity.
      </p>
      
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="border border-gray-300 rounded-md p-3">
            <CardElement 
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading || !stripe}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            loading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Processing Payment...' : 'Pay Verification Fee ($15)'}
        </button>
      </form>
    </div>
  );
};

export default VerificationPayment;