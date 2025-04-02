// src/pages/dashboard.js
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import Layout from '../components/Layout';
import Head from 'next/head';
import { styles } from '../styles/sharedStyles';
import Link from 'next/link';
import { performSkillsAssessment, getJobCandidates } from '../services/recruitmentService';
import AIJobMatching from '../components/AIJobMatching';
import CredentialUploadForm from '../components/CredentialUploadForm';
import ErrorHandler from '../components/ErrorHandler';
import { useRouter } from 'next/router';  // Add this import

// // Import all the components used
// import CredentialCard from '../components/CredentialCard';
// import StatCard from '../components/StatCard';
// import AIJobMatching from '../components/AIJobMatching';
// import CredentialUploadForm from '../components/CredentialUploadForm';
// const router = useRouter(); 

// Credential Card Component

const CredentialCard = ({ credential, onUpdate }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (error) {
      console.error("Date formatting error:", error);
      return 'Invalid date';
    }
  };

  const router = useRouter();  // Initialize the router

  // Get status badge style
  const getStatusBadge = (status) => {
    switch(status) {
      case 'verified':
        return { ...styles.badge, ...styles.badgeSuccess };
      case 'pending':
        return { ...styles.badge, ...styles.badgeWarning };
      case 'rejected':
        return { ...styles.badge, ...styles.badgeDanger };
      case 'draft':
        return { ...styles.badge, ...styles.badgeInfo };
      default:
        return { ...styles.badge, ...styles.badgeInfo };
    }
  };

  // Get icon and color for credential type
  const getTypeIcon = (type) => {
    return (
      <div style={{ fontSize: '16px', marginRight: '8px' }}>
        {type === 'education' ? '🎓' : 
         type === 'work' ? '💼' : 
         type === 'certificate' ? '📜' : 
         type === 'skill' ? '⚡' : '📄'}
      </div>
    );
  };

  const handleRequestVerification = async (e) => {
    e.stopPropagation();
    if (credential.verificationStatus !== 'draft' && credential.status !== 'draft') {
      return;
    }
    
    try {
      setIsRequesting(true);
      
      // In a real implementation, you would update the Firestore document
      // For now, we'll simulate this with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert('Verification request submitted successfully. Status changed to pending.');
      
      // Update the credential locally to show the new status
      credential.verificationStatus = 'pending';
      credential.status = 'pending';
      
      onUpdate(); // Refresh the list
    } catch (error) {
      console.error('Failed to request verification:', error);
      alert('Failed to request verification. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this credential?')) {
      try {
        setIsDeleting(true);
        // This would be replaced with your actual API call
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        onUpdate(); // Refresh the list
      } catch (error) {
        console.error('Failed to delete credential:', error);
        alert('Failed to delete credential. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const status = credential.verificationStatus || credential.status || 'draft';

  return (
    <div 
      style={{
        ...styles.credentialCard,
        ...(isHovered ? styles.credentialCardHover : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {getTypeIcon(credential.type)}
          <span style={styles.credentialType}>
            {credential.type ? (credential.type.charAt(0).toUpperCase() + credential.type.slice(1)) : 'Document'}
          </span>
        </div>
        <div style={getStatusBadge(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>
      
      <h3 style={styles.credentialTitle}>{credential.title}</h3>
      {credential.issuer && <p style={styles.credentialIssuer}>{credential.issuer}</p>}
      
      <p style={{ fontSize: '12px', color: '#6b7280' }}>
        {credential.dateIssued ? 
          `Issued: ${formatDate(credential.dateIssued)}` : 
          `Uploaded: ${formatDate(credential.createdAt || credential.dateUploaded)}`}
      </p>
      
      // In the CredentialCard component
<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
  {(credential.documentUrl || credential.fileUrl) ? (
    <a 
      href={credential.documentUrl || credential.fileUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      style={{ color: '#5a45f8', fontSize: '12px', fontWeight: '500', textDecoration: 'none' }}
    >
      View Document
    </a>
  ) : (
    <span></span>
  )}
  
  <div>
    {(status === 'draft') && (
      <button 
        style={{ 
          backgroundColor: 'transparent', 
          border: 'none', 
          color: '#15803d', 
          fontSize: '12px',
          fontWeight: '500',
          cursor: 'pointer',
          marginLeft: '8px'
        }}
        onClick={handleRequestVerification}
        disabled={isRequesting}
      >
        {isRequesting ? 'Requesting...' : 'Request Verification'}
      </button>
    )}
    
    <Link href={`/credentials/${credential.id}`}
      
        style={{ 
          backgroundColor: 'transparent', 
          border: 'none', 
          color: '#5a45f8', 
          fontSize: '12px',
          fontWeight: '500',
          cursor: 'pointer',
          marginLeft: '8px',
          textDecoration: 'none'
        }}
      >
        Details
      
    </Link>
    
    <button 
      style={{ 
        backgroundColor: 'transparent', 
        border: 'none', 
        color: '#b91c1c', 
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        marginLeft: '8px'
      }}
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  </div>
</div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, color, icon }) => {
  return (
    <div style={styles.statCard}>
      <div style={styles.flexBetween}>
        <div>
          <p style={styles.statLabel}>{title}</p>
          <p style={{ ...styles.statValue, color }}>{value}</p>
        </div>
        <div style={{ 
          width: '36px', 
          height: '36px', 
          borderRadius: '8px',
          backgroundColor: color + '10', // 10% opacity
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
};



// Add this function to the Dashboard component
const handleRetry = async () => {
  setError(null);
  setLoading(true);
  
  // Short delay to show loading state
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // Check network connectivity first
    const online = navigator.onLine;
    if (!online) {
      throw new Error("You appear to be offline. Please check your internet connection.");
    }
    
    // Try to fetch credentials again
    if (currentUser) {
      const q = query(
        collection(db, 'credentials'), 
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const credentialsList = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        credentialsList.push({
          id: doc.id,
          ...data,
          dateIssued: data.dateIssued?.toDate?.()?.toISOString() || data.dateIssued,
          dateUploaded: data.dateUploaded?.toDate?.()?.toISOString() || data.dateUploaded
        });
      });
      
      if (credentialsList.length > 0) {
        setCredentials(credentialsList);
        updateStats(credentialsList);
        setError(null);
      } else {
        setCredentials(mockCredentials);
        updateStats(mockCredentials);
        setError("No credentials found. Using sample data for demonstration.");
      }
    } else {
      throw new Error("User authentication required.");
    }
  } catch (err) {
    console.error("Retry failed:", err);
    setCredentials(mockCredentials);
    updateStats(mockCredentials);
    
    if (err.message.includes("offline")) {
      setError(err.message);
    } else {
      setError("There was an error loading your credentials. Mock data is shown below.");
    }
  } finally {
    setLoading(false);
  }
};

// Then update the "Try Again" button to use this function
<button 
  onClick={handleRetry}
  style={{
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    background: '#5a45f8',
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer',
  }}
>
  Try Again
</button>


// Main Dashboard Component
export default function Dashboard() {
  const { currentUser } = useAuth();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0
  });
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [error, setError] = useState(null);
  const [showAIFeatures, setShowAIFeatures] = useState(false);
  const router = useRouter();  // Initialize the router
  // Create some mock credentials if needed
  const mockCredentials = [
    {
      id: "mock1",
      title: "Bachelor of Computer Science",
      type: "education",
      issuer: "MIT",
      dateIssued: "2020-05-15",
      verificationStatus: "verified",
      dateUploaded: new Date().toISOString()
    },
    {
      id: "mock2",
      title: "Senior Software Engineer",
      type: "work",
      issuer: "Google",
      dateIssued: "2021-06-01",
      verificationStatus: "pending",
      dateUploaded: new Date().toISOString()
    },
    {
      id: "mock3",
      title: "Machine Learning Certification",
      type: "certificate",
      issuer: "Coursera",
      dateIssued: "2022-01-10",
      verificationStatus: "draft",
      dateUploaded: new Date().toISOString()
    }
  ];

  useEffect(() => {
    console.log("Dashboard component initialized");

    const handleLogout = async () => {
      try {
        await logout(); // Your logout function from AuthContext
        router.push('/'); // Go back to landing page
      } catch (error) {
        console.error("Failed to log out", error);
      }
    };
    

    
    // Modify the fetchCredentials function in the useEffect hook:

async function fetchCredentials() {
  if (!currentUser) {
    console.log("No user authenticated, waiting...");
    return;
  }
  
  console.log("Attempting to fetch credentials for user:", currentUser.uid);
  setLoading(true);
  
  try {
    // Check if there's a valid user token before querying
    if (!currentUser.uid) {
      throw new Error("User ID not available");
    }

    // Fix the query to ensure it works with your Firestore structure
    const q = query(
      collection(db, 'credentials'), 
      where('userId', '==', currentUser.uid)
      // Remove the orderBy temporarily to eliminate potential index issues
    );
    
    const querySnapshot = await getDocs(q);
    const credentialsList = [];
    
    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        credentialsList.push({
          id: doc.id,
          ...data,
          dateIssued: data.dateIssued?.toDate?.()?.toISOString() || data.dateIssued,
          dateUploaded: data.dateUploaded?.toDate?.()?.toISOString() || data.dateUploaded
        });
      } catch (docError) {
        console.error("Error processing document:", docError);
      }
    });
    
    console.log("Fetched credentials:", credentialsList);
    
    if (credentialsList.length === 0) {
      console.log("No credentials found, using mock data for demo");
      setCredentials(mockCredentials);
    } else {
      setCredentials(credentialsList);
    }
    
    // Calculate stats based on the actual data we have
    updateStats(credentialsList.length > 0 ? credentialsList : mockCredentials);
    
  } catch (error) {
    console.error("Error fetching credentials:", error);
    console.error("Error details:", error.code, error.message);
    
    setCredentials(mockCredentials);
    
    // Provide more detailed error messaging
    if (error.code === 'permission-denied') {
      setError("You don't have permission to access these credentials.");
    } else if (error.code === 'unavailable') {
      setError("Connection to database failed. Please check your internet connection.");
    } else {
      setError("There was an error loading your credentials. Mock data is shown below.");
    }
  } finally {
    setLoading(false);
  }
}

// Add a utility function to update stats correctly
function updateStats(credsList) {
  const statsCounts = credsList.reduce((acc, credential) => {
    acc.total += 1;
    
    const status = credential.verificationStatus || credential.status;
    
    if (status === 'verified') {
      acc.verified += 1;
    } else if (status === 'pending') {
      acc.pending += 1;
    } else if (status === 'rejected') {
      acc.rejected += 1;
    }
    
    return acc;
  }, { total: 0, verified: 0, pending: 0, rejected: 0 });
  
  setStats(statsCounts);
}
    
    fetchCredentials();
  }, [currentUser]);

  const handleCredentialUpload = (newCredential) => {
    // Add the new credential to the list
    const updatedCredentials = [newCredential, ...credentials];
    setCredentials(updatedCredentials);
    
    // Update stats
    setStats({
      ...stats,
      total: stats.total + 1
    });
    
    setShowUploader(false);
  };

  const refreshCredentials = () => {
    // Simply reload the page for now
    // This can be optimized later to just fetch the data
    setLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };


  const getFilteredCredentials = () => {
    return credentials.filter(cred => {
      const status = cred.verificationStatus || cred.status;
      const typeMatch = activeTypeFilter === 'all' || cred.type === activeTypeFilter;
      const statusMatch = activeFilter === 'all' || status === activeFilter;
      return typeMatch && statusMatch;
    });
  };

  return (
    <Layout>
      <Head>
        <title>Dashboard - VFied</title>
      </Head>
      
      <div style={styles.flexBetween}>
        <div>
          <h1 style={styles.title}>Your Credentials</h1>
          <p style={styles.subtitle}>
            Manage your verified credentials and upload new ones.
          </p>
        </div>
        <button
          onClick={() => setShowUploader(!showUploader)}
          style={styles.button}
        >
          {showUploader ? 'Hide Uploader' : '+ Add Credential'}
        </button>
      </div>
      
      {/* AI Features Toggle */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '16px'
      }}>
        <button
          onClick={() => setShowAIFeatures(!showAIFeatures)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: showAIFeatures ? '#5a45f8' : 'transparent',
            color: showAIFeatures ? 'white' : '#5a45f8',
            border: showAIFeatures ? 'none' : '1px solid #5a45f8',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <span>AI Features</span>
          <span style={{ fontSize: '18px' }}>{showAIFeatures ? '✓' : '🔍'}</span>
        </button>
      </div>
      
      {/* AI Skills Assessment (only shown when AI Features is on) */}
      {showAIFeatures && (
        <AIJobMatching 
          userId={currentUser?.uid}
          credentials={credentials}
        />
      )}
      
      {/* Credential Upload Form */}
      {showUploader && (
        <CredentialUploadForm 
          onClose={() => setShowUploader(false)}
          onUploadSuccess={handleCredentialUpload}
        />
      )}
      
      {/* Stats Cards */}
      {credentials.length > 0 && (
        <div style={styles.statsGrid}>
          <StatCard 
            title="Total Credentials" 
            value={stats.total} 
            color="#5a45f8" 
            icon="📊"
          />
          <StatCard 
            title="Verified" 
            value={stats.verified} 
            color="#15803d" 
            icon="✓"
          />
          <StatCard 
            title="Pending" 
            value={stats.pending} 
            color="#c2410c" 
            icon="⏳"
          />
          <StatCard 
            title="Rejected" 
            value={stats.rejected} 
            color="#b91c1c" 
            icon="✗"
          />
        </div>
      )}
      {credentials.filter(c => c.verificationStatus === 'verified').length > 0 && (
  <div style={{ ...styles.card, marginBottom: '24px', borderLeft: '4px solid #16a34a' }}>
    <h2 style={{ 
      fontSize: '18px', 
      fontWeight: '600', 
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <span style={{ fontSize: '24px' }}>🔒</span>
      <span>Blockchain Verified Credentials</span>
    </h2>
    
    <p style={{ marginBottom: '16px' }}>
      You have {credentials.filter(c => c.verificationStatus === 'verified').length} verified credentials that are secured on the blockchain.
      These credentials can be shared with recruiters and organizations with cryptographic proof of authenticity.
    </p>
    
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
      {credentials
        .filter(c => c.verificationStatus === 'verified')
        .slice(0, 3)
        .map((credential, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: '#f0fdf4',
            padding: '8px 12px',
            borderRadius: '20px',
            fontSize: '14px'
          }}>
            <span style={{ marginRight: '8px', color: '#16a34a' }}>✓</span>
            {credential.title}
          </div>
        ))}
      {credentials.filter(c => c.verificationStatus === 'verified').length > 3 && (
        <div style={{ 
          backgroundColor: '#f9fafb',
          padding: '8px 12px',
          borderRadius: '20px',
          fontSize: '14px'
        }}>
          +{credentials.filter(c => c.verificationStatus === 'verified').length - 3} more
        </div>
      )}
    </div>
    
    <Link 
  href="/dashboard?filter=verified"
  style={{ 
    color: '#16a34a',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  }}
>
        View all verified credentials →
 
    </Link>
  </div>
)}
      
      {/* Loading State */}
      {loading ? (
        <div style={{ ...styles.card, textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>⟳</div>
          <p style={{ color: '#6b7280' }}>Loading credentials...</p>
        </div>
      ) : error ? (
        <div style={{ ...styles.card, textAlign: 'center', padding: '32px' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px', color: '#ef4444' }}>⚠️</div>
          <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
          <button 
            onClick={refreshCredentials}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: '#5a45f8',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      ) : credentials.length === 0 ? (
        <div style={{ ...styles.card, textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', color: '#d1d5db' }}>📄</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>No credentials yet</h3>
          <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto 24px' }}>
            Get started by adding your first credential. Upload your education, work experience, certificates, or skills.
          </p>
          <button 
            onClick={() => setShowUploader(true)}
            style={styles.button}
          >
            Add Your First Credential
          </button>
        </div>
      ) : (
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Your Credentials</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select 
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: '6px', 
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
                value={activeTypeFilter}
                onChange={(e) => setActiveTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="education">Education</option>
                <option value="work">Work</option>
                <option value="certificate">Certificate</option>
                <option value="skill">Skill</option>
              </select>
              <select 
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: '6px', 
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          
          <div style={styles.credentialGrid}>
            {getFilteredCredentials().map((credential) => (
              <CredentialCard 
                key={credential.id} 
                credential={credential} 
                onUpdate={refreshCredentials}
              />
            ))}
          </div>
          
          {getFilteredCredentials().length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280' }}>
              <p>No credentials match your current filters.</p>
            </div>
          )}
        </div>
        
      )}
      <Link 
  href="/admin/verification"
  style={{
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: router.pathname === '/admin/verification' ? '#f3f4f6' : 'transparent'
  }}
>
  <span style={{ marginRight: '12px', fontSize: '18px' }}>🔍</span>
  Verification Requests
</Link>
    </Layout>
  );
}