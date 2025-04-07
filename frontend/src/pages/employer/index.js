// src/pages/employer/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function EmployerHome() {
  const router = useRouter();
  const { currentUser, userRole } = useAuth();
  
  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    } else if (userRole !== 'employer') {
      router.push('/dashboard');
    }
  }, [currentUser, userRole, router]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          {/* Quick Links */}
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Quick Links</h3>
              <p className="mt-1 text-sm text-gray-600">
                Manage your recruitment activities
              </p>
            </div>
          </div>
          
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">Job Requisitions</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create and manage job postings to find the right candidates
                  </p>
                  <div className="mt-4">
                    <Link
                      href="/requisitions"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Manage Requisitions
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">Candidate Management</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Review candidates who have applied to your jobs
                  </p>
                  <div className="mt-4">
                    <Link
                      href="/candidates"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      View Candidates
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}