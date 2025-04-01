// src/components/CredentialCard.js
import React, { useState } from 'react';
import Link from 'next/link';
import VerificationRequestForm from './VerificationRequestForm';

const CredentialCard = ({ credential, onUpdate }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  
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

  // Get status badge style
  const getStatusBadge = (status) => {
    const baseStyle = {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500'
    };
    
    const styles = {
      verified: { 
        ...baseStyle, 
        backgroundColor: '#d1fae5', 
        color: '#166534' 
      },
      pending: { 
        ...baseStyle, 
        backgroundColor: '#fef3c7', 
        color: '#92400e' 
      },
      inProgress: { 
        ...baseStyle, 
        backgroundColor: '#dbeafe', 
        color: '#1e40af' 
      },
      rejected: { 
        ...baseStyle, 
        backgroundColor: '#fee2e2', 
        color: '#b91c1c' 
      },
      draft: { 
        ...baseStyle, 
        backgroundColor: '#f3f4f6', 
        color: '#374151' 
      }
    };
    
    return styles[status] || styles.draft;
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
    if (e) e.preventDefault();
    setShowVerificationForm(true);
  };
  
  const handleVerificationComplete = (data) => {
    // Update the credential in the parent component
    if (onUpdate) {
      credential.verificationStatus = 'pending';
      credential.verificationRequestId = data.requestId;
      credential.dateSubmitted = new Date().toISOString();
      onUpdate();
    }
    
    setTimeout(() => {
      setShowVerificationForm(false);
    }, 2000);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
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
  
  // Show verification form as a modal
  if (showVerificationForm) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          width: '90%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <VerificationRequestForm
            credential={credential}
            onComplete={handleVerificationComplete}
            onCancel={() => setShowVerificationForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'white',
        marginBottom: '16px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        boxShadow: isHovered ? '0 4px 6px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {getTypeIcon(credential.type)}
          <span style={{ 
            fontSize: '14px', 
            color: '#6b7280',
            textTransform: 'capitalize'
          }}>
            {credential.type ? credential.type : 'Document'}
          </span>
        </div>
        <div style={getStatusBadge(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>
      
      <h3 style={{ 
        fontSize: '16px', 
        fontWeight: '600', 
        marginBottom: '4px'
      }}>
        {credential.title}
      </h3>
      
      {credential.issuer && (
        <p style={{ 
          fontSize: '14px', 
          color: '#6b7280', 
          marginBottom: '8px'
        }}>
          {credential.issuer}
        </p>
      )}
      
      <p style={{ fontSize: '12px', color: '#6b7280' }}>
        {credential.dateIssued ? 
          `Issued: ${formatDate(credential.dateIssued)}` : 
          `Uploaded: ${formatDate(credential.createdAt || credential.dateUploaded)}`}
      </p>
      
      {/* Verification banner for verified credentials */}
      {status === 'verified' && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: '#f0fdf4',
          padding: '8px 12px',
          borderRadius: '6px',
          marginTop: '12px',
          marginBottom: '12px',
          fontSize: '14px',
          color: '#166534'
        }}>
          <div style={{ fontSize: '16px', marginRight: '8px' }}>✓</div>
          <div>Blockchain Verified</div>
        </div>
      )}
      
      {/* Pending verification banner */}
      {status === 'pending' && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: '#fffbeb',
          padding: '8px 12px',
          borderRadius: '6px',
          marginTop: '12px',
          marginBottom: '12px',
          fontSize: '14px',
          color: '#92400e'
        }}>
          <div style={{ fontSize: '16px', marginRight: '8px' }}>⏳</div>
          <div>Verification in progress</div>
        </div>
      )}
      
      {/* In Progress verification banner */}
      {status === 'inProgress' && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: '#eff6ff',
          padding: '8px 12px',
          borderRadius: '6px',
          marginTop: '12px',
          marginBottom: '12px',
          fontSize: '14px',
          color: '#1e40af'
        }}>
          <div style={{ fontSize: '16px', marginRight: '8px' }}>🔍</div>
          <div>Verification details being confirmed</div>
        </div>
      )}
      
      {/* Rejected verification banner */}
      {status === 'rejected' && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: '#fef2f2',
          padding: '8px 12px',
          borderRadius: '6px',
          marginTop: '12px',
          marginBottom: '12px',
          fontSize: '14px',
          color: '#b91c1c'
        }}>
          <div style={{ fontSize: '16px', marginRight: '8px' }}>❌</div>
          <div>Verification failed. See details.</div>
        </div>
      )}
      
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
          
          {(status === 'rejected') && (
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
              Resubmit
            </button>
          )}
          
          <Link
            href={`/credentials/${credential.id}`}
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

export default CredentialCard;