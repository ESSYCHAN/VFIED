// src/components/Layout.js
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useAuth } from '@/context/AuthContext';

export default function Layout({ children }) {
  const { currentUser, userRole, logout } = useAuth();
  const router = useRouter();


  
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };
  
  const isActive = (path) => {
    return router.pathname === path ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-50';
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              VFied
            </Link>
            
            <div className="flex space-x-4">
              <Link 
                href="/dashboard" 
                className={`px-4 py-2 rounded-md text-sm font-medium ${isActive('/dashboard')}`}
              >
                Dashboard
              </Link>
              
              {/* Employer-specific links */}
              {userRole === 'employer' && (
                <>
                  <Link 
                    href="/requisitions" 
                    className={`px-4 py-2 rounded-md text-sm font-medium ${isActive('/requisitions')}`}
                  >
                    Job Requisitions
                  </Link>
                  <Link 
                    href="/requisitions/new" 
                    className={`px-4 py-2 rounded-md text-sm font-medium ${isActive('/requisitions/new')}`}
                  >
                    Post New Job
                  </Link>
                </>
              )}
              
              {/* Recruiter-specific links */}
              {userRole === 'recruiter' && (
                <Link 
                  href="/recruiter/dashboard" 
                  className={`px-4 py-2 rounded-md text-sm font-medium ${isActive('/recruiter/dashboard')}`}
                >
                  Recruiter Tools
                </Link>
              )}
              
              <Link 
                href="/profile" 
                className={`px-4 py-2 rounded-md text-sm font-medium ${isActive('/profile')}`}
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Show role indicator to help with debugging */}
        {process.env.NODE_ENV === 'development' && userRole && (
          <div className="mb-4 p-2 bg-gray-100 text-sm text-gray-600 rounded">
            Current role: {userRole}
          </div>
        )}
        
        {children}
      </main>
    </div>
  );
}