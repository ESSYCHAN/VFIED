// src/pages/requisitions/[id].js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import CandidateList from '../../components/recruiter/CandidateList';
import JobRequisitionForm from '../../components/recruiter/JobRequisitionForm';
import SkillsAssessmentResult from '../../components/recruiter/SkillsAssessmentResult';
import { getRequisitionById, updateRequisition, deleteRequisition, changeRequisitionStatus } from '../../services/recruiter/requisitionService';
import { useAuth } from '../../contexts/AuthContext';

// Status colors
const statusColors = {
  active: { bg: '#dcfce7', text: '#15803d' },  // Green
  draft: { bg: '#f3f4f6', text: '#6b7280' },   // Gray
  expired: { bg: '#fee2e2', text: '#b91c1c' }, // Red
  filled: { bg: '#dbeafe', text: '#1d4ed8' },  // Blue
  closed: { bg: '#fef3c7', text: '#b45309' }   // Amber
};

// Styles for the component
const styles = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  subheader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  company: {
    fontSize: '16px',
    color: '#1f2937',
  },
  location: {
    fontSize: '16px',
    color: '#6b7280',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    backgroundColor: '#f3f4f6',
    color: '#1f2937',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  activateButton: {
    backgroundColor: '#15803d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  closeButton: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  backButton: {
    backgroundColor: '#5a45f8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '16px',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '24px',
  },
  tab: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    color: '#6b7280',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
  },
  activeTab: {
    color: '#5a45f8',
    borderBottom: '2px solid #5a45f8',
  },
  tabContent: {
    minHeight: '400px',
  },
  section: {
    marginBottom: '32px',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#1f2937',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  detailLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: '16px',
    color: '#1f2937',
  },
  description: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#1f2937',
    whiteSpace: 'pre-wrap',
  },
  skillsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  tag: {
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: '#f3f4f6',
    color: '#1f2937',
    borderRadius: '4px',
    fontSize: '14px',
  },
  skillsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  skillItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: '#f3f4f6',
    borderRadius: '4px',
    alignItems: 'center',
  },
  skillName: {
    fontWeight: '500',
    color: '#1f2937',
  },
  skillDetails: {
    display: 'flex',
    gap: '16px',
    color: '#6b7280',
    fontSize: '14px',
  },
  skillImportance: {
    fontWeight: '500',
  },
  educationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  educationItem: {
    padding: '12px',
    backgroundColor: '#f3f4f6',
    borderRadius: '4px',
  },
  educationDegree: {
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: '4px',
  },
  educationField: {
    color: '#6b7280',
    fontSize: '14px',
    marginBottom: '4px',
  },
  educationRequired: {
    color: '#5a45f8',
    fontSize: '14px',
    fontWeight: '500',
  },
  verificationList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  verificationItem: {
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  link: {
    color: '#5a45f8',
    textDecoration: 'none',
  },
  questionsList: {
    paddingLeft: '24px',
    margin: '12px 0',
  },
  questionItem: {
    marginBottom: '8px',
  },
  emptyMessage: {
    color: '#6b7280',
    fontSize: '16px',
  },
  candidatesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  matchInfo: {
    color: '#6b7280',
    fontSize: '14px',
  },
  infoMessage: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '16px',
    marginBottom: '24px',
  },
  comingSoonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px',
  },
  comingSoon: {
    textAlign: 'center',
    maxWidth: '500px',
  },
  comingSoonTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#5a45f8',
  },
  comingSoonText: {
    fontSize: '16px',
    color: '#6b7280',
  },
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
  },
  modalText: {
    fontSize: '16px',
    marginBottom: '24px',
    color: '#4b5563',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 16px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    padding: '40px 0',
    color: '#6b7280',
    fontSize: '16px',
  },
  error: {
    textAlign: 'center',
    padding: '40px 0',
    color: '#ef4444',
    fontSize: '16px',
  },
};

const JobRequisitionDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { currentUser } = useAuth();
  
  const [requisition, setRequisition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [editMode, setEditMode] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  useEffect(() => {
    // Set the active tab from URL query parameter if available
    if (router.query.tab) {
      setActiveTab(router.query.tab);
    }
  }, [router.query.tab]);

  useEffect(() => {
    if (!id) return;

    const fetchRequisition = async () => {
      try {
        setLoading(true);
        const data = await getRequisitionById(id);
        if (!data) {
          setError('Requisition not found');
          return;
        }
        setRequisition(data);
      } catch (err) {
        console.error('Error fetching requisition:', err);
        setError('Failed to load requisition details');
      } finally {
        setLoading(false);
      }
    };

    fetchRequisition();
  }, [id]);

  const handleUpdateRequisition = async (formData) => {
    try {
      await updateRequisition(id, formData);
      setRequisition({ ...requisition, ...formData });
      setEditMode(false);
      showNotification('Requisition updated successfully', 'success');
    } catch (err) {
      console.error('Error updating requisition:', err);
      showNotification('Failed to update requisition', 'error');
      throw err;
    }
  };

  const handleDeleteRequisition = async () => {
    try {
      await deleteRequisition(id);
      showNotification('Requisition deleted successfully', 'success');
      router.push('/requisitions');
    } catch (err) {
      console.error('Error deleting requisition:', err);
      showNotification('Failed to delete requisition', 'error');
    }
    setDeleteModalOpen(false);
  };

  const handleActivateRequisition = async () => {
    try {
      await changeRequisitionStatus(id, 'active');
      setRequisition({ ...requisition, status: 'active' });
      showNotification('Requisition activated successfully', 'success');
    } catch (err) {
      console.error('Error activating requisition:', err);
      showNotification('Failed to activate requisition', 'error');
    }
  };

  const handleCloseRequisition = async () => {
    try {
      await changeRequisitionStatus(id, 'closed');
      setRequisition({ ...requisition, status: 'closed' });
      showNotification('Requisition closed successfully', 'success');
    } catch (err) {
      console.error('Error closing requisition:', err);
      showNotification('Failed to close requisition', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 5000);
  };

  const getStatusBadge = (status) => {
    const colorScheme = statusColors[status] || statusColors.draft;
    
    return (
      <span style={{
        display: 'inline-block',
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: colorScheme.bg,
        color: colorScheme.text,
        fontSize: '12px',
        fontWeight: '500',
        textTransform: 'capitalize'
      }}>
        {status}
      </span>
    );
  };

  // If in edit mode, show the form
  if (editMode && requisition) {
    return (
      <Layout>
        <div style={styles.container}>
          <h1 style={styles.title}>Edit Job Requisition</h1>
          <JobRequisitionForm 
            requisition={requisition}
            onSubmit={handleUpdateRequisition}
            onCancel={() => setEditMode(false)}
          />
        </div>
      </Layout>
    );
  }

  // Show delete confirmation modal
  const renderDeleteModal = () => {
    if (!deleteModalOpen) return null;

    return (
      <div style={styles.modalBackdrop}>
        <div style={styles.modalContent}>
          <h3 style={styles.modalTitle}>Confirm Delete</h3>
          <p style={styles.modalText}>
            Are you sure you want to delete this job requisition? This action cannot be undone.
          </p>
          <div style={styles.modalActions}>
            <button 
              style={styles.cancelButton}
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              style={styles.deleteButton}
              onClick={handleDeleteRequisition}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Show notification
  const renderNotification = () => {
    if (!notification.show) return null;

    const bgColor = notification.type === 'success' ? '#dcfce7' : '#fee2e2';
    const textColor = notification.type === 'success' ? '#15803d' : '#b91c1c';

    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: bgColor,
        color: textColor,
        padding: '12px 16px',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        zIndex: 1000
      }}>
        {notification.message}
      </div>
    );
  };

  // Show skills assessment result modal
  const renderAssessmentModal = () => {
    if (!selectedAssessment) return null;

    return (
      <div style={styles.modalBackdrop}>
        <div style={{ ...styles.modalContent, maxWidth: '800px' }}>
          <SkillsAssessmentResult 
            assessment={selectedAssessment}
            onClose={() => setSelectedAssessment(null)}
          />
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div style={styles.container}>
          <div style={styles.loading}>Loading requisition details...</div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div style={styles.container}>
          <div style={styles.error}>{error}</div>
          <Link href="/requisitions">
            <button style={styles.backButton}>Back to Requisitions</button>
          </Link>
        </div>
      </Layout>
    );
  }

  // No requisition found
  if (!requisition) {
    return (
      <Layout>
        <div style={styles.container}>
          <div style={styles.error}>Requisition not found</div>
          <Link href="/requisitions">
            <button style={styles.backButton}>Back to Requisitions</button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.container}>
        {/* Header with title and actions */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>{requisition.title}</h1>
            <div style={styles.subheader}>
              {getStatusBadge(requisition.status)}
              <span style={styles.company}>{requisition.company}</span>
              <span style={styles.location}>{requisition.location}</span>
            </div>
          </div>
          
          <div style={styles.actions}>
            <button 
              style={styles.editButton}
              onClick={() => setEditMode(true)}
            >
              Edit
            </button>
            
            {requisition.status === 'draft' && (
              <button 
                style={styles.activateButton}
                onClick={handleActivateRequisition}
              >
                Activate
              </button>
            )}
            
            {requisition.status === 'active' && (
              <button 
                style={styles.closeButton}
                onClick={handleCloseRequisition}
              >
                Close
              </button>
            )}
            
            <button 
              style={styles.deleteButton}
              onClick={() => setDeleteModalOpen(true)}
            >
              Delete
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div style={styles.tabs}>
          <button 
            style={{
              ...styles.tab,
              ...(activeTab === 'details' ? styles.activeTab : {})
            }}
            onClick={() => {
              setActiveTab('details');
              router.push(`/requisitions/${id}?tab=details`, undefined, { shallow: true });
            }}
          >
            Details
          </button>
          
          <button 
            style={{
              ...styles.tab,
              ...(activeTab === 'candidates' ? styles.activeTab : {})
            }}
            onClick={() => {
              setActiveTab('candidates');
              router.push(`/requisitions/${id}?tab=candidates`, undefined, { shallow: true });
            }}
          >
            Matching Candidates
          </button>
          
          <button 
            style={{
              ...styles.tab,
              ...(activeTab === 'applications' ? styles.activeTab : {})
            }}
            onClick={() => {
              setActiveTab('applications');
              router.push(`/requisitions/${id}?tab=applications`, undefined, { shallow: true });
            }}
          >
            Applications
          </button>
          
          <button 
            style={{
              ...styles.tab,
              ...(activeTab === 'analytics' ? styles.activeTab : {})
            }}
            onClick={() => {
              setActiveTab('analytics');
              router.push(`/requisitions/${id}?tab=analytics`, undefined, { shallow: true });
            }}
          >
            Analytics
          </button>
        </div>
        
        {/* Tab Content */}
        <div style={styles.tabContent}>
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div>
              {/* Job Information Section */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Job Information</h2>
                
                <div style={styles.detailGrid}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Job Title</span>
                    <span style={styles.detailValue}>{requisition.title}</span>
                  </div>
                  
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Company</span>
                    <span style={styles.detailValue}>{requisition.company}</span>
                  </div>
                  
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Location</span>
                    <span style={styles.detailValue}>{requisition.location}</span>
                  </div>
                  
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Work Type</span>
                    <span style={styles.detailValue}>{requisition.workType || 'Not specified'}</span>
                  </div>
                  
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Remote</span>
                    <span style={styles.detailValue}>{requisition.remote ? 'Yes' : 'No'}</span>
                  </div>
                  
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Industry</span>
                    <span style={styles.detailValue}>{requisition.industry || 'Not specified'}</span>
                  </div>
                </div>
              </div>
              
              {/* Description Section */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Job Description</h2>
                <div style={styles.description}>
                  {requisition.description || 'No description provided.'}
                </div>
              </div>
              
              {/* Compensation Section */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Compensation</h2>
                
                <div style={styles.detailGrid}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Salary Range</span>
                    <span style={styles.detailValue}>
                      {requisition.salaryMin && requisition.salaryMax 
                        ? `${requisition.salaryCurrency || 'USD'} ${requisition.salaryMin.toLocaleString()} - ${requisition.salaryMax.toLocaleString()} (${requisition.salaryPeriod || 'annual'})`
                        : 'Not specified'}
                    </span>
                  </div>
                  
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Benefits</span>
                    <div style={styles.skillsContainer}>
                      {requisition.benefits && requisition.benefits.length > 0 ? (
                        requisition.benefits.map((benefit, index) => (
                          <span key={index} style={styles.tag}>{benefit}</span>
                        ))
                      ) : (
                        <span style={styles.detailValue}>None specified</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Required Skills Section */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Required Skills</h2>
                
                {requisition.requiredSkills && requisition.requiredSkills.length > 0 ? (
                  <div style={styles.skillsList}>
                    {requisition.requiredSkills.map((skill, index) => (
                      <div key={index} style={styles.skillItem}>
                        <div style={styles.skillName}>{skill.skill}</div>
                        <div style={styles.skillDetails}>
                          <span style={styles.skillImportance}>
                            {['', 'Nice to have', 'Helpful', 'Important', 'Very Important', 'Essential'][skill.importance]}
                          </span>
                          <span style={styles.skillYears}>{skill.yearsRequired} years</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyMessage}>No required skills specified.</div>
                )}
              </div>
              
              {/* Education Requirements Section */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Education & Experience</h2>
                
                <div style={styles.detailGrid}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Experience Required</span>
                    <span style={styles.detailValue}>
                      {requisition.requiredExperience 
                        ? `${requisition.requiredExperience} years`
                        : 'No specific experience required'}
                    </span>
                  </div>
                  
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Education Requirements</span>
                    {requisition.requiredEducation && requisition.requiredEducation.length > 0 ? (
                      <div style={styles.educationList}>
                        {requisition.requiredEducation.map((edu, index) => (
                          <div key={index} style={styles.educationItem}>
                            <div style={styles.educationDegree}>
                              {edu.degreeLevel === 'high_school' ? 'High School' :
                                edu.degreeLevel === 'associate' ? 'Associate\'s Degree' :
                                edu.degreeLevel === 'bachelor' ? 'Bachelor\'s Degree' :
                                edu.degreeLevel === 'master' ? 'Master\'s Degree' :
                                edu.degreeLevel === 'doctorate' ? 'Doctorate' :
                                edu.degreeLevel === 'certification' ? 'Certification' :
                                'No specific degree'}
                            </div>
                            {edu.field && (
                              <div style={styles.educationField}>
                                Field: {edu.field}
                              </div>
                            )}
                            <div style={styles.educationRequired}>
                              {edu.required ? 'Required' : 'Preferred'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={styles.detailValue}>No specific education requirements</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Verification Requirements Section */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Verification Requirements</h2>
                
                <div style={styles.detailGrid}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Required Verifications</span>
                    <div>
                      {requisition.verificationRequirements ? (
                        <ul style={styles.verificationList}>
                          {requisition.verificationRequirements.educationVerified && (
                            <li style={styles.verificationItem}>Education must be verified</li>
                          )}
                          {requisition.verificationRequirements.experienceVerified && (
                            <li style={styles.verificationItem}>Work experience must be verified</li>
                          )}
                          {requisition.verificationRequirements.skillsVerified && (
                            <li style={styles.verificationItem}>Skills must be verified</li>
                          )}
                          {!requisition.verificationRequirements.educationVerified && 
                            !requisition.verificationRequirements.experienceVerified && 
                            !requisition.verificationRequirements.skillsVerified && (
                            <li style={styles.verificationItem}>No verification requirements</li>
                          )}
                        </ul>
                      ) : (
                        <span style={styles.detailValue}>No verification requirements</span>
                      )}
                    </div>
                  </div>
                  
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Minimum Verification Strength</span>
                    <span style={styles.detailValue}>
                      {requisition.verificationRequirements ? (
                        requisition.verificationRequirements.minimumVerificationStrength === 'low' ? 'Low (basic verification)' :
                        requisition.verificationRequirements.minimumVerificationStrength === 'medium' ? 'Medium (standard verification)' :
                        requisition.verificationRequirements.minimumVerificationStrength === 'high' ? 'High (rigorous verification)' :
                        'None (accept all)'
                      ) : 'None (accept all)'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Application Process Section */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Application Process</h2>
                
                <div style={styles.detailGrid}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Accept Applications Through</span>
                    <span style={styles.detailValue}>
                      {requisition.applicationProcess && requisition.applicationProcess.acceptDirect 
                        ? 'VFied Platform' 
                        : 'External Application Only'}
                    </span>
                  </div>
                  
                  {requisition.applicationProcess && requisition.applicationProcess.redirectUrl && (
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>External Application URL</span>
                      <a 
                        href={requisition.applicationProcess.redirectUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={styles.link}
                      >
                        {requisition.applicationProcess.redirectUrl}
                      </a>
                    </div>
                  )}
                  
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Skills Assessment Required</span>
                    <span style={styles.detailValue}>
                      {requisition.applicationProcess && requisition.applicationProcess.assessmentRequired 
                        ? 'Yes' 
                        : 'No'}
                    </span>
                  </div>
                  
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>AI Matching Enabled</span>
                    <span style={styles.detailValue}>
                      {requisition.applicationProcess && requisition.applicationProcess.allowAiMatching 
                        ? 'Yes' 
                        : 'No'}
                    </span>
                  </div>
                </div>
                
                {requisition.applicationProcess && requisition.applicationProcess.customQuestions && 
                  requisition.applicationProcess.customQuestions.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <span style={styles.detailLabel}>Custom Application Questions</span>
                    <ol style={styles.questionsList}>
                      {requisition.applicationProcess.customQuestions.map((question, index) => (
                        <li key={index} style={styles.questionItem}>{question}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
              
              {/* Posting Details Section */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Posting Details</h2>
                
                <div style={styles.detailGrid}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Status</span>
                    <span style={styles.detailValue}>{requisition.status}</span>
                  </div>
                  
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Visibility</span>
                    <span style={styles.detailValue}>
                      {requisition.visibility === 'public' ? 'Public (visible to all)' :
                        requisition.visibility === 'private' ? 'Private (by invitation only)' :
                        requisition.visibility === 'network' ? 'Network (visible to your network)' :
                        'Public'}
                    </span>
                  </div>
                  
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Expiry Date</span>
                    <span style={styles.detailValue}>
                      {requisition.expiryDate 
                        ? new Date(requisition.expiryDate).toLocaleDateString() 
                        : 'No expiration'}
                    </span>
                  </div>
                  
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Created</span>
                    <span style={styles.detailValue}>
                      {requisition.createdAt 
                        ? new Date(requisition.createdAt.seconds * 1000).toLocaleDateString() 
                        : 'Unknown'}
                    </span>
                  </div>
                  
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Reference ID</span>
                    <span style={styles.detailValue}>
                      {requisition.referenceId || 'None'}
                    </span>
                  </div>
                  
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Keywords</span>
                    <div style={styles.skillsContainer}>
                      {requisition.keywords && requisition.keywords.length > 0 ? (
                        requisition.keywords.map((keyword, index) => (
                          <span key={index} style={styles.tag}>{keyword}</span>
                        ))
                      ) : (
                        <span style={styles.detailValue}>None</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Matching Candidates Tab */}
          {activeTab === 'candidates' && (
            <div>
              {requisition.status === 'draft' ? (
                <div style={styles.infoMessage}>
                  Candidate matching is only available for active requisitions. Please activate this requisition to see matching candidates.
                </div>
              ) : (
                <>
                  <div style={styles.candidatesHeader}>
                    <h2 style={styles.sectionTitle}>Matching Candidates</h2>
                    <div style={styles.matchInfo}>
                      AI matching is {requisition.applicationProcess && requisition.applicationProcess.allowAiMatching ? 'enabled' : 'disabled'} for this requisition.
                    </div>
                  </div>
                  
                  <CandidateList requisitionId={id} />
                </>
              )}
            </div>
          )}
          
          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div style={styles.comingSoonContainer}>
              <div style={styles.comingSoon}>
                <h3 style={styles.comingSoonTitle}>Coming Soon</h3>
                <p style={styles.comingSoonText}>
                  Application management features will be available in a future update.
                </p>
              </div>
            </div>
          )}
          
          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div style={styles.comingSoonContainer}>
              <div style={styles.comingSoon}>
                <h3 style={styles.comingSoonTitle}>Coming Soon</h3>
                <p style={styles.comingSoonText}>
                  Analytics dashboard will be available in a future update.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modals and Notifications */}
      {renderDeleteModal()}
      {renderNotification()}
      {renderAssessmentModal()}
    </Layout>
  );
};