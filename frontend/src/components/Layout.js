// Updated Layout.js with Job Requisitions navigation
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { styles } from '../styles/sharedStyles';

// UserRoleToggle component
const UserRoleToggle = () => {
  const router = useRouter();
  const currentPath = router.pathname;
  const isRecruiter = currentPath.includes('/recruiter');
  
  const handleToggle = () => {
    if (isRecruiter) {
      router.push('/dashboard');
    } else {
      router.push('/recruiter/dashboard');
    }
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
        <span style={{ fontWeight: '500' }}>{isRecruiter ? 'Recruiter' : 'User'}</span>
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
        Switch to {isRecruiter ? 'User' : 'Recruiter'} View
      </button>
    </div>
  );
};

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

  // Check if user has employer/recruiter role
  const isEmployerOrRecruiter = currentUser && 
    (currentUser.role === 'employer' || currentUser.role === 'recruiter' || currentUser.role === 'admin');
  
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={styles.logo}>VFied</div>
        </Link>
        <nav style={styles.nav}>
          <Link 
            href="/dashboard" 
            style={{
              ...styles.navLink, 
              ...(router.pathname === '/dashboard' ? styles.activeNavLink : {})
            }}
          >
            Dashboard
          </Link>
          
          {/* Only show requisitions link to employers/recruiters */}
          {isEmployerOrRecruiter && (
            <Link 
              href="/requisitions" 
              style={{
                ...styles.navLink, 
                ...(router.pathname.startsWith('/requisitions') ? styles.activeNavLink : {})
              }}
            >
              Job Requisitions
            </Link>
          )}
          
          {/* Admin verification link */}
          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'verifier') && (
            <Link 
              href="/admin/verification" 
              style={{
                ...styles.navLink, 
                ...(router.pathname.startsWith('/admin/verification') ? styles.activeNavLink : {})
              }}
            >
              Verification Admin
            </Link>
          )}
          
          <Link 
            href="/profile" 
            style={{
              ...styles.navLink, 
              ...(router.pathname === '/profile' ? styles.activeNavLink : {})
            }}
          >
            Profile
          </Link>
          <Link 
            href="/settings" 
            style={{
              ...styles.navLink, 
              ...(router.pathname === '/settings' ? styles.activeNavLink : {})
            }}
          >
            Settings
          </Link>
          <button 
            onClick={handleLogout} 
            style={{
              ...styles.navLink, 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </nav>
      </header>
      <main style={styles.main}>
        {children}
      </main>
      
      {/* Add the UserRoleToggle component */}
      <UserRoleToggle />
    </div>
  );
}