// src/pages/dashboard.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function Dashboard() {
  const router = useRouter();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0
  });
  const [filterType, setFilterType] = useState('All Types');
  const [filterStatus, setFilterStatus] = useState('All Status');
  
  // Safely access auth context
  let auth = { currentUser: null, loading: true, logout: () => {}, userRole: null };
  
  try {
    auth = useAuth();
  } catch (error) {
    console.error("Auth context error:", error);
    // If we're on the client side, redirect to login
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
  }
  
  const { currentUser, userRole, logout } = auth;
  
  // Redirect if not logged in
  useEffect(() => {
    if (!auth.loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, auth.loading, router]);
  
  // Fetch credentials
  useEffect(() => {
    async function fetchCredentials() {
      if (!currentUser) return;
      
      try {
        const credentialsRef = collection(db, 'credentials');
        const q = query(credentialsRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const credentialList = [];
        let verified = 0;
        let pending = 0;
        let rejected = 0;
        
        querySnapshot.forEach((doc) => {
          const credential = {
            id: doc.id,
            ...doc.data()
          };
          
          credentialList.push(credential);
          
          // Count by status
          if (credential.verificationStatus === 'verified') {
            verified++;
          } else if (credential.verificationStatus === 'pending') {
            pending++;
          } else if (credential.verificationStatus === 'rejected') {
            rejected++;
          }
        });
        
        setCredentials(credentialList);
        setStats({
          total: credentialList.length,
          verified,
          pending,
          rejected
        });
      } catch (error) {
        console.error("Error fetching credentials:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCredentials();
  }, [currentUser]);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };
  
  // If still loading auth, show loading spinner
  if (auth.loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  // If not logged in and still rendering, show nothing
  if (!currentUser) {
    return null;
  }
  
  // Filter credentials
  const filteredCredentials = credentials.filter(credential => {
    const typeMatch = filterType === 'All Types' || credential.type === filterType.toLowerCase();
    const statusMatch = filterStatus === 'All Status' || credential.verificationStatus === filterStatus.toLowerCase();
    return typeMatch && statusMatch;
  });
  
  // Add new credential
  const handleAddCredential = () => {
    router.push('/credentials/new');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Dashboard - VFied</title>
      </Head>
      
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              VFied
            </Link>
            
            <nav className="flex space-x-4">
              <Link href="/dashboard" className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-100 text-indigo-700">
                Dashboard
              </Link>
              
              <Link href="/profile" className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Profile
              </Link>
              
              {userRole === 'employer' && (
                <Link href="/requisitions" className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Job Requisitions
                </Link>
              )}
              
              {userRole === 'recruiter' && (
                <Link href="/recruiter/dashboard" className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Recruiter Tools
                </Link>
              )}
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Sign out
              </button>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Credentials</h1>
            <p className="text-gray-600">Manage your verified credentials and upload new ones.</p>
          </div>
          
          <button
            onClick={handleAddCredential}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            + Add Credential
          </button>
        </div>
        
        <div className="flex justify-end mb-6">
          <button className="bg-white px-4 py-2 rounded-md text-indigo-600 border border-indigo-200 flex items-center space-x-2">
            <span>AI Features</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Stats cards */}
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Credentials</dt>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Verified</dt>
                    <dd>
                      <div className="text-lg font-medium text-green-600">{stats.verified}</div>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                    <dd>
                      <div className="text-lg font-medium text-yellow-600">{stats.pending}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                    <dd>
                      <div className="text-lg font-medium text-red-600">{stats.rejected}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Credentials</h2>
            
            <div className="flex space-x-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option>All Types</option>
                <option>Education</option>
                <option>Work</option>
                <option>Certificate</option>
                <option>Skill</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option>All Status</option>
                <option>Verified</option>
                <option>Pending</option>
                <option>Rejected</option>
                <option>Draft</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-500">Loading credentials...</p>
            </div>
          ) : credentials.length === 0 ? (
            <div className="bg-white shadow overflow-hidden rounded-lg py-12 text-center">
              <div className="flex justify-center">
                <svg className="h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No credentials yet</h3>
              <p className="mt-1 text-gray-500">Get started by adding your first credential.</p>
              <div className="mt-6">
                <button
                  onClick={handleAddCredential}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Your First Credential
                </button>
              </div>
            </div>
          ) : filteredCredentials.length === 0 ? (
            <div className="bg-white shadow overflow-hidden rounded-lg py-8 text-center">
              <p className="text-gray-500">No credentials match your filters.</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredCredentials.map((credential) => (
                  <li key={credential.id}>
                    <Link href={`/credentials/${credential.id}`} className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {credential.title}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${credential.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' : 
                                credential.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                credential.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' : 
                                'bg-gray-100 text-gray-800'}`}
                            >
                              {credential.verificationStatus || 'draft'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path>
                              </svg>
                              {credential.issuer || 'No issuer'}
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                              </svg>
                              {credential.type || 'Unknown type'}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <p>
                              {credential.dateIssued ? new Date(credential.dateIssued).toLocaleDateString() : 'No date'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}