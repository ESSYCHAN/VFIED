// src/pages/subscription.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layouts/DashboardLayout';
import SubscriptionPlans from '../components/subscription/SubscriptionPlans';
import RouteGuard from '../components/RouteGuard';
import { getSubscriptionDetails } from '../services/stripeService';

export default function SubscriptionPage() {
  const router = useRouter();
  const { currentUser, userRole } = useAuth();
  const [userType, setUserType] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [error, setError] = useState(null);
  
  // Determine user type for subscription plans
  useEffect(() => {
    if (userRole) {
      // Map user role to subscription user type
      switch (userRole) {
        case 'employer':
          setUserType('employer');
          break;
        case 'recruiter':
          setUserType('recruiter');
          break;
        default:
          setUserType('candidate');
      }
    }
  }, [userRole]);
  
  // Fetch current subscription details
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const subscription = await getSubscriptionDetails(currentUser.uid);
        setCurrentSubscription(subscription);
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setError('Failed to load subscription details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscription();
  }, [currentUser]);
  
  return (
    <RouteGuard requireAuth={true}>
      <DashboardLayout title="Subscription Plans">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="pb-5 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
            <p className="mt-2 text-sm text-gray-500">
              Choose the right plan for your needs
            </p>
          </div>
          
          {currentSubscription && currentSubscription.status === 'active' && (
            <div className="mt-6 bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    You are currently subscribed to the <span className="font-medium">{currentSubscription.plan}</span> plan. 
                    Your subscription will {currentSubscription.cancelAtPeriodEnd ? 'end' : 'renew'} on {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8">
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <SubscriptionPlans userType={userType} />
            )}
          </div>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}