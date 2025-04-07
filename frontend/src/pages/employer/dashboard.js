// src/pages/employer/dashboard.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '@/components/employer/PaymentForm';
import PaymentHistory from '@/components/employer/PaymentHistory';
import RevenueChart from '@/components/employer/RevenueChart';
import ProtectedRoute from '@/components/ProtectedRoute';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

export default function EmployerDashboard() {
  const { currentUser } = useAuth();
  const { account } = useWeb3();
  const [requisitions, setRequisitions] = useState([]);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch employer's requisitions
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    
    try {
      const q = query(
        collection(db, 'requisitions'),
        where('employerId', '==', currentUser.uid)
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setRequisitions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }, (err) => {
        console.error("Error fetching requisitions:", err);
        setError(err.message);
        setLoading(false);
      });
      
      return unsubscribe;
    } catch (err) {
      console.error("Error setting up requisition listener:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [currentUser]);

  // Create payment intent
  const createPayment = async (reqId) => {
    try {
      const response = await fetch('/api/stripe/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          requisitionId: reqId,
          amount: 5000 // $50.00 in cents
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPaymentIntent(data);
    } catch (err) {
      console.error("Error creating payment intent:", err);
      alert(`Payment error: ${err.message}`);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['employer']}>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Employer Dashboard</h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            Error: {error}
          </div>
        )}
        
        <div className="mb-6">
          <Link 
            href="/jobs/new" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Post New Job
          </Link>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Job Postings</h2>
          
          {loading ? (
            <div className="p-4 text-center">Loading job listings...</div>
          ) : requisitions.length > 0 ? (
            <div className="space-y-4">
              {requisitions.map(req => (
                <div key={req.id} className="p-4 border rounded-lg">
                  <h3 className="font-medium">{req.title}</h3>
                  <p>Status: {req.status || 'Draft'}</p>
                  <p>Candidates: {req.candidates?.length || 0}</p>
                  
                  {!req.paid && (
                    <button 
                      onClick={() => createPayment(req.id)}
                      className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Pay to Publish
                    </button>
                  )}
                  
                  {paymentIntent?.requisitionId === req.id && (
                    <div className="mt-3 p-3 border rounded">
                      <Elements stripe={stripePromise}>
                        <PaymentForm intent={paymentIntent} />
                      </Elements>
                    </div>
                  )}
                  
                  <Link 
                    href={`/jobs/${req.id}`}
                    className="text-blue-600 hover:underline mt-2 inline-block ml-3"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p>No job postings found. Click "Post New Job" to get started.</p>
          )}
        </div>
        
        {/* Monetization Section */}
        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Billing & Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentUser && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <PaymentHistory userId={currentUser.uid} />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <RevenueChart userId={currentUser.uid} />
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}