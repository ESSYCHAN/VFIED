// src/components/subscription/SubscriptionPlans.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createSubscriptionCheckout } from '../../services/stripeService';

/**
 * Subscription plans component showing tiered options for different user types
 * 
 * @param {Object} props Component props
 * @param {string} props.userType Type of user (candidate, employer, recruiter)
 */
export default function SubscriptionPlans({ userType = 'candidate' }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Define pricing and features for each user type and plan
  const planConfigs = {
    candidate: {
      title: 'Candidate Plans',
      description: 'Boost your career with verified credentials',
      plans: [
        {
          id: 'candidate-free',
          name: 'Free',
          price: 0,
          interval: 'month',
          currency: 'USD',
          features: [
            'Up to 2 credential verifications',
            'Basic profile',
            'Limited visibility to employers'
          ],
          cta: 'Current Plan',
          disabled: true
        },
        {
          id: 'candidate-premium',
          name: 'Premium',
          price: 999, // $9.99
          interval: 'month',
          currency: 'USD',
          features: [
            'Unlimited credential verification',
            'Enhanced profile visibility',
            'Skills assessment tools',
            '"Verified Professional" badge',
            'Priority listing in employer searches'
          ],
          cta: 'Subscribe',
          popular: true
        },
        {
          id: 'candidate-career-pro',
          name: 'Career Pro',
          price: 1999, // $19.99
          interval: 'month',
          currency: 'USD',
          features: [
            'All Premium features',
            'AI-powered job matching',
            'Career coaching services',
            'Mock interview preparation',
            'Resume analysis and optimization'
          ],
          cta: 'Subscribe'
        }
      ]
    },
    employer: {
      title: 'Employer Plans',
      description: 'Find the best talent for your organization',
      plans: [
        {
          id: 'employer-starter',
          name: 'Starter',
          price: 9900, // $99
          interval: 'month',
          currency: 'USD',
          features: [
            'Post up to 5 active job listings',
            'Basic candidate search',
            'View verification status',
            'Email support'
          ],
          cta: 'Subscribe'
        },
        {
          id: 'employer-growth',
          name: 'Growth',
          price: 29900, // $299
          interval: 'month',
          currency: 'USD',
          features: [
            '20 active job listings',
            'Advanced candidate search',
            'AI-powered candidate matching',
            'Bulk credential verification',
            'Enhanced analytics dashboard'
          ],
          cta: 'Subscribe',
          popular: true
        },
        {
          id: 'employer-enterprise',
          name: 'Enterprise',
          price: 99900, // $999
          interval: 'month',
          currency: 'USD',
          features: [
            'Unlimited job postings',
            'Full API access',
            'Dedicated account manager',
            'Custom integration with ATS/HRIS',
            'White-labeled verification portal'
          ],
          cta: 'Contact Sales',
          contactSales: true
        }
      ]
    },
    recruiter: {
      title: 'Recruiter Plans',
      description: 'Powerful tools to match candidates with opportunities',
      plans: [
        {
          id: 'recruiter-essential',
          name: 'Essential',
          price: 19900, // $199
          interval: 'month',
          currency: 'USD',
          features: [
            '50 candidate assessments/month',
            'Basic AI skill matching',
            'Verification status checks',
            'Email support'
          ],
          cta: 'Subscribe'
        },
        {
          id: 'recruiter-professional',
          name: 'Professional',
          price: 49900, // $499
          interval: 'month',
          currency: 'USD',
          features: [
            '200 candidate assessments/month',
            'Advanced AI skill matching',
            'Interview question generation',
            'Candidate skill gap analysis',
            'Priority support'
          ],
          cta: 'Subscribe',
          popular: true
        },
        {
          id: 'recruiter-agency',
          name: 'Agency',
          price: 149900, // $1,499
          interval: 'month',
          currency: 'USD',
          features: [
            'Unlimited assessments',
            'Team collaboration tools',
            'White-labeled client portal',
            'Bulk verification tools',
            'API access & CRM integration',
            'Dedicated account manager'
          ],
          cta: 'Contact Sales',
          contactSales: true
        }
      ]
    }
  };
  
  // Get plans for current user type
  const { title, description, plans } = planConfigs[userType] || planConfigs.candidate;
  
  // Handle subscription selection
  const handleSubscribe = async (planId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get plan details
      const planParts = planId.split('-');
      const planType = planParts[0];
      const planName = planParts[1];
      
      // Find the plan
      const planData = plans.find(p => p.id === planId);
      
      // If this is a "Contact Sales" plan, handle differently
      if (planData.contactSales) {
        // Redirect to contact sales page
        window.location.href = `/contact-sales?plan=${planId}`;
        return;
      }
      
      // Otherwise proceed with Stripe checkout
      await createSubscriptionCheckout({
        userId: currentUser.uid,
        plan: planName,
        userType: planType
      });
      
      // Note: The user will be redirected to Stripe Checkout
      
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      setError(error.message || 'Failed to process subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format price for display
  const formatPrice = (price, currency = 'USD') => {
    if (price === 0) return 'Free';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: price % 100 === 0 ? 0 : 2
    }).format(price / 100);
  };
  
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">{description}</p>
        </div>
        
        {error && (
          <div className="mt-6 max-w-lg mx-auto rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:grid-cols-3">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`${
                plan.popular ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-200'
              } rounded-lg shadow-sm divide-y divide-gray-200 border-2 relative flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-indigo-500 rounded-full px-3 py-1 text-xs font-semibold text-white">
                  Popular
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-4 flex items-baseline text-gray-900">
                  <span className="text-4xl font-extrabold tracking-tight">{formatPrice(plan.price, plan.currency)}</span>
                  {plan.price > 0 && (
                    <span className="ml-1 text-xl font-semibold">/{plan.interval}</span>
                  )}
                </p>
                <p className="mt-6 text-gray-500">{plan.description}</p>
              </div>
              
              <div className="py-6 px-6 flex-1">
                <h4 className="text-sm font-medium text-gray-900 tracking-wide">Features</h4>
                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-2 text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="px-6 py-6">
                <button
                  type="button"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading || plan.disabled}
                  className={`${
                    plan.disabled
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : plan.popular
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  } w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {loading ? 'Processing...' : plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}