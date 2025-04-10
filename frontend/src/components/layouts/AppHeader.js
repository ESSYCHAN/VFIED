// src/components/layouts/AppHeader.js
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';

/**
 * Application header with responsive navigation that adjusts based on user role
 */
export default function AppHeader() {
  const { currentUser, userRole, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };
  
  // Function to check if a route is active
  const isActive = (path) => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };
  
  // Get navigation links based on user role
  const getNavLinks = () => {
    const commonLinks = [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/profile', label: 'Profile' }
    ];
    
    // Role-specific links
    const roleLinks = {
      admin: [
        { href: '/admin/verification-dashboard', label: 'Verification' },
        { href: '/admin/user-management', label: 'Users' }
      ],
      employer: [
        { href: '/employer/dashboard', label: 'Employer Dashboard' },
        { href: '/requisitions', label: 'Job Requisitions' },
        { href: '/requisitions/new', label: 'Post New Job' }
      ],
      recruiter: [
        { href: '/recruiter/dashboard', label: 'Recruiter Dashboard' },
        { href: '/requisitions', label: 'Job Requisitions' }
      ],
      verifier: [
        { href: '/admin/verification-dashboard', label: 'Verification' }
      ]
    };
    
    // Combine common links with role-specific links
    return [
      ...commonLinks,
      ...(roleLinks[userRole] || [])
    ];
  };
  
  // Get navigation links
  const navLinks = getNavLinks();
  
  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                VFied
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {currentUser && navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${
                    isActive(link.href)
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          {/* User menu and mobile button */}
          <div className="flex items-center">
            {currentUser ? (
              <>
                {/* User info */}
                <div className="hidden md:flex items-center">
                  <span className="text-sm text-gray-500 mr-4">
                    {currentUser.displayName || currentUser.email}
                    {userRole && (
                      <span className="ml-1 text-xs text-gray-400">
                        ({userRole})
                      </span>
                    )}
                  </span>
                  
                  <button
                    onClick={handleLogout}
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex space-x-4">
                <Link 
                  href="/login"
                  className="text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Sign up
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden ml-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            {currentUser && navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${
                  isActive(link.href)
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {currentUser && (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}