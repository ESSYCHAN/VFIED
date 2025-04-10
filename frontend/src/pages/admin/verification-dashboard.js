// src/pages/admin/verification-dashboard.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import AdminNavigation from '../../components/admin/AdminNavigation';
import Head from 'next/head';
import { collection, query, where, getDocs, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function VerificationDashboard() {
  const { currentUser, userRole } = useAuth();
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [verifierNotes, setVerifierNotes] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  
  // Redirect if not an admin or verifier
  useEffect(() => {
    if (!loading && userRole !== 'admin' && userRole !== 'verifier') {
      window.location.href = '/dashboard';
    }
  }, [userRole, loading]);

  // Fetch pending verifications
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchVerifications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Query credentials that need verification
        const q = query(
          collection(db, 'credentials'),
          where('verificationStatus', '==', activeTab), // 'pending', 'verified', 'rejected'
          orderBy('submissionDate', 'desc'),
          limit(20)
        );
        
        const querySnapshot = await getDocs(q);
        const verifications = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          submissionDate: doc.data().submissionDate?.toDate() || new Date()
        }));
        
        setPendingVerifications(verifications);
        
        // Clear selected verification when changing tabs
        setSelectedVerification(null);
      } catch (error) {
        console.error("Error fetching verifications:", error);
        setError("Failed to load verification requests. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVerifications();
  }, [currentUser, activeTab]);

  // Handle verification action (approve/reject)
  const handleVerificationAction = async (action) => {
    if (!selectedVerification) return;
    
    try {
      setProcessing(true);
      setError(null);
      
      // Update the credential document
      const credentialRef = doc(db, 'credentials', selectedVerification.id);
      
      const updateData = {
        verificationStatus: action === 'approve' ? 'verified' : 'rejected',
        verifiedBy: currentUser.uid,
        verifiedAt: new Date(),
        verifierNotes: verifierNotes,
      };
      
      await updateDoc(credentialRef, updateData);
      
      // Update local state
      setPendingVerifications(prev => 
        prev.filter(v => v.id !== selectedVerification.id)
      );
      
      setSuccessMessage(`Credential ${action === 'approve' ? 'verified' : 'rejected'} successfully.`);
      setSelectedVerification(null);
      setVerifierNotes('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error(`Error ${action}ing verification:`, error);
      setError(`Failed to ${action} verification. Please try again.`);
    } finally {
      setProcessing(false);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout title="Verification Dashboard">
      <Head>
        <title>Verification Dashboard - VFied</title>
      </Head>
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Credential Verification Dashboard</h1>
          <p className="text-gray-600">
            Review and verify user-submitted credentials
          </p>
        </div>
        
        <AdminNavigation />
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="ml-2 text-red-700 hover:text-red-900"
            >
              Dismiss
            </button>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
            {successMessage}
          </div>
        )}
        
        {/* Status tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('pending')}
                className={`${
                  activeTab === 'pending'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Pending
              </button>
              <button
                onClick={() => setActiveTab('verified')}
                className={`${
                  activeTab === 'verified'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Verified
              </button>
              <button
                onClick={() => setActiveTab('rejected')}
                className={`${
                  activeTab === 'rejected'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Rejected
              </button>
            </nav>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Verification Requests List */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {activeTab === 'pending' ? 'Pending Requests' : 
                   activeTab === 'verified' ? 'Verified Credentials' : 
                   'Rejected Credentials'}
                </h2>
              </div>
              
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading requests...</p>
                </div>
              ) : pendingVerifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No {activeTab} credentials found.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 max-h-screen overflow-y-auto">
                  {pendingVerifications.map(verification => (
                    <li 
                      key={verification.id}
                      className={`px-4 py-4 cursor-pointer hover:bg-gray-50 ${
                        selectedVerification?.id === verification.id ? 'bg-indigo-50' : ''
                      }`}
                      onClick={() => setSelectedVerification(verification)}
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{verification.title}</p>
                          <p className="text-xs text-gray-500 capitalize">{verification.type || 'credential'}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          verification.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          verification.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {verification.verificationStatus}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        <span>Submitted: {formatDate(verification.submissionDate)}</span>
                        <span className="ml-4">By: {verification.userName || 'Unknown user'}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {/* Verification Details */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Credential Details</h2>
              </div>
              
              {!selectedVerification ? (
                <div className="p-6 text-center text-gray-500">
                  Select a credential to view details
                </div>
              ) : (
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedVerification.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedVerification.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedVerification.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedVerification.verificationStatus}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {selectedVerification.type || 'credential'}
                      </span>
                    </div>
                    
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Issuer</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedVerification.issuer || 'Not specified'}</dd>
                      </div>
                      
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {selectedVerification.dateIssued 
                            ? formatDate(selectedVerification.dateIssued) 
                            : 'Not specified'}
                        </dd>
                      </div>
                      
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Submitted By</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedVerification.userName || 'Unknown user'}</dd>
                      </div>
                      
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Submission Date</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedVerification.submissionDate)}</dd>
                      </div>
                      
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Description</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedVerification.description || 'No description provided'}</dd>
                      </div>
                      
                      {selectedVerification.skills && selectedVerification.skills.length > 0 && (
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">Skills</dt>
                          <dd className="mt-1">
                            <div className="flex flex-wrap gap-1">
                              {selectedVerification.skills.map((skill, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  
                  {/* Document Preview */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Credential Document</h4>
                    {selectedVerification.documentUrl ? (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <div className="ml-2">
                              <p className="text-sm font-medium text-gray-900">Certificate Document</p>
                              <p className="text-xs text-gray-500">Click to view full document</p>
                            </div>
                          </div>
                          <a 
                            href={selectedVerification.documentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-200"
                          >
                            View
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No document uploaded</div>
                    )}
                  </div>
                  
                  {/* Verifier Notes */}
                  {activeTab === 'pending' && (
                    <div className="mb-6">
                      <label htmlFor="verifierNotes" className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Notes
                      </label>
                      <textarea
                        id="verifierNotes"
                        rows={4}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Add notes about your verification decision..."
                        value={verifierNotes}
                        onChange={(e) => setVerifierNotes(e.target.value)}
                      />
                    </div>
                  )}
                  
                  {/* Previously added notes (for verified/rejected) */}
                  {activeTab !== 'pending' && selectedVerification.verifierNotes && (
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-900 mb-2">Verifier Notes</h4>
                      <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700">
                        {selectedVerification.verifierNotes}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Verified by: {selectedVerification.verifiedBy || 'Unknown'} on {selectedVerification.verifiedAt ? formatDate(selectedVerification.verifiedAt) : 'Unknown date'}
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  {activeTab === 'pending' && (
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => handleVerificationAction('reject')}
                        disabled={processing}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        {processing ? 'Processing...' : 'Reject'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVerificationAction('approve')}
                        disabled={processing}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        {processing ? 'Processing...' : 'Verify'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}