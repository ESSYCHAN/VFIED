// src/pages/CredentialView.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getCredentialById, requestVerification, updateCredential, deleteCredential } from '../services/credentialService';

const CredentialView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [credential, setCredential] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [isRequesting, setIsRequesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Styling
  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
      margin: 0,
    },
    backButton: {
      padding: '8px 16px',
      backgroundColor: '#f0f0f0',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      color: '#333',
      fontSize: '14px',
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      marginBottom: '20px',
    },
    field: {
      marginBottom: '16px',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      color: '#666',
      marginBottom: '4px',
    },
    value: {
      fontSize: '16px',
      color: '#333',
    },
    imageContainer: {
      marginTop: '24px',
      marginBottom: '24px',
    },
    image: {
      maxWidth: '100%',
      borderRadius: '4px',
      border: '1px solid #eaeaea',
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
        padding: '6px 12px',
        borderRadius: '16px',
        fontSize: '14px',
        fontWeight: 'bold',
        backgroundColor: color.bg,
        color: color.text,
      };
    },
    verificationSection: {
      marginTop: '24px',
      padding: '16px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
    },
    actionButtons: {
      display: 'flex',
      gap: '12px',
      marginTop: '20px',
    },
    button: {
      padding: '10px 18px',
      borderRadius: '4px',
      border: 'none',
      fontSize: '14px',
      cursor: 'pointer',
      fontWeight: '500',
    },
    primaryButton: {
      backgroundColor: '#4A90E2',
      color: 'white',
    },
    secondaryButton: {
      backgroundColor: '#f0f0f0',
      color: '#333',
    },
    dangerButton: {
      backgroundColor: '#F44336',
      color: 'white',
    },
    successButton: {
      backgroundColor: '#4CAF50',
      color: 'white',
    },
    formGroup: {
      marginBottom: '16px',
    },
    input: {
      width: '100%',
      padding: '10px',
      fontSize: '16px',
      border: '1px solid #ddd',
      borderRadius: '4px',
    },
    textarea: {
      width: '100%',
      padding: '10px',
      fontSize: '16px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      minHeight: '100px',
      fontFamily: 'inherit',
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '40px',
    },
    errorContainer: {
      padding: '20px',
      backgroundColor: '#FFEBEE',
      color: '#D32F2F',
      borderRadius: '4px',
      marginBottom: '20px',
    },
    verificationSteps: {
      marginTop: '20px',
    },
    step: {
      display: 'flex',
      marginBottom: '16px',
    },
    stepNumber: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      backgroundColor: '#4A90E2',
      color: 'white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: '12px',
      flexShrink: 0,
    },
    stepContent: {
      flex: 1,
    },
    stepTitle: {
      fontWeight: 'bold',
      marginBottom: '4px',
    },
    timeline: {
      marginTop: '24px',
    },
    timelineItem: {
      display: 'flex',
      marginBottom: '16px',
    },
    timelineDot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      backgroundColor: '#4A90E2',
      marginRight: '12px',
      marginTop: '6px',
      flexShrink: 0,
    },
    timelineContent: {
      flex: 1,
    },
    timelineDate: {
      fontSize: '12px',
      color: '#999',
    },
  };

  useEffect(() => {
    const fetchCredential = async () => {
      try {
        setLoading(true);
        const data = await getCredentialById(id);
        setCredential(data);
        setFormData({
          title: data.title,
          description: data.description || '',
        });
      } catch (err) {
        setError('Failed to load credential. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCredential();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    setFormData({
      title: credential.title,
      description: credential.description || '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updatedCredential = await updateCredential(id, formData);
      setCredential(updatedCredential);
      setIsEditing(false);
    } catch (err) {
      alert('Failed to update credential. Please try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestVerification = async () => {
    try {
      setIsRequesting(true);
      const updatedCredential = await requestVerification(id);
      setCredential(updatedCredential);
    } catch (err) {
      alert('Failed to request verification. Please try again.');
      console.error(err);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this credential? This action cannot be undone.')) {
      try {
        setIsDeleting(true);
        await deleteCredential(id);
        navigate('/dashboard');
      } catch (err) {
        alert('Failed to delete credential. Please try again.');
        console.error(err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Layout>
        <div style={styles.loadingContainer}>
          <p>Loading credential information...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div style={styles.container}>
          <div style={styles.errorContainer}>
            <p>{error}</p>
            <button 
              onClick={() => navigate('/dashboard')}
              style={{ ...styles.button, ...styles.secondaryButton }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <button 
            onClick={() => navigate('/dashboard')}
            style={styles.backButton}
          >
            ← Back to Dashboard
          </button>
          <span style={styles.statusBadge(credential.status)}>
            {credential.status.charAt(0).toUpperCase() + credential.status.slice(1)}
          </span>
        </div>

        {isEditing ? (
          <div style={styles.card}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                style={styles.textarea}
              />
            </div>
            <div style={styles.actionButtons}>
              <button 
                onClick={handleSave}
                style={{ ...styles.button, ...styles.primaryButton }}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                onClick={handleCancel}
                style={{ ...styles.button, ...styles.secondaryButton }}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.card}>
            <h1 style={styles.title}>{credential.title}</h1>
            
            <div style={styles.field}>
              <label style={styles.label}>Type</label>
              <div style={styles.value}>{credential.type}</div>
            </div>
            
            {credential.description && (
              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <div style={styles.value}>{credential.description}</div>
              </div>
            )}
            
            <div style={styles.field}>
              <label style={styles.label}>Uploaded on</label>
              <div style={styles.value}>{formatDate(credential.createdAt)}</div>
            </div>
            
            {credential.imageUrl && (
              <div style={styles.imageContainer}>
                <img 
                  src={credential.imageUrl} 
                  alt={credential.title}
                  style={styles.image}
                />
              </div>
            )}
            
            <div style={styles.actionButtons}>
              <button 
                onClick={handleEdit}
                style={{ ...styles.button, ...styles.secondaryButton }}
              >
                Edit
              </button>
              
              {credential.status === 'draft' && (
                <button 
                  onClick={handleRequestVerification}
                  style={{ ...styles.button, ...styles.successButton }}
                  disabled={isRequesting}
                >
                  {isRequesting ? 'Requesting...' : 'Request Verification'}
                </button>
              )}
              
              <button 
                onClick={handleDelete}
                style={{ ...styles.button, ...styles.dangerButton }}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
        
        {credential.status !== 'draft' && (
          <div style={styles.verificationSection}>
            <h3>Verification Process</h3>
            
            <div style={styles.verificationSteps}>
              <div style={styles.step}>
                <div style={styles.stepNumber}>1</div>
                <div style={styles.stepContent}>
                  <div style={styles.stepTitle}>Submission</div>
                  <p>Your credential has been submitted for verification.</p>
                </div>
              </div>
              
              <div style={styles.step}>
                <div style={styles.stepNumber}>2</div>
                <div style={styles.stepContent}>
                  <div style={styles.stepTitle}>Review</div>
                  <p>Our verification team will review your credential within 24-48 hours.</p>
                </div>
              </div>
              
              <div style={styles.step}>
                <div style={styles.stepNumber}>3</div>
                <div style={styles.stepContent}>
                  <div style={styles.stepTitle}>Verification</div>
                  <p>Once verified, your credential will be added to your verified collection.</p>
                </div>
              </div>
            </div>
            
            <div style={styles.timeline}>
              <h4>Status Timeline</h4>
              
              {credential.statusHistory && credential.statusHistory.map((status, index) => (
                <div key={index} style={styles.timelineItem}>
                  <div style={styles.timelineDot}></div>
                  <div style={styles.timelineContent}>
                    <div>{status.status.charAt(0).toUpperCase() + status.status.slice(1)}</div>
                    <div style={styles.timelineDate}>{formatDate(status.timestamp)}</div>
                    {status.note && <div>{status.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CredentialView;