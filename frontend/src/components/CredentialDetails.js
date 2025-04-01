import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { styles } from '../styles/sharedStyles';

export default function CredentialDetails({ credential, onClose, onUpdate, onDelete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { currentUser } = useAuth();

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    switch(status) {
      case 'verified':
        return { ...styles.badge, ...styles.badgeSuccess };
      case 'pending':
        return { ...styles.badge, ...styles.badgeWarning };
      case 'rejected':
        return { ...styles.badge, ...styles.badgeDanger };
      default:
        return { ...styles.badge, ...styles.badgeInfo };
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this credential? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Delete the credential from Firestore
      await deleteDoc(doc(db, 'credentials', credential.id));
      
      // Notify parent component
      if (onDelete) {
        onDelete();
      }
      
      // Close the modal
      if (onClose) {
        onClose();
      }
      
    } catch (error) {
      console.error("Error deleting credential:", error);
      setError("Failed to delete credential: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const customStyles = {
    modalOverlay: {
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
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '8px',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'auto',
      position: 'relative'
    },
    modalHeader: {
      padding: '16px 24px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    modalBody: {
      padding: '24px'
    },
    modalFooter: {
      padding: '16px 24px',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#6b7280'
    },
    detailRow: {
      marginBottom: '16px'
    },
    detailLabel: {
      fontWeight: '500',
      color: '#6b7280',
      fontSize: '14px',
      marginBottom: '4px'
    },
    detailValue: {
      color: '#111827',
      fontSize: '16px'
    },
    documentPreview: {
      display: 'flex',
      alignItems: 'center',
      padding: '16px',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      marginTop: '8px'
    },
    documentIcon: {
      fontSize: '24px',
      marginRight: '12px',
      color: '#5a45f8'
    },
    documentLink: {
      color: '#5a45f8',
      textDecoration: 'none',
      fontWeight: '500'
    },
    typeIcon: {
      marginRight: '8px',
      fontSize: '16px'
    },
    verificationInfo: {
      backgroundColor: '#f9fafb',
      borderRadius: '6px',
      padding: '16px',
      marginTop: '24px'
    },
    verificationTitle: {
      fontWeight: '600',
      marginBottom: '8px',
      fontSize: '14px'
    },
    verificationDetail: {
      color: '#6b7280',
      fontSize: '14px'
    }
  };

  return (
    <div style={customStyles.modalOverlay}>
      <div style={customStyles.modalContent}>
        <div style={customStyles.modalHeader}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Credential Details</h2>
          <button 
            style={customStyles.closeButton}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div style={customStyles.modalBody}>
          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}
          
          {success && (
            <div style={styles.success}>
              {success}
            </div>
          )}
          
          <div style={customStyles.detailRow}>
            <div style={customStyles.detailLabel}>Status</div>
            <div style={getStatusBadge(credential.verificationStatus)}>
              {credential.verificationStatus.charAt(0).toUpperCase() + credential.verificationStatus.slice(1)}
            </div>
          </div>
          
          <div style={customStyles.detailRow}>
            <div style={customStyles.detailLabel}>Type</div>
            <div style={customStyles.detailValue}>
              <span style={customStyles.typeIcon}>
                {credential.type === 'education' ? '🎓' : 
                 credential.type === 'work' ? '💼' : 
                 credential.type === 'certificate' ? '📜' : 
                 credential.type === 'skill' ? '⚡' : '📄'}
              </span>
              {credential.type.charAt(0).toUpperCase() + credential.type.slice(1)}
            </div>
          </div>
          
          <div style={customStyles.detailRow}>
            <div style={customStyles.detailLabel}>Title</div>
            <div style={customStyles.detailValue}>{credential.title}</div>
          </div>
          
          <div style={customStyles.detailRow}>
            <div style={customStyles.detailLabel}>Issuer</div>
            <div style={customStyles.detailValue}>{credential.issuer}</div>
          </div>
          
          <div style={customStyles.detailRow}>
            <div style={customStyles.detailLabel}>Date Issued</div>
            <div style={customStyles.detailValue}>{formatDate(credential.dateIssued)}</div>
          </div>
          
          {credential.documentUrl && (
            <div style={customStyles.detailRow}>
              <div style={customStyles.detailLabel}>Document</div>
              <div style={customStyles.documentPreview}>
                <span style={customStyles.documentIcon}>📄</span>
                <div>
                  <div style={{ marginBottom: '4px' }}>{credential.metadata?.fileName || 'Document'}</div>
                  <a 
                    href={credential.documentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={customStyles.documentLink}
                  >
                    View Document
                  </a>
                </div>
              </div>
            </div>
          )}
          
          <div style={customStyles.verificationInfo}>
            <div style={customStyles.verificationTitle}>Verification Information</div>
            <div style={customStyles.verificationDetail}>
              {credential.verificationStatus === 'verified' ? (
                <>This credential has been verified. It can be shared with employers.</>
              ) : credential.verificationStatus === 'pending' ? (
                <>This credential is pending verification. Our team will review it shortly.</>
              ) : (
                <>
                  This credential could not be verified. Please make sure the document you've uploaded 
                  is clear and contains all necessary information.
                </>
              )}
            </div>
          </div>
        </div>
        
        <div style={customStyles.modalFooter}>
          <button 
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Credential'}
          </button>
          <button 
            style={{
              backgroundColor: '#e5e7eb',
              color: '#111827',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}