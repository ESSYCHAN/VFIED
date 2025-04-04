import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { styles } from '../styles/sharedStyles';

const UserRoleToggle = () => {
  const router = useRouter();
  const currentPath = router.pathname;
  const isRecruiter = currentPath.includes('/recruiter');
  const isEmployer = currentPath.includes('/employer');
  
  const handleToggle = () => {
    if (isRecruiter) {
      router.push('/employer/dashboard');
    } else if (isEmployer) {
      router.push('/dashboard');
    } else {
      router.push('/recruiter/dashboard');
    }
  };
  
  const getCurrentMode = () => {
    if (isRecruiter) return 'Recruiter';
    if (isEmployer) return 'Employer';
    return 'User';
  };
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      padding: '8px 16px'
    }}>
      <div style={{ marginRight: '12px', fontSize: '14px' }}>
        <span style={{ color: '#6b7280' }}>Mode: </span>
        <span style={{ fontWeight: '500' }}>{getCurrentMode()}</span>
      </div>
      <button
        onClick={handleToggle}
        style={{
          backgroundColor: '#5a45f8',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '6px 12px',
          fontSize: '14px',
          cursor: 'pointer'
        }}
      >
        Switch to {isRecruiter ? 'Employer' : isEmployer ? 'User' : 'Recruiter'} View
      </button>
    </div>
  );
};

export default function Layout({ children }) {
  const router = useRouter();
  
  // Wrap the useAuth call in a try-catch to handle potential errors
  let user = null;
  let loading = true;
  let logout = () => {};
  
  try {
    const auth = useAuth();
    user = auth.user;
    loading = auth.loading;
    logout = auth.logout || (() => {});
  } catch (error) {
    console.warn("Auth context error:", error.message);
    loading = false;
  }
  
  if (loading) {
    return <div>Loading...</div>; // Show loading state
  }
  
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };
  
  return (
    <div>
      <nav style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          Home
        </Link>
        
        {/* Add Employer Link - Only show if user is employer */}
        {user?.role === 'employer' && (
          <Link href="/employer-dashboard" style={{ textDecoration: 'none' }}>
            Employer Dashboard
          </Link>
        )}
        {/* Existing Recruiter Link */}
        {user?.role === 'recruiter' && (
          <Link href="/recruiter/dashboard" style={{ textDecoration: 'none' }}>
            Recruiter Dashboard
          </Link>
        )}
        <Link href="/profile" style={{ textDecoration: 'none' }}>
          Profile
        </Link>
      </nav>
      <main>{children}</main>
      <UserRoleToggle />
    </div>
  );
}