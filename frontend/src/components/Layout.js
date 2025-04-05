// src/components/Layout.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

export default function Layout({ children }) {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  
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
        {children}
      </main>
    </div>
  );
}