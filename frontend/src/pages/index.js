import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set a small delay to ensure authentication state is properly loaded
    const checkAuth = setTimeout(() => {
      setLoading(false);
      // If user is already logged in, redirect to dashboard
      if (currentUser) {
        router.push('/dashboard');
      }
    }, 500);
    
    return () => clearTimeout(checkAuth);
  }, [currentUser, router]);

  // Show a loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Only show the landing page if not authenticated
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>VFied - Your Credentials, Your Super-Power</title>
        <meta name="description" content="Verify once, apply never. Let employers discover you based on your verified achievements." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">VFied</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <span className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 cursor-pointer">
                  Sign in
                </span>
              </Link>
              <Link href="/signup">
                <span className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
                  Sign up
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <div className="pt-10 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
          <div className="mx-auto max-w-7xl lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8">
              <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 sm:text-center lg:px-0 lg:text-left lg:flex lg:items-center">
                <div className="lg:py-24">
                  <h1 className="mt-4 text-4xl tracking-tight font-extrabold text-gray-900 sm:mt-5 sm:text-6xl lg:mt-6">
                    <span className="block">Your Credentials,</span>
                    <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Your Super-Power</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg">
                    Verify once, apply never. Let employers discover you based on your verified achievements.
                  </p>
                  <div className="mt-10 sm:mt-12">
                    <div className="sm:flex sm:justify-center lg:justify-start">
                      <div className="rounded-md shadow">
                        <Link href="/signup">
                          <span className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 md:py-4 md:text-lg md:px-10 cursor-pointer">
                            Get started
                          </span>
                        </Link>
                      </div>
                      <div className="mt-3 sm:mt-0 sm:ml-3">
                        <Link href="/login">
                          <span className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10 cursor-pointer">
                            Sign in
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-12 -mb-16 sm:-mb-48 lg:m-0 lg:relative">
                <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 lg:max-w-none lg:px-0">
                  {/* Hero image */}
                  <div className="w-full lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-auto lg:max-w-none">
                    <svg className="w-full" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="600" height="600" fill="white"/>
                      <path d="M370.178 208.743L299.096 169.773L228.014 208.743V286.682L299.096 325.652L370.178 286.682V208.743Z" stroke="#4F46E5" strokeWidth="8"/>
                      <rect x="202.096" y="312.167" width="194" height="194" rx="20" fill="#F9FAFB" stroke="#4F46E5" strokeWidth="6"/>
                      <path d="M281.096 379.167L302.096 400.167L337.096 365.167" stroke="#4F46E5" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="225.096" y="429.167" width="148" height="10" rx="5" fill="#E5E7EB"/>
                      <rect x="245.096" y="452.167" width="108" height="10" rx="5" fill="#E5E7EB"/>
                      <rect x="226.096" y="139.167" width="146" height="146" rx="20" fill="#F9FAFB" stroke="#4F46E5" strokeWidth="6"/>
                      <path d="M274.096 201.167L295.096 222.167L330.096 187.167" stroke="#4F46E5" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="385.096" y="239.167" width="120" height="120" rx="20" fill="#F9FAFB" stroke="#4F46E5" strokeWidth="6"/>
                      <path d="M423.096 294.167L444.096 315.167L479.096 280.167" stroke="#4F46E5" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="95.0959" y="239.167" width="120" height="120" rx="20" fill="#F9FAFB" stroke="#4F46E5" strokeWidth="6"/>
                      <path d="M133.096 294.167L154.096 315.167L189.096 280.167" stroke="#4F46E5" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Features</h2>
              <p className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight">
                A new way to showcase your credentials
              </p>
              <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
                Never worry about verification or applications again.
              </p>
            </div>

            <div className="mt-12">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {/* Feature 1 */}
                <div className="pt-6">
                  <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-md shadow-lg">
                          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900">Verified Credentials</h3>
                      <p className="mt-5 text-base text-gray-500">
                        Import and verify your degrees, work history, and skills with one-click verification.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="pt-6">
                  <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-md shadow-lg">
                          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900">You Own Your Data</h3>
                      <p className="mt-5 text-base text-gray-500">
                        Take control of your professional identity. Grant and revoke access to your verified profile.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="pt-6">
                  <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-md shadow-lg">
                          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900">Anti-Ghosting Protection</h3>
                      <p className="mt-5 text-base text-gray-500">
                        Employers make a commitment when they contact you. No more unresponsive recruiters.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How it works section */}
        <div className="py-16 bg-gray-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Process</h2>
              <p className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight">
                How VFied Works
              </p>
              <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
                A simple three-step process to revolutionize your job search.
              </p>
            </div>

            <div className="mt-12">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                {/* Step 1 */}
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-indigo-600 text-white text-xl font-bold">
                    1
                  </div>
                  <h3 className="mt-6 text-lg font-medium text-gray-900">Import Your Credentials</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Connect LinkedIn, GitHub, or upload certificates. VFied does the verification.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-indigo-600 text-white text-xl font-bold">
                    2
                  </div>
                  <h3 className="mt-6 text-lg font-medium text-gray-900">Set Your Preferences</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Specify desired roles, salary, and which credentials employers can see.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-indigo-600 text-white text-xl font-bold">
                    3
                  </div>
                  <h3 className="mt-6 text-lg font-medium text-gray-900">Receive Job Offers</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Let employers discover and contact you based on verified skills and experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Ready to revolutionize your job search?</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-indigo-200">
              Join VFied today and let your verified credentials speak for themselves.
            </p>
            <Link href="/signup">
              <span className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto cursor-pointer">
                Sign up for free
              </span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-500">
            &copy; 2025 VFied. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}