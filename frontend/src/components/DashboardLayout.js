// src/components/DashboardLayout.js
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function DashboardLayout({ children, title = 'Dashboard' }) {
  const router = useRouter();
  const { currentUser, userRole, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>{title} - VFied</title>
      </Head>

      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                VFied
              </Link>
              
              <button 
                className="md:hidden ml-4 text-gray-700"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {currentUser?.displayName || currentUser?.email}
              </span>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-screen overflow-hidden pt-16">
        {/* Sidebar - Mobile */}
        <div 
          className={`md:hidden fixed inset-0 bg-gray-900 bg-opacity-50 z-40 transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setSidebarOpen(false)}
        >
          <div 
            className={`fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center justify-between px-4">
                <span className="text-xl font-bold text-indigo-600">Menu</span>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setSidebarOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {renderNavLinks()}
              </nav>
            </div>
          </div>
        </div>

        {/* Sidebar - Desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                  {renderNavLinks()}
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <main className="flex-1 relative z-0 overflow-y-auto py-6 focus:outline-none">
            <div className="px-4 sm:px-6 md:px-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );

  // Helper function to render navigation links based on user role
  function renderNavLinks() {
    const isActive = (path) => router.pathname === path ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50';
    
    return (
      <>
        <Link
          href="/dashboard"
          className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive('/dashboard')}`}
        >
          <svg className="mr-3 h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </Link>
        
        <Link
          href="/profile"
          className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive('/profile')}`}
        >
          <svg className="mr-3 h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile
        </Link>
        
        {/* Employer specific links */}
        {userRole === 'employer' && (
          <>
            <Link
              href="/employer/dashboard"
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive('/employer/dashboard')}`}
            >
              <svg className="mr-3 h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Employer Dashboard
            </Link>
            
            <Link
              href="/jobs/new"
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive('/jobs/new')}`}
            >
              <svg className="mr-3 h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Post New Job
            </Link>
          </>
        )}
        
        {/* Recruiter specific links */}
        {userRole === 'recruiter' && (
          <>
            <Link
              href="/recruiter/dashboard"
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive('/recruiter/dashboard')}`}
            >
              <svg className="mr-3 h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Recruiter Dashboard
            </Link>
            
            <Link
              href="/requisitions"
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive('/requisitions')}`}
            >
              <svg className="mr-3 h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Requisitions
            </Link>
            
            <Link
              href="/requisitions/new"
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive('/requisitions/new')}`}
            >
              <svg className="mr-3 h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Requisition
            </Link>
          </>
        )}
      </>
    );
  }
}