// src/pages/requisitions/new.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import JobPostingPayment from '../../components/employer/JobPostingPayment';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import StripeWrapper from '../../components/stripe/StripeWrapper';
import AIJobDescriptionGenerator from '../../components/employer/AIJobDescriptionGenerator';



export default function NewRequisition() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    requiredSkills: '',
    minSalary: '',
    maxSalary: '',
    type: 'full-time'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
  // const [requisitionId, setRequisitionId] = useState(null);
  // const [showPayment, setShowPayment] = useState(false);
  const [showPayment, setShowPayment] = useState(true); // Set to true for testing
  const [requisitionId, setRequisitionId] = useState('test-requisition-id'); // Dummy ID for testing
  const [showAITool, setShowAITool] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to create a requisition');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Format skills as an array
      const skills = formData.requiredSkills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill);
      
      // Create requisition document
      const requisitionData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        requiredSkills: skills,
        salary: {
          min: formData.minSalary ? parseInt(formData.minSalary) : null,
          max: formData.maxSalary ? parseInt(formData.maxSalary) : null,
          currency: 'USD'
        },
        type: formData.type,
        status: 'draft',
        employerId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        paymentStatus: 'required'
      };
      
      // Save to Firestore
      const docRef = await addDoc(collection(db, 'requisitions'), requisitionData);
      
      // Show payment UI
      setRequisitionId(docRef.id);
      setShowPayment(true);
    } catch (error) {
      console.error('Error creating requisition:', error);
      setError('Failed to create requisition: ' + error.message);
      setLoading(false);
    }
  };

  // Add these handler functions
const handlePaymentComplete = async (paymentIntent) => {
  try {
    console.log('Payment completed successfully!', paymentIntent);
    // Update requisition status to active after payment
    // await updateDoc(doc(db, 'requisitions', requisitionId), {
    //   status: 'active',
    //   paymentStatus: 'paid',
    //   paymentId: paymentIntent.id,
    //   updatedAt: serverTimestamp()
    // });
    
    // Redirect to the requisition details page
    router.push(`/requisitions/${requisitionId}`);
  } catch (error) {
    console.error('Error updating requisition status:', error);
    setError('Payment successful but failed to activate job. Please contact support.');
    setLoading(false);
  }
};

const handlePaymentError = (error) => {
  setError('Payment failed: ' + error.message);
  setLoading(false);
};

// Add a handler to receive data from the AI tool
const handleAIGeneratedJobDescription = (generatedData) => {
  // Update your form with the AI-generated data
  setFormData({
    ...formData,
    title: generatedData.title,
    description: generatedData.description,
    // Map other fields accordingly
  });
  
  setShowAITool(false); // Hide the AI tool after using it
};
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900">Create New Job Requisition</h1>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Job Details</h3>
              <p className="mt-1 text-sm text-gray-600">
                Provide details about the job position you're looking to fill.
              </p>
            </div>
          </div>
          
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                  {error && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Job Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      required
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Describe the responsibilities, requirements, and other details about the position."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      id="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="e.g., New York, NY or Remote"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="requiredSkills" className="block text-sm font-medium text-gray-700">
                      Required Skills (comma separated)
                    </label>
                    <input
                      type="text"
                      name="requiredSkills"
                      id="requiredSkills"
                      value={formData.requiredSkills}
                      onChange={handleChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="e.g., JavaScript, React, Node.js"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="minSalary" className="block text-sm font-medium text-gray-700">
                        Minimum Salary
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="minSalary"
                          id="minSalary"
                          value={formData.minSalary}
                          onChange={handleChange}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="maxSalary" className="block text-sm font-medium text-gray-700">
                        Maximum Salary
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="maxSalary"
                          id="maxSalary"
                          value={formData.maxSalary}
                          onChange={handleChange}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Employment Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                      <option value="temporary">Temporary</option>
                    </select>
                  </div>
                </div>
                
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <Link
                    href="/requisitions"
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-3"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {loading ? 'Creating...' : 'Create Requisition'}
                  </button>
                </div>
              </div>
              {showPayment && requisitionId && (
  <div className="mt-6 border border-gray-200 rounded-lg p-4">
    <h3 className="text-lg font-medium mb-4">Payment Required to Publish Job</h3>
    <p className="mb-4 text-sm text-gray-600">
      A one-time fee of $50 is required to publish this job posting.
    </p>
    <button
      onClick={() => {
        // Mock a successful payment
        handlePaymentComplete({ id: 'mock_payment_' + Date.now() });
      }}
      className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
    >
      Pay & Publish Job ($50)
    </button>
  </div>
)}
<button
  type="button"
  onClick={() => setShowAITool(!showAITool)}
  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
>
  {showAITool ? 'Hide AI Assistant' : 'Use AI Job Description Assistant'}
</button>

{showAITool && (
  <div className="mt-6">
    <AIJobDescriptionGenerator 
      onSave={handleAIGeneratedJobDescription}
      initialData={formData}
    />
  </div>
)}

{/* {showPayment && requisitionId && (
  <div className="mt-6">
    <StripeWrapper>
      <JobPostingPayment
        requisitionId={requisitionId}
        onPaymentComplete={handlePaymentComplete}
        onPaymentError={handlePaymentError}
      />
    </StripeWrapper>
  </div>
)} */}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}