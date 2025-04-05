// src/pages/dashboard.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Head from 'next/head';
import Link from 'next/link';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAIFeatures, setShowAIFeatures] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0
  });

  useEffect(() => {
    async function fetchCredentials() {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        const q = query(
          collection(db, 'credentials'), 
          where('userId', '==', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const credentialsList = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          credentialsList.push({
            id: doc.id,
            ...data,
            dateIssued: data.dateIssued?.toDate?.()?.toISOString() || data.dateIssued,
            dateUploaded: data.dateUploaded?.toDate?.()?.toISOString() || data.dateUploaded
          });
        });
        
        setCredentials(credentialsList);
        updateStats(credentialsList);
        
      } catch (error) {
        console.error("Error fetching credentials:", error);
        // Use mock data for demo if needed
        const mockData = [
          {
            id: "mock1",
            title: "Bachelor of Computer Science",
            type: "education",
            issuer: "MIT",
            dateIssued: "2020-05-15",
            verificationStatus: "verified",
            dateUploaded: new Date().toISOString()
          },
          {
            id: "mock2",
            title: "Senior Software Engineer",
            type: "work",
            issuer: "Google",
            dateIssued: "2021-06-01",
            verificationStatus: "pending",
            dateUploaded: new Date().toISOString()
          },
          {
            id: "mock3",
            title: "Machine Learning Certification",
            type: "certificate",
            issuer: "Coursera",
            dateIssued: "2022-01-10",
            verificationStatus: "draft",
            dateUploaded: new Date().toISOString()
          }
        ];
        setCredentials(mockData);
        updateStats(mockData);
      } finally {
        setLoading(false);
      }
    }
    
    function updateStats(credsList) {
      const statsCounts = credsList.reduce((acc, credential) => {
        acc.total += 1;
        
        const status = credential.verificationStatus || credential.status;
        
        if (status === 'verified') {
          acc.verified += 1;
        } else if (status === 'pending') {
          acc.pending += 1;
        } else if (status === 'rejected') {
          acc.rejected += 1;
        }
        
        return acc;
      }, { total: 0, verified: 0, pending: 0, rejected: 0 });
      
      setStats(statsCounts);
    }
    
    fetchCredentials();
  }, [currentUser]);

  return (
    <>
      <Head>
        <title>Dashboard - VFied</title>
      </Head>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Credentials</h1>
          <p className="text-gray-500">Manage your verified credentials and upload new ones.</p>
        </div>
        <button
          onClick={() => {/* Add credential logic */}}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
        >
          + Add Credential
        </button>
      </div>
      
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowAIFeatures(!showAIFeatures)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            showAIFeatures ? 'bg-indigo-600 text-white' : 'bg-white border border-indigo-600 text-indigo-600'
          }`}
        >
          AI Features {showAIFeatures ? '✓' : '🔍'}
        </button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Credentials</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-indigo-600">{stats.total}</div>
                </dd>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Verified</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-green-600">{stats.verified}</div>
                </dd>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-yellow-600">{stats.pending}</div>
                </dd>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-red-600">{stats.rejected}</div>
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Blockchain Verified Section */}
      {stats.verified > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6 border-l-4 border-green-500">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-medium text-gray-900">Blockchain Verified Credentials</h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p>You have {stats.verified} verified credentials that are secured on the blockchain. These credentials can be shared with recruiters and organizations with cryptographic proof of authenticity.</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {credentials
                    .filter(c => c.verificationStatus === 'verified')
                    .slice(0, 3)
                    .map((credential, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <svg className="mr-1.5 h-2 w-2 text-green-600" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                        {credential.title}
                      </span>
                    ))}
                </div>
                <div className="mt-4">
                  <Link href="/dashboard?filter=verified" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    View all verified credentials →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Credentials List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Your Credentials</h3>
          <div className="flex space-x-2">
            <select className="border border-gray-300 rounded-md text-sm py-1 px-2">
              <option value="all">All Types</option>
              <option value="education">Education</option>
              <option value="work">Work</option>
              <option value="certificate">Certificate</option>
              <option value="skill">Skill</option>
            </select>
            <select className="border border-gray-300 rounded-md text-sm py-1 px-2">
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="p-10 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-500">Loading credentials...</p>
          </div>
        ) : credentials.length === 0 ? (
          <div className="py-10 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No credentials yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first credential.</p>
            <div className="mt-6">
              <button
                onClick={() => {/* Add credential logic */}}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add Your First Credential
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {credentials.map((credential) => (
              <div key={credential.id} className="hover:bg-gray-50 transition-colors duration-150">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 text-xl mr-2">
                        {credential.type === 'education' ? '🎓' : 
                         credential.type === 'work' ? '💼' : 
                         credential.type === 'certificate' ? '📜' : 
                         credential.type === 'skill' ? '⚡' : '📄'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{credential.title}</p>
                        <p className="text-sm text-gray-500">{credential.issuer}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        credential.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                        credential.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        credential.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {credential.verificationStatus || 'Draft'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {credential.dateIssued ? 
                          `Issued: ${new Date(credential.dateIssued).toLocaleDateString()}` : 
                          `Uploaded: ${new Date(credential.dateUploaded || credential.createdAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <div className="flex space-x-4">
                        {(credential.documentUrl || credential.fileUrl) && (
                          <a 
                            href={credential.documentUrl || credential.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            View Document
                          </a>
                        )}
                        
                        {(credential.verificationStatus === 'draft' || credential.status === 'draft') && (
                          <button 
                            className="text-green-600 hover:text-green-900 text-sm font-medium"
                          >
                            Request Verification
                          </button>
                        )}
                        
                        <Link 
                          href={`/credentials/${credential.id}`}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Details
                        </Link>
                        
                        <button 
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}