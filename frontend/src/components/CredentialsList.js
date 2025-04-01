// src/components/CredentialsList.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteCredential, requestVerification } from '../services/credentialService';

const CredentialsList = ({ credentials, onUpdate }) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(null);
  const [isRequesting, setIsRequesting] = useState(null);

  // Shared styles from our styling system
  const styles = {
    container: {
      width: '100%',
      marginBottom: '20px',
    },
    credentialCard: {
      padding: '16px',
      marginBottom: '16px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      borderLeft: '4px solid #4A90E2',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'pointer',
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
    },
    credentialTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333',
      margin: 0,
    },
    credentialType: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '8px',
    },
    statusBadge: (status) => {
      const statusColors = {
        pending: { bg: '#FFF8E1', text: '#F57C00' },
        verified: { bg: '#E8F5E9', text: '#388E3C' },
        rejected: { bg: '#FFEBEE', text: '#D32F2F' },
        draft: { bg: '#E3F2FD', text: '#1976D2' },
      };
      
      const color = statusColors[status] || statusColors.draft;
      
      return {
        display: 'inline-block',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        backgroundColor: color.bg,
        color: color.text,
      };
    },
    date: {
      fontSize: '12px',
      color: '#999',
      marginTop: '8px',
    },
    buttonsContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
      marginTop: '12px',
    },
    button: {
      padding: '6px 12px',
      borderRadius: '4px',
      border: 'none',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    viewButton: {
      backgroundColor: '#4A90E2',
      color: 'white',
    },
    verifyButton: {
      backgroundColor: '#4CAF50',
      color: 'white',
    },
    deleteButton: {
      backgroundColor: '#F44336',
      color: 'white',
    },
    emptyState: {
      textAlign: 'center',
      padding: '30px',
      color: '#666',
    },
    hoverCard: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    }
  };

  const handleCardClick = (credentialId) => {
    navigate(`/credentials/${credentialId}`);
  };

  const handleVerifyClick = async (e, credentialId) => {
    e.stopPropagation(); // Prevent card click
    try {
      setIsRequesting(credentialId);
      await requestVerification(credentialId);
      onUpdate(); // Refresh the list
    } catch (error) {
      console.error('Failed to request verification:', error);
      alert('Failed to request verification. Please try again.');
    } finally {
      setIsRequesting(null);
    }
  };

  const handleDeleteClick = async (e, credentialId) => {
    e.stopPropagation(); // Prevent card click
    if (window.confirm('Are you sure you want to delete this credential?')) {
      try {
        setIsDeleting(credentialId);
        await deleteCredential(credentialId);
        onUpdate(); // Refresh the list
      } catch (error) {
        console.error('Failed to delete credential:', error);
        alert('Failed to delete credential. Please try again.');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div style={styles.container}>
      {credentials.length === 0 ? (
        <div style={styles.emptyState}>
          <p>You haven't added any credentials yet.</p>
          <p>Upload your first credential to get started!</p>
        </div>
      ) : (
        credentials.map((credential) => (
          <div
            key={credential.id}
            style={styles.credentialCard}
            onClick={() => handleCardClick(credential.id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = styles.hoverCard.transform;
              e.currentTarget.style.boxShadow = styles.hoverCard.boxShadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = styles.credentialCard.boxShadow;
            }}
          >
            <div style={styles.cardHeader}>
              <h3 style={styles.credentialTitle}>{credential.title}</h3>
              <span style={styles.statusBadge(credential.status)}>
                {credential.status.charAt(0).toUpperCase() + credential.status.slice(1)}
              </span>
            </div>
            
            <div style={styles.credentialType}>
              {credential.type}
            </div>
            
            {credential.description && (
              <p style={{ margin: '8px 0', fontSize: '14px' }}>
                {credential.description}
              </p>
            )}
            
            <div style={styles.date}>
              Uploaded on {formatDate(credential.createdAt)}
            </div>
            
            <div style={styles.buttonsContainer} onClick={(e) => e.stopPropagation()}>
              {credential.status === 'draft' && (
                <button
                  style={{ ...styles.button, ...styles.verifyButton }}
                  onClick={(e) => handleVerifyClick(e, credential.id)}
                  disabled={isRequesting === credential.id}
                >
                  {isRequesting === credential.id ? 'Requesting...' : 'Request Verification'}
                </button>
              )}
              
              <button
                style={{ ...styles.button, ...styles.deleteButton }}
                onClick={(e) => handleDeleteClick(e, credential.id)}
                disabled={isDeleting === credential.id}
              >
                {isDeleting === credential.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CredentialsList;