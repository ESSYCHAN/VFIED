// src/components/admin/AdminNavigation.js
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AdminNavigation() {
  const router = useRouter();
  
  // Function to check if a route is active
  const isActive = (path) => {
    return router.pathname === path ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-700';
  };
  
  return (
    <nav className="bg-indigo-900 p-4 rounded-lg mb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-white font-bold text-lg">Admin Panel</h2>
        </div>
        <div className="flex flex-wrap space-x-2">
          <Link 
            href="/admin/dashboard"
            className={`px-3 py-2 rounded text-sm font-medium ${isActive('/admin/dashboard')}`}
          >
            Dashboard
          </Link>
          
          <Link 
            href="/admin/verification-dashboard"
            className={`px-3 py-2 rounded text-sm font-medium ${isActive('/admin/verification-dashboard')}`}
          >
            Verification
          </Link>
          
          <Link 
            href="/admin/user-management"
            className={`px-3 py-2 rounded text-sm font-medium ${isActive('/admin/user-management')}`}
          >
            Users
          </Link>
          
          <Link 
            href="/admin/settings"
            className={`px-3 py-2 rounded text-sm font-medium ${isActive('/admin/settings')}`}
          >
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
}