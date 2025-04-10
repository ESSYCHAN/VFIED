// src/components/layouts/DashboardLayout.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import BaseLayout from './BaseLayout';
import AppHeader from './AppHeader';
import Link from 'next/link';

/**
 * Dashboard layout with sidebar navigation based on user role
 * 
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Content to display
 * @param {string} props.title Page title
 */
export default function DashboardLayout({ children, title = 'Dashboard' }) {
  const router = useRouter();
  const { userRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Get sidebar navigation links based on user role
  const getSidebarNavigation = () => {
    // Default links
    const defaultLinks = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: (
          <svg className="flex-shrink-0 h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )
      },
      {
        name: 'Profile',
        href: '/profile',
        icon: (
          <svg className="flex-shrink-0 h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      }
    ];
    
    // Role-specific links
    const adminLinks = [
      {
        name: 'Admin Dashboard',
        href: '/admin/dashboard',
        icon: (
          <svg className="flex-shrink-0 h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        )
      },
      {
        name: 'Verification',
        href: '/admin/verification-dashboard',
        icon: (
          <svg className="flex-shrink-0 h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      {
        name: 'User Management',
        href: '/admin/user-management',
        icon: (
          <svg className="flex-shrink-0 h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )
      },
      {
        name: 'Settings',
        href: '/admin/settings',
        icon: (
          <svg className="flex-shrink-0 h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      }
    ];
    
    const employerLinks = [
      {
        name: 'Employer Dashboard',
        href: '/employer/dashboard',
        icon: (
          <svg className="flex-shrink-0 h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      },
      {
        name: 'Job Requisitions',
        href: '/requisitions',
        icon: (
          <svg className="flex-shrink-0 h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )
      },
      {
        name: 'Post New Job',
        href: '/requisitions/new',
        icon: (
          <svg className="flex-shrink-0 h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        )
      }
    ];
    
    const recruiterLinks = [
      {
        name: 'Recruiter Dashboard',
        href: '/recruiter/dashboard',
        icon: (
          <svg className="flex-shrink-0 h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      },
      {
        name: 'Job Requisitions',
        href: '/requisitions',
        icon: (
          <svg className="flex-shrink-0 h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )
      },
      {
        name: 'New Requisition',
        href: '/requisitions/new',
        icon: (
          <svg className="flex-shrink-0 h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        )
      }
    ];
    
    const verifierLinks = [
      {
        name: 'Verification Dashboard',
        href: '/admin/verification-dashboard',
        icon: (
          <svg className="flex-shrink-0 h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      }
    ];
    
    // Combine default links with role-specific links
    switch(userRole) {
      case 'admin':
        return [...defaultLinks, ...adminLinks];
      case 'employer':
        return [...defaultLinks, ...employerLinks];
      case 'recruiter':
        return [...defaultLinks, ...recruiterLinks];
      case 'verifier':
        return [...defaultLinks, ...verifierLinks];
      default:
        return defaultLinks;
    }
  };
  
  // Get navigation links
  const navigation = getSidebarNavigation();
  
  // Function to check if a route is active
  const isActive = (path) => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };
  
  // Create sidebar content
  const sidebar = (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex-shrink-0 px-4 flex items-center">
          <span className="text-xl font-bold text-indigo-600">VFied</span>
        </div>
        <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                isActive(item.href)
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
            >
              {React.cloneElement(item.icon, {
                className: `${
                  isActive(item.href)
                    ? 'text-indigo-500'
                    : 'text-gray-400 group-hover:text-gray-500'
                } mr-3 flex-shrink-0 h-6 w-6`
              })}
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
  
  return (
    <BaseLayout 
      title={title}
      header={<AppHeader />}
      sidebar={sidebar}
    >
      {children}
    </BaseLayout>
  );
}