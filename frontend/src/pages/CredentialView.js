// frontend/src/pages/CredentialView.js
import React from 'react';
import { useRouter } from 'next/router';
// Import LinkComponent from NextJS instead of using useNavigate from react-router
import Link from 'next/link';
import Head from 'next/head';

const CredentialView = () => {
  const router = useRouter();
  // Use Next.js router instead of useNavigate
  const navigateBack = () => router.back();

  // Get credential ID from router query
  const { id } = router.query;

  // For now, mock credential data
  const credential = {
    id: id || 'credential-id',
    title: 'Bachelor of Science in Computer Science',
    issuer: 'University of Example',
    dateIssued: '2020-06-15',
    description: 'This certifies that the holder has successfully completed all requirements for the degree of Bachelor of Science in Computer Science.',
    verificationStatus: 'verified',
    skills: ['Programming', 'Algorithms', 'Data Structures', 'Software Engineering']
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{credential.title} - VFied</title>
      </Head>

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Credential Details</h1>
            <button
              onClick={navigateBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{credential.title}</h2>
                <p className="mt-1 text-sm text-gray-500">Issued by {credential.issuer} on {new Date(credential.dateIssued).toLocaleDateString()}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${credential.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' : 
                credential.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                credential.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' : 
                'bg-gray-100 text-gray-800'}`}
              >
                {credential.verificationStatus}
              </span>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900">Description</h3>
              <p className="mt-2 text-sm text-gray-500">{credential.description}</p>
            </div>

            {credential.skills && credential.skills.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Skills</h3>
                <div className="mt-2 flex flex-wrap">
                  {credential.skills.map((skill, index) => (
                    <span key={index} className="mr-2 mb-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900">Verification Details</h3>
              <div className="mt-2">
                {credential.verificationStatus === 'verified' ? (
                  <div className="bg-green-50 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-800">This credential has been verified by VFied on {new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ) : credential.verificationStatus === 'pending' ? (
                  <div className="bg-yellow-50 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-800">This credential is currently under review. You will be notified once verification is complete.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-800">This credential has not been submitted for verification.</p>
                        <div className="mt-2">
                          <Link
                            href={`/verify-credential/${credential.id}`}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            Submit for Verification
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CredentialView;