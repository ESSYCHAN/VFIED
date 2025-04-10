// src/components/layouts/BaseLayout.js
import React from 'react';
import Head from 'next/head';
import { useAuth } from '../../context/AuthContext';
import RoleSwitcher from '../RoleSwitcher';

/**
 * Base layout component for consistent page structure
 * 
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Content to display
 * @param {string} props.title Page title
 * @param {React.ReactNode} props.header Custom header
 * @param {React.ReactNode} props.footer Custom footer
 * @param {React.ReactNode} props.sidebar Custom sidebar
 * @param {boolean} props.fluid Whether to use full width
 */
export default function BaseLayout({
  children,
  title = 'VFied',
  header,
  footer,
  sidebar,
  fluid = false
}) {
  const { currentUser } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Head>
        <title>{title} - VFied</title>
        <meta name="description" content="Your Credentials, Your Super-Power" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Header */}
      {header}
      
      {/* Main content */}
      <main className="flex-grow flex">
        {/* Sidebar (if provided) */}
        {sidebar && (
          <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64">
              {sidebar}
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className={fluid ? 'w-full' : 'max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'}>
            {children}
          </div>
        </div>
      </main>
      
      {/* Footer */}
      {footer || (
        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} VFied. All rights reserved.
            </p>
          </div>
        </footer>
      )}
      
      {/* Development role switcher */}
      {process.env.NODE_ENV === 'development' && currentUser && <RoleSwitcher />}
    </div>
  );
}