// src/pages/requisitions/new.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import JobPostingPayment from '../../components/employer/JobPostingPayment';
import ExperienceCalculator from '../../components/employer/ExperienceCalculator';
import AIJobDescriptionGenerator from '../../components/employer/AIJobDescriptionGenerator';

export default function NewRequisition() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    requiredSkills: '',
    experienceRequired: '',
    minSalary: '',
    maxSalary: '',
    department: '',
    industry: '',
    employmentType: 'full-time'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [requisitionId, setRequisitionId] = useState(null);
  const [showAITool, setShowAITool] = useState(false);
  
  // Parse skills from comma-separated string to array
  const parseSkills = (skillsString) => {
    return skillsString
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle analysis completion from Experience Calculator
  const handleAnalysisComplete = (analysis) => {
    if (analysis && analysis.yearsOfExperience) {
      setFormData(prev => ({
        ...prev,
        experienceRequired: analysis.yearsOfExperience
      }));
      
      // Optionally highlight suggestions to the user if there are any
      if (analysis.suggestions && analysis.suggestions.length > 0) {
        // You could show these in a toast notification or info panel
        console.log('Suggestions:', analysis.suggestions);
      }
    }
  };
  
  // Handle job description from AI generator
  const handleAIGeneratedJobDescription = (generatedData) => {
    setFormData({
      ...formData,
      title: generatedData.title || formData.title,
      description: generatedData.summary || formData.description,
      requiredSkills: generatedData.skillsRequired?.join(', ') || formData.requiredSkills,
      experienceRequired: generatedData.yearsOfExperience || formData.experienceRequired,
    });
    
    setShowAITool(false);
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
      // Prepare requisition data
      const requisitionData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        requiredSkills: parseSkills(formData.requiredSkills),
        experienceRequired: formData.experienceRequired,
        salary: {
          min: formData.minSalary ? parseInt(formData.minSalary) : null,
          max: formData.maxSalary ? parseInt(formData.maxSalary) : null,
          currency: 'USD'
        },
        department: formData.department,
        industry: formData.industry,
        type: formData.employmentType,
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

  // Handle payment completion
  const handlePaymentComplete = async (paymentIntent) => {
    try {
      console.log('Payment completed successfully!', paymentIntent);
      // Redirect to the requisition details page
      router.push(`/requisitions/${requisitionId}`);
    } catch (error) {
      console.error('Error updating requisition status:', error);
      setError('Payment successful but failed to activate job. Please contact support.');
      setLoading(false);
    }
  };

  // Handle payment error
  const handlePaymentError = (error) => {
    setError('Payment failed: ' + error.message);
    setLoading(false);
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
              
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowAITool(!showAITool)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  {showAITool ? 'Hide AI Assistant' : 'Use AI Job Description Assistant'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-5 md:mt-0 md:col-span-2">
            {showAITool && (
              <div className="mb-6">
                <AIJobDescriptionGenerator 
                  onSave={handleAIGeneratedJobDescription}
                  initialData={formData}
                />
              </div>
            )}
            
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
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      id="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="e.g., Engineering, Marketing, HR"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                      Industry
                    </label>
                    <input
                      type="text"
                      name="industry"
                      id="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="e.g., Technology, Healthcare, Finance"
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
                  
                  {/* Experience Calculator Section */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Experience Requirements</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Let AI analyze your job requirements and suggest appropriate experience levels.
                    </p>
                    
                    <ExperienceCalculator
                      jobTitle={formData.title}
                      responsibilities={formData.description}
                      requiredSkills={formData.requiredSkills}
                      seniorityLevel={formData.employmentType}
                      department={formData.department}
                      industry={formData.industry}
                      onAnalysisComplete={handleAnalysisComplete}
                    />
                    
                    <div className="mt-4">
                      <label htmlFor="experienceRequired" className="block text-sm font-medium text-gray-700">
                        Experience Required
                      </label>
                      <input
                        type="text"
                        id="experienceRequired"
                        name="experienceRequired"
                        value={formData.experienceRequired}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="e.g., 3-5 years"
                      />
                    </div>
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
                    <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700">
                      Employment Type
                    </label>
                    <select
                      id="employmentType"
                      name="employmentType"
                      value={formData.employmentType}
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
            </form>
            
            {showPayment && requisitionId && (
              <div className="mt-6">
                <Elements stripe={loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY)}>
                  <JobPostingPayment
                    requisitionId={requisitionId}
                    onPaymentComplete={handlePaymentComplete}
                    onPaymentError={handlePaymentError}
                  />
                </Elements>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}