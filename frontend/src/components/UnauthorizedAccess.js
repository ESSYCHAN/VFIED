// src/components/UnauthorizedAccess.js
import React from 'react';
import Link from 'next/link';

/**
 * Component displayed when user tries to access a restricted page
 * 
 * @param {Object} props Component props
 * @param {string} props.currentRole User's current role
 * @param {string|string[]} props.requiredRoles Roles required to access the page
 */
export default function UnauthorizedAccess({ currentRole, requiredRoles = [] }) {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  // Format the required roles for display
  const formattedRoles = roles.map(role => 
    role.charAt(0).toUpperCase() + role.slice(1)
  ).join(', ');
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h2 className="mt-6 text-2xl font-bold text-gray-900">Access Denied</h2>
        
        <p className="mt-2 text-base text-gray-600">
          You don't have permission to access this page.
        </p>
        
        {formattedRoles && (
          <p className="mt-1 text-sm text-gray-500">
            Required role{roles.length > 1 ? 's' : ''}: {formattedRoles}
          </p>
        )}
        
        {currentRole && (
          <p className="mt-1 text-sm text-gray-500">
            Your current role: {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
          </p>
        )}
        
        <div className="mt-8 space-y-4">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Go to Dashboard
          </Link>
          
          <div>
            <Link 
              href="/" 
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}