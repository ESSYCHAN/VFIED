// src/components/ProtectedRoute.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

/**
 * A wrapper component that protects routes based on authentication and roles
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children The children to render if authenticated
 * @param {Array<string>} props.allowedRoles Array of roles allowed to access the route
 * @param {string} props.redirectTo Path to redirect to if not authenticated or not authorized
 */
export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/login' 
}) {
  const { currentUser, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only perform the check after auth loading is complete
    if (!loading) {
      // If not logged in or not authorized, redirect
      if (!currentUser) {
        router.push(redirectTo);
      } else if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        // User is logged in but doesn't have the required role
        router.push('/dashboard'); // Redirect to dashboard instead of login
      }
    }
  }, [currentUser, loading, router, redirectTo, userRole, allowedRoles]);

  // Show nothing while loading or if not authenticated
  if (loading || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If allowed roles is specified and user doesn't have an allowed role, render nothing
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>You don't have permission to access this page.</p>
        </div>
        <button 
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // User is authenticated and authorized
  return children;
}