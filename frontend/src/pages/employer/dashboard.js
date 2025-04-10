// src/pages/employer/dashboard.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '../../components/employer/PaymentForm';
import Link from 'next/link';
import Head from 'next/head';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || '');

export default function EmployerDashboard() {
  const { currentUser, userRole } = useAuth();
  const [requisitions, setRequisitions] = useState([]);
  const [stats, setStats] = useState({
    active: 0,
    draft: 0,
    closed: 0,
    total: 0
  });
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not an employer
  useEffect(() => {
    if (!loading && userRole !== 'employer') {
      window.location.href = '/dashboard';
    }
  }, [userRole, loading]);

  // Fetch employer's requisitions
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    
    try {
      const q = query(
        collection(db, 'requisitions'),
        where('employerId', '==', currentUser.uid)
      );
      
      // Use onSnapshot for real-time updates
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const reqList = [];
        let activeCount = 0;
        let draftCount = 0;
        let closedCount = 0;
        
        snapshot.forEach(doc => {
          const req = { id: doc.id, ...doc.data() };
          reqList.push(req);
          
          // Update stats based on status
          if (req.status === 'active') activeCount++;
          else if (req.status === 'draft') draftCount++;
          else if (req.status === 'closed') closedCount++;
        });
        
        // Update state
        setRequisitions(reqList);
        setStats({
          active: activeCount,
          draft: draftCount,
          closed: closedCount,
          total: reqList.length
        });
        
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
      setError(`Payment error: ${err.message}`);
    }
  };

  return (
    <DashboardLayout title="Employer Dashboard">
      <Head>
        <title>Employer Dashboard - VFied</title>
      </Head>
      
      <div className="p-6 max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            Error: {error}
          </div>
        )}
        
        {/* Stats section */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Job Posts</dt>
                    <dd>
                      <div className="text-lg font-medium text-indigo-600">{stats.total}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Jobs</dt>
                    <dd>
                      <div className="text-lg font-medium text-green-600">{stats.active}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Draft Jobs</dt>
                    <dd>
                      <div className="text-lg font-medium text-yellow-600">{stats.draft}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gray-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Closed Jobs</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-600">{stats.closed}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Job Postings</h2>
          <Link 
            href="/requisitions/new" 
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Post New Job
          </Link>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading job listings...</p>
            </div>
          ) : requisitions.length > 0 ? (
            <div className="space-y-4">
              {requisitions.map(req => (
                <div key={req.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{req.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      req.status === 'active' ? 'bg-green-100 text-green-800' :
                      req.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {req.status || 'Draft'}
                    </span>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-1">
                    {req.requiredSkills && req.requiredSkills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Candidates: {req.candidates?.length || 0}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {!req.paid && req.status !== 'active' && (
                        <button 
                          onClick={() => createPayment(req.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Pay to Publish
                        </button>
                      )}
                      
                      <Link 
                        href={`/requisitions/${req.id}`}
                        className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-sm hover:bg-indigo-200"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                  
                  {paymentIntent?.requisitionId === req.id && (
                    <div className="mt-3 p-3 border rounded">
                      <Elements stripe={stripePromise}>
                        <PaymentForm intent={paymentIntent} />
                      </Elements>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                ></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No job postings found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first job posting.</p>
              <div className="mt-6">
                <Link 
                  href="/requisitions/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Post New Job
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Revenue Insights Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Subscription & Usage</h2>
          <div className="border-t border-gray-200 pt-4">
            <div className="bg-indigo-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Current Plan</h3>
                <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">Active</span>
              </div>
              <p className="text-gray-700 font-medium text-xl">Basic Employer</p>
              <p className="text-gray-500 text-sm">$50/month - Up to 5 active job postings</p>
              
              <div className="mt-4">
                <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">
                  Upgrade Plan
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium mb-2">Usage This Month</h3>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-500">Job Postings</span>
                  <span className="text-sm font-medium">{stats.total}/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${Math.min((stats.total / 5) * 100, 100)}%` }}></div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium mb-2">Next Billing</h3>
                <p className="text-gray-700">May 15, 2025</p>
                <p className="text-sm text-gray-500">$50.00 USD</p>
                <button className="mt-2 text-sm text-indigo-600 font-medium hover:text-indigo-800">
                  View Billing History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}