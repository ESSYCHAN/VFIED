// src/pages/requisitions/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import Head from 'next/head';
import { styles } from '../../styles/sharedStyles';
import { 
  getRequisitionById, 
  updateRequisition, 
  activateRequisition,
  deleteRequisition,
  getMatchingCandidates 
} from '../../services/requisitionService';
import { performSkillsAssessment } from '../../services/recruitmentService';
import JobRequisitionForm from '../../components/recruiter/JobRequisitionForm';
import ErrorHandler from '../../components/ErrorHandler';
import SkillsAssessmentResult from '../../components/recruiter/SkillsAssessmentResult';

export default function RequisitionDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { currentUser } = useAuth();
  
  const [requisition, setRequisition] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [assessingCandidate, setAssessingCandidate] = useState(null);
  const [skillsAssessment, setSkillsAssessment] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Fetch requisition data
  useEffect(() => {
    const fetchRequisition = async () => {
      if (!id || !currentUser) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const result = await getRequisitionById(id);
        setRequisition(result);
        
        // After loading requisition, fetch candidates
        fetchCandidates();
      } catch (err) {
        console.error("Error fetching requisition:", err);
        setError("Failed to load job requisition details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequisition();
  }, [id, currentUser]);

  // Fetch matching candidates
  const fetchCandidates = async () => {
    if (!id) return;
    
    try {
      setCandidatesLoading(true);
      
      const result = await getMatchingCandidates(id);
      setCandidates(result.candidates || []);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      // Don't set main error for this - just show empty candidates
      setCandidates([]);
    } finally {
      setCandidatesLoading(false);
    }
  };

  // Handle updating the requisition
  const handleUpdateRequisition = async (formData) => {
    try {
      setActionInProgress(true);
      setError(null);
      
      const updatedRequisition = await updateRequisition(id, formData);
      setRequisition(updatedRequisition);
      setIsEditing(false);
      
      // Show success message
      alert("Job requisition updated successfully!");
    } catch (err) {
      console.error("Error updating requisition:", err);
      setError("Failed to update job requisition: " + err.message);
    } finally {
      setActionInProgress(false);
    }
  };

  // Handle activating the requisition
  const handleActivate = async () => {
    try {
      setActionInProgress(true);
      setError(null);
      
      const result = await activateRequisition(id);
      
      // Update requisition status
      setRequisition({
        ...requisition,
        status: 'active',
        postDate: new Date().toISOString()
      });
      
      // Show success message
      alert("Job requisition activated successfully!");
    } catch (err) {
      console.error("Error activating requisition:", err);
      setError("Failed to activate job requisition: " + err.message);
    } finally {
      setActionInProgress(false);
    }
  };

  // Handle deleting the requisition
  const handleDelete = async () => {
    try {
      setActionInProgress(true);
      setError(null);
      
      await deleteRequisition(id);
      
      // Redirect to requisition list
      router.push('/requisitions');
      
      // Show success message before redirect
      alert("Job requisition deleted successfully!");
    } catch (err) {
      console.error("Error deleting requisition:", err);
      setError("Failed to delete job requisition: " + err.message);
      setActionInProgress(false);
    }
  };

  // Handle candidate assessment
  const handleAssessCandidate = async (candidateId) => {
    try {
      setAssessingCandidate(candidateId);
      
      const assessment = await performSkillsAssessment(candidateId, {
        title: requisition.title,
        skills: requisition.requiredSkills.map(skill => 
          typeof skill === 'object' ? skill.skill : skill
        )
      });
      
      setSkillsAssessment(assessment);
    } catch (err) {
      console.error("Error assessing candidate:", err);
      alert("Failed to assess candidate skills. Please try again.");
    } finally {
      setAssessingCandidate(null);
    }
  };

  // Handle contacting candidate
  const handleContactCandidate = (candidateId) => {
    // This would open a messaging interface or email form
    alert(`Contact functionality would be implemented here for candidate ${candidateId}`);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    const statusStyles = {
      draft: { bg: '#f3f4f6', color: '#4b5563' },
      active: { bg: '#d1fae5', color: '#047857' },
      paused: { bg: '#eff6ff', color: '#1e40af' },
      filled: { bg: '#fef3c7', color: '#92400e' },
      expired: { bg: '#fee2e2', color: '#b91c1c' }
    };
    
    const style = statusStyles[status] || statusStyles.draft;
    
    return {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '500',
      backgroundColor: style.bg,
      color: style.color
    };
  };

  return (
    <Layout>
      <Head>
        <title>{requisition ? `${requisition.title} - VFied` : 'Job Requisition - VFied'}</title>
      </Head>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {error && <ErrorHandler error={error} onRetry={() => router.reload()} />}
        
        {loading ? (
          <div style={{ ...styles.card, textAlign: 'center', padding: '32px' }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>⟳</div>
            <p>Loading job requisition details...</p>
          </div>
        ) : !requisition ? (
          <div style={{ ...styles.card, textAlign: 'center', padding: '32px' }}>
            <div style={{ fontSize: '24px', marginBottom: '16px', color: '#ef4444' }}>⚠️</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              Requisition Not Found
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              The job requisition you're looking for could not be found or you don't have permission to view it.
            </p>
            <button
              onClick={() => router.push('/requisitions')}
              style={styles.button}
            >
              Back to Requisitions
            </button>
          </div>
        ) : isEditing ? (
          <div>
            <div style={styles.flexBetween}>
              <h1 style={styles.title}>Edit Job Requisition</h1>
              <button
                onClick={() => setIsEditing(false)}
                style={styles.secondaryButton}
                disabled={actionInProgress}
              >
                Cancel Editing
              </button>
            </div>
            
            <JobRequisitionForm 
              requisition={requisition}
              onSubmit={handleUpdateRequisition}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <div>
            <div style={styles.flexBetween}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => router.push('/requisitions')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#6b7280'
                  }}
                >
                  ←
                </button>
                <h1 style={styles.title}>{requisition.title}</h1>
                <div style={getStatusBadge(requisition.status)}>
                  {requisition.status.charAt(0).toUpperCase() + requisition.status.slice(1)}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                {requisition.status === 'draft' && (
                  <button
                    onClick={handleActivate}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#047857',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                    disabled={actionInProgress}
                  >
                    {actionInProgress ? 'Activating...' : 'Activate Requisition'}
                  </button>
                )}
                
                <button
                  onClick={() => setIsEditing(true)}
                  style={styles.button}
                  disabled={actionInProgress}
                >
                  Edit Requisition
                </button>
                
                <button
                  onClick={() => setDeleteConfirmOpen(true)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'white',
                    color: '#ef4444',
                    border: '1px solid #ef4444',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  disabled={actionInProgress}
                >
                  Delete
                </button>
              </div>
            </div>
            
            {/* Tab navigation */}
            <div style={{ 
              display: 'flex', 
              borderBottom: '1px solid #e5e7eb',
              marginBottom: '24px',
              marginTop: '16px'
            }}>
              <button
                onClick={() => setActiveTab('details')}
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'details' ? '600' : '400',
                  color: activeTab === 'details' ? '#5a45f8' : '#6b7280',
                  borderBottom: activeTab === 'details' ? '2px solid #5a45f8' : 'none',
                  marginBottom: activeTab === 'details' ? '-1px' : '0'
                }}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('candidates')}
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'candidates' ? '600' : '400',
                  color: activeTab === 'candidates' ? '#5a45f8' : '#6b7280',
                  borderBottom: activeTab === 'candidates' ? '2px solid #5a45f8' : 'none',
                  marginBottom: activeTab === 'candidates' ? '-1px' : '0'
                }}
              >
                Matching Candidates
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'applications' ? '600' : '400',
                  color: activeTab === 'applications' ? '#5a45f8' : '#6b7280',
                  borderBottom: activeTab === 'applications' ? '2px solid #5a45f8' : 'none',
                  marginBottom: activeTab === 'applications' ? '-1px' : '0'
                }}
              >
                Applications
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'analytics' ? '600' : '400',
                  color: activeTab === 'analytics' ? '#5a45f8' : '#6b7280',
                  borderBottom: activeTab === 'analytics' ? '2px solid #5a45f8' : 'none',
                  marginBottom: activeTab === 'analytics' ? '-1px' : '0'
                }}
              >
                Analytics
              </button>
            </div>
            
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div>
                <div style={styles.card}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                    Job Details
                  </h2>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '24px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                        Company
                      </label>
                      <div style={{ fontSize: '16px' }}>{requisition.company}</div>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                        Location
                      </label>
                      <div style={{ fontSize: '16px' }}>
                        {requisition.location} {requisition.remote && '(Remote)'}
                      </div>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                        Work Type
                      </label>
                      <div style={{ fontSize: '16px', textTransform: 'capitalize' }}>
                        {requisition.workType}
                      </div>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                        Salary Range
                      </label>
                      <div style={{ fontSize: '16px' }}>
                        {requisition.salaryMin && requisition.salaryMax ? (
                          `${requisition.salaryMin.toLocaleString()} - ${requisition.salaryMax.toLocaleString()} ${requisition.salaryCurrency || 'USD'} / ${requisition.salaryPeriod || 'year'}`
                        ) : requisition.salaryMin ? (
                          `${requisition.salaryMin.toLocaleString()} ${requisition.salaryCurrency || 'USD'} / ${requisition.salaryPeriod || 'year'}`
                        ) : requisition.salaryMax ? (
                          `Up to ${requisition.salaryMax.toLocaleString()} ${requisition.salaryCurrency || 'USD'} / ${requisition.salaryPeriod || 'year'}`
                        ) : (
                          'Not specified'
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                      Description
                    </label>
                    <div style={{ fontSize: '16px', whiteSpace: 'pre-wrap' }}>
                      {requisition.description || 'No description provided.'}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                      Required Skills
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {requisition.requiredSkills && requisition.requiredSkills.length > 0 ? (
                        requisition.requiredSkills.map((skill, index) => (
                          <div 
                            key={index}
                            style={{
                              backgroundColor: '#f3f4f6',
                              borderRadius: '16px',
                              padding: '6px 12px',
                              fontSize: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            {typeof skill === 'object' ? skill.skill : skill}
                            {typeof skill === 'object' && skill.importance >= 4 && (
                              <span style={{ color: '#ef4444', fontWeight: '700' }}>*</span>
                            )}
                            {typeof skill === 'object' && skill.yearsRequired > 0 && (
                              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                ({skill.yearsRequired}+ yrs)
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <span style={{ color: '#6b7280', fontStyle: 'italic' }}>No specific skills listed</span>
                      )}
                    </div>
                  </div>
                  
                  {requisition.requiredEducation && requisition.requiredEducation.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                        Education Requirements
                      </label>
                      <ul style={{ paddingLeft: '20px', margin: '0' }}>
                        {requisition.requiredEducation.map((edu, index) => (
                          <li key={index} style={{ marginBottom: '8px' }}>
                            {edu.degreeLevel && (
                              <span style={{ textTransform: 'capitalize' }}>
                                {edu.degreeLevel.replace(/_/g, ' ')}
                              </span>
                            )}
                            {edu.field && ` in ${edu.field}`}
                            {edu.required === false && ' (Preferred)'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {requisition.requiredExperience > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                        Experience Required
                      </label>
                      <div style={{ fontSize: '16px' }}>
                        {requisition.requiredExperience} {requisition.requiredExperience === 1 ? 'year' : 'years'}
                      </div>
                    </div>
                  )}
                  
                  {requisition.benefits && requisition.benefits.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                        Benefits
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {requisition.benefits.map((benefit, index) => (
                          <div 
                            key={index}
                            style={{
                              backgroundColor: '#f3f4f6',
                              borderRadius: '16px',
                              padding: '6px 12px',
                              fontSize: '14px'
                            }}
                          >
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div style={styles.card}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                    Verification Requirements
                  </h2>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                    <div style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: requisition.verificationRequirements?.educationVerified ? '#d1fae5' : '#f3f4f6',
                      color: requisition.verificationRequirements?.educationVerified ? '#047857' : '#6b7280',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {requisition.verificationRequirements?.educationVerified ? '✓' : '◯'} Education Verification
                    </div>
                    
                    <div style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: requisition.verificationRequirements?.experienceVerified ? '#d1fae5' : '#f3f4f6',
                      color: requisition.verificationRequirements?.experienceVerified ? '#047857' : '#6b7280',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {requisition.verificationRequirements?.experienceVerified ? '✓' : '◯'} Experience Verification
                    </div>
                    
                    <div style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: requisition.verificationRequirements?.skillsVerified ? '#d1fae5' : '#f3f4f6',
                      color: requisition.verificationRequirements?.skillsVerified ? '#047857' : '#6b7280',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {requisition.verificationRequirements?.skillsVerified ? '✓' : '◯'} Skills Verification
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                      Minimum Verification Strength
                    </label>
                    <div style={{ fontSize: '16px', textTransform: 'capitalize' }}>
                      {requisition.verificationRequirements?.minimumVerificationStrength || 'None'}
                    </div>
                  </div>
                </div>
                
                <div style={styles.card}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                    Application Process
                  </h2>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '24px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                        Accept Direct Applications
                      </label>
                      <div style={{ fontSize: '16px' }}>
                        {requisition.applicationProcess?.acceptDirect ? 'Yes' : 'No'}
                      </div>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                        Assessment Required
                      </label>
                      <div style={{ fontSize: '16px' }}>
                        {requisition.applicationProcess?.assessmentRequired ? 'Yes' : 'No'}
                      </div>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                        AI Matching Enabled
                      </label>
                      <div style={{ fontSize: '16px' }}>
                        {requisition.applicationProcess?.allowAiMatching ? 'Yes' : 'No'}
                      </div>
                    </div>
                    
                    {requisition.applicationProcess?.redirectUrl && (
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                          External Application URL
                        </label>
                        <div style={{ fontSize: '16px' }}>
                          <a 
                            href={requisition.applicationProcess.redirectUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#5a45f8', textDecoration: 'none' }}
                          >
                            {requisition.applicationProcess.redirectUrl}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {requisition.applicationProcess?.customQuestions && 
                   requisition.applicationProcess.customQuestions.length > 0 && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                        Custom Application Questions
                      </label>
                      <ol style={{ paddingLeft: '20px', margin: '0' }}>
                        {requisition.applicationProcess.customQuestions.map((question, index) => (
                          <li key={index} style={{ marginBottom: '8px' }}>
                            {question}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
                
                <div style={styles.card}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                    Posting Information
                  </h2>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                        Created Date
                      </label>
                      <div style={{ fontSize: '16px' }}>
                        {formatDate(requisition.createdAt)}
                      </div>
                    </div>
                    
                    {requisition.postDate && (
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                          Posted Date
                        </label>
                        <div style={{ fontSize: '16px' }}>
                          {formatDate(requisition.postDate)}
                        </div>
                      </div>
                    )}
                    
                    {requisition.expiryDate && (
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                          Expiry Date
                        </label>
                        <div style={{ fontSize: '16px' }}>
                          {formatDate(requisition.expiryDate)}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                        Visibility
                      </label>
                      <div style={{ fontSize: '16px', textTransform: 'capitalize' }}>
                        {requisition.visibility || 'Public'}
                      </div>
                    </div>
                    
                    {requisition.referenceId && (
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                          Reference ID
                        </label>
                        <div style={{ fontSize: '16px' }}>
                          {requisition.referenceId}
                        </div>
                      </div>
                    )}
                    
                    {requisition.industry && (
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                          Industry
                        </label>
                        <div style={{ fontSize: '16px' }}>
                          {requisition.industry}
                        </div>
                      </div>
                    )}
                    
                    {requisition.category && (
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                          Category
                        </label>
                        <div style={{ fontSize: '16px' }}>
                          {requisition.category}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Candidates Tab */}
            {activeTab === 'candidates' && (
              <div>
                <div style={styles.card}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                    Matching Candidates
                  </h2>
                  
                  {candidatesLoading ? (
                    <div style={{ textAlign: 'center', padding: '32px' }}>
                      <div style={{ fontSize: '24px', marginBottom: '16px' }}>⟳</div>
                      <p>Finding matching candidates...</p>
                    </div>
                  ) : candidates.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px', color: '#d1d5db' }}>👥</div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                        No Matching Candidates Found
                      </h3>
                      <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto' }}>
                        We couldn't find any candidates that match this job requisition's requirements.
                      </p>
                    </div>
                  ) : (
                    <div>
                      {candidates.map((candidate, index) => (
                        <CandidateCard 
                          key={index}
                          candidate={candidate}
                          onAssess={() => handleAssessCandidate(candidate.id)}
                          onContact={() => handleContactCandidate(candidate.id)}
                          isAssessing={assessingCandidate === candidate.id}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div style={styles.card}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                  Applications
                </h2>
                
                {requisition.status === 'draft' ? (
                  <div style={{ textAlign: 'center', padding: '32px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px', color: '#d1d5db' }}>📝</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                      This Job Requisition is Still in Draft
                    </h3>
                    <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto 16px' }}>
                      You need to activate this job requisition before candidates can apply.
                    </p>
                    <button
                      onClick={handleActivate}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#047857',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                      disabled={actionInProgress}
                    >
                      {actionInProgress ? 'Activating...' : 'Activate Requisition'}
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px', color: '#d1d5db' }}>📬</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                      No Applications Yet
                    </h3>
                    <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto' }}>
                      You haven't received any applications for this job requisition yet.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div style={styles.card}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                  Analytics
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  <div style={{
                    padding: '24px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#5a45f8', marginBottom: '8px' }}>
                      {candidates.length}
                    </div>
                    <div style={{ color: '#6b7280' }}>Matched Candidates</div>
                  </div>
                  
                  <div style={{
                    padding: '24px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#5a45f8', marginBottom: '8px' }}>
                      0
                    </div>
                    <div style={{ color: '#6b7280' }}>Applications</div>
                  </div>
                  
                  <div style={{
                    padding: '24px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#5a45f8', marginBottom: '8px' }}>
                      0
                    </div>
                    <div style={{ color: '#6b7280' }}>Views</div>
                  </div>
                </div>
                
                <div style={{ textAlign: 'center', padding: '32px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px', color: '#d1d5db' }}>📊</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                    Analytics Coming Soon
                  </h3>
                  <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto' }}>
                    Detailed analytics for this job requisition will be available once it receives more activity.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {deleteConfirmOpen && (
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
              backgroundColor: 'white', 
              borderRadius: '8px', 
              padding: '24px',
              width: '90%',
              maxWidth: '500px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                Delete Job Requisition
              </h3>
              
              <p style={{ marginBottom: '24px' }}>
                Are you sure you want to delete this job requisition? This action cannot be undone.
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'white',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  disabled={actionInProgress}
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleDelete}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  disabled={actionInProgress}
                >
                  {actionInProgress ? 'Deleting...' : 'Delete Requisition'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Skills Assessment Modal */}
        {skillsAssessment && (
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
              backgroundColor: 'white', 
              borderRadius: '8px', 
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <SkillsAssessmentResult 
                assessment={skillsAssessment} 
                onClose={() => setSkillsAssessment(null)} 
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Candidate Card Component
const CandidateCard = ({ candidate, onAssess, onContact, isAssessing }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Helper function to get color based on match percentage
  const getMatchColor = (percentage) => {
    if (percentage >= 90) return '#15803d'; // green
    if (percentage >= 75) return '#5a45f8'; // purple
    if (percentage >= 60) return '#c2410c'; // orange
    return '#6b7280'; // gray
  };
  
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{candidate.name}</h3>
          <div style={{ 
            display: 'inline-block',
            padding: '4px 8px',
            backgroundColor: getMatchColor(candidate.matchPercentage),
            color: 'white',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '12px'
          }}>
            {candidate.matchPercentage}% Match
          </div>
        </div>
        
        <div style={{ 
          padding: '4px 8px',
          backgroundColor: '#f3f4f6', 
          borderRadius: '4px',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          Verification: {candidate.verificationStrength}
        </div>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Top Credentials:</p>
        <ul style={{ paddingLeft: '20px', margin: 0 }}>
          {candidate.topCredentials.map((credential, index) => (
            <li key={index} style={{ fontSize: '14px', marginBottom: '4px' }}>
              {credential}
            </li>
          ))}
        </ul>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button
          style={{
            padding: '8px 12px',
            backgroundColor: 'transparent',
            color: '#5a45f8',
            border: '1px solid #5a45f8',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
          onClick={() => window.open(`/profile/${candidate.id}`, '_blank')}
        >
          View Profile
        </button>
        
        <button
          style={{
            padding: '8px 12px',
            backgroundColor: 'transparent',
            color: '#047857',
            border: '1px solid #047857',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
          onClick={onContact}
        >
          Contact
        </button>
        
        <button
          style={{
            padding: '8px 12px',
            backgroundColor: '#5a45f8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
            opacity: isAssessing ? 0.7 : 1
          }}
          onClick={onAssess}
          disabled={isAssessing}
        >
          {isAssessing ? 'Assessing...' : 'Detailed Assessment'}
        </button>
      </div>
    </div>
  );
};