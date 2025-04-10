// frontend/src/pages/credentials/verify.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import VerificationPayment from '../../components/credentials/VerificationPayment';
import Layout from '@/components/Layout';
import Head from 'next/head';
import Link from 'next/link';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

export default function VerifyCredential() {
  const router = useRouter();
  const { id: credentialId } = router.query;
  const { currentUser } = useAuth();
  const [credential, setCredential] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [verificationFee, setVerificationFee] = useState(1500); // $15.00 in cents

  // Fetch credential data
  useEffect(() => {
    if (!credentialId || !currentUser) return;

    const fetchCredential = async () => {
      try {
        setLoading(true);
        
        const credentialRef = doc(db, 'credentials', credentialId);
        const credentialDoc = await getDoc(credentialRef);

        if (!credentialDoc.exists()) {
          setError('Credential not found');
          return;
        }

        const credentialData = credentialDoc.data();
        
        // Check if credential belongs to current user
        if (credentialData.userId !== currentUser.uid) {
          setError('You do not have permission to verify this credential');
          return;
        }
        
        // Check if credential is already in verification process
        if (credentialData.verificationStatus && 
            ['pending', 'inProgress', 'verified'].includes(credentialData.verificationStatus)) {
          setError(`This credential is already in ${credentialData.verificationStatus} status`);
          return;
        }
        
        setCredential({
          id: credentialDoc.id,
          ...credentialData
        });
        
        // Check if user is premium to determine if they need to pay
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // If user has a premium subscription, no verification fee
          if (userData.subscription && 
              userData.subscription.status === 'active' && 
              userData.subscription.plan !== 'free') {
            setVerificationFee(0); // No fee for premium users
          }
        }
        
        setError('');
      } catch (err) {
        console.error('Error fetching credential:', err);
        setError('Failed to load credential: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCredential();
  }, [credentialId, currentUser]);

  // Submit verification request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to submit a verification request');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // If payment is required, show payment UI
      if (verificationFee > 0) {
        setShowPayment(true);
        setSubmitting(false);
        return;
      }
      
      // For premium users (no fee), proceed with verification request
      await processVerificationRequest();
    } catch (err) {
      console.error('Error submitting verification request:', err);
      setError('Failed to submit verification request: ' + err.message);
      setSubmitting(false);
    }
  };

  // Process verification request after payment or for premium users
  const processVerificationRequest = async () => {
    try {
      setSubmitting(true);
      
      // First, check if user has free credits to use
      const token = await currentUser.getIdToken();
      const creditCheckResponse = await fetch('/api/credits/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          creditType: 'verification',
          resourceId: credentialId
        })
      });
      
      const creditCheckResult = await creditCheckResponse.json();
      
      // If user has credits, use one
      if (creditCheckResult.hasCredits) {
        const useCreditResponse = await fetch('/api/credits/use', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            creditType: 'verification',
            resourceId: credentialId
          })
        });
        
        const useCreditResult = await useCreditResponse.json();
        
        if (useCreditResult.success) {
          // Credit was used, proceed with verification without payment
          // Rest of your verification request code...
          return;
        }
      }
      
      // If we got here, either no credits or credit use failed
      // Proceed with payment as normal
      if (verificationFee > 0) {
        setShowPayment(true);
        setSubmitting(false);
        return;
      }
      
      // Continue with the rest of your code...
    } catch (error) {
      console.error('Error processing verification:', error);
      setError('An error occurred: ' + error.message);
      setSubmitting(false);
    }
  };

  // Handle successful payment
  const handlePaymentComplete = async (paymentIntent) => {
    try {
      // Process verification request after successful payment
      await processVerificationRequest();
    } catch (err) {
      console.error('Error after payment:', err);
      setError('Payment successful but failed to process verification. Please contact support.');
      setSubmitting(false);
    }
  };

  // Handle payment error
  const handlePaymentError = (err) => {
    setError('Payment failed: ' + err.message);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  // Format credential type for display
  const formatCredentialType = (type) => {
    if (!type) return 'Document';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Layout>
      <Head>
        <title>Verify Credential - VFied</title>
      </Head>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Link href={`/credentials/${credentialId}`} className="text-indigo-600 hover:text-indigo-900">
            &larr; Back to Credential
          </Link>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              Request Credential Verification
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Submit your credential for verification to increase its credibility.
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 my-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {credential && (
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Credential Title</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{credential.title}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatCredentialType(credential.type)}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Issuer</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{credential.issuer || 'Not specified'}</dd>
                </div>
                
                {credential.documentUrl ? (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Document</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <a 
                        href={credential.documentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View uploaded document
                      </a>
                    </dd>
                  </div>
                ) : (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Document</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <span className="text-yellow-600">No document uploaded</span>
                      <p className="text-sm text-gray-500 mt-1">
                        It's recommended to upload supporting documentation to improve verification chances.
                      </p>
                      <Link 
                        href={`/credentials/${credentialId}`}
                        className="text-indigo-600 hover:text-indigo-900 text-sm mt-2 inline-block"
                      >
                        Go back to add a document
                      </Link>
                    </dd>
                  </div>
                )}
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Additional Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <textarea
                      rows="4"
                      placeholder="Add any additional information that might help the verification team (optional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    ></textarea>
                  </dd>
                </div>
                
                {!showPayment ? (
                  <div className="bg-white px-4 py-5 sm:px-6">
                    <div className="flex justify-between items-center">
                      <div>
                        {verificationFee > 0 ? (
                          <span className="text-sm text-gray-500">
                            Verification fee: ${(verificationFee / 100).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-sm text-green-600 font-medium">
                            No fee (Premium subscription benefit)
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleSubmitRequest}
                        disabled={submitting}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {submitting ? 'Processing...' : 'Submit for Verification'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-5 sm:px-6">
                    <Elements stripe={stripePromise}>
                      <VerificationPayment
                        credentialId={credentialId}
                        onPaymentComplete={handlePaymentComplete}
                        onPaymentError={handlePaymentError}
                      />
                    </Elements>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}