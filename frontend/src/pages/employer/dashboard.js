// src/pages/employer/dashboard.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { getRequisitions, activateRequisition, deleteRequisition } from '../../services/recruiter/requisitionService';
import JobRequisitionForm from '../../components/recruiter/JobRequisitionForm';
import ErrorHandler from '../../components/ErrorHandler';

export default function EmployerDashboard() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    draft: 0,
    filled: 0,
    expired: 0
  });

  // Fetch requisitions on load
  useEffect(() => {
    const fetchRequisitions = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const result = await getRequisitions();
        setRequisitions(result.requisitions || []);
        
        // Calculate stats
        const statsData = {
          total: result.requisitions.length,
          active: result.requisitions.filter(req => req.status === 'active').length,
          draft: result.requisitions.filter(req => req.status === 'draft').length,
          filled: result.requisitions.filter(req => req.status === 'filled').length,
          expired: result.requisitions.filter(req => req.status === 'expired').length
        };
        
        setStats(statsData);
      } catch (err) {
        console.error("Error fetching requisitions:", err);
        setError("Failed to load job requisitions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequisitions();
  }, [currentUser]);

  // Filter requisitions based on selected filter
  const filteredRequisitions = selectedFilter === 'all' 
    ? requisitions 
    : requisitions.filter(req => req.status === selectedFilter);

  // Handle form submission for creating a new requisition
  const handleCreateRequisition = async (formData) => {
    try {
      setLoading(true);
      
      // In a real implementation, this would call the create API
      // For now, simulate adding a new requisition
      const newRequisition = {
        id: `req_${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'draft'
      };
      
      setRequisitions([newRequisition, ...requisitions]);
      setShowCreateForm(false);
      
      // Update stats
      setStats({
        ...stats,
        total: stats.total + 1,
        draft: stats.draft + 1
      });
      
      // Show success message
      alert("Job requisition created successfully!");
    } catch (err) {
      console.error("Error creating requisition:", err);
      setError("Failed to create job requisition: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle activating a requisition
  const handleActivate = async (requisitionId) => {
    try {
      await activateRequisition(requisitionId);
      
      // Update requisition status in the list
      const updatedRequisitions = requisitions.map(req => 
        req.id === requisitionId ? { ...req, status: 'active' } : req
      );
      
      setRequisitions(updatedRequisitions);
      
      // Update stats
      setStats({
        ...stats,
        active: stats.active + 1,
        draft: stats.draft - 1
      });
    } catch (err) {
      console.error("Error activating requisition:", err);
      alert("Failed to activate job requisition: " + err.message);
    }
  };

  // Handle deleting a requisition
  const handleDelete = async (requisitionId) => {
    if (window.confirm("Are you sure you want to delete this job requisition?")) {
      try {
        await deleteRequisition(requisitionId);
        
        // Remove requisition from the list
        const filteredRequisitions = requisitions.filter(req => req.id !== requisitionId);
        const deletedReq = requisitions.find(req => req.id === requisitionId);
        
        setRequisitions(filteredRequisitions);
        
        // Update stats
        const statusType = deletedReq.status;
        setStats({
          ...stats,
          total: stats.total - 1,
          [statusType]: stats[statusType] - 1
        });
      } catch (err) {
        console.error("Error deleting requisition:", err);
        alert("Failed to delete job requisition: " + err.message);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Styles
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#111827'
    },
    button: {
      backgroundColor: '#5a45f8',
      color: 'white',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '6px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    statCard: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '20px'
    },
    statLabel: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '8px'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#111827'
    },
    filters: {
      display: 'flex',
      gap: '8px',
      marginBottom: '16px'
    },
    filterButton: {
      padding: '6px 12px',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: '14px'
    },
    activeFilter: {
      backgroundColor: '#5a45f8',
      color: 'white',
      borderColor: '#5a45f8'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '20px',
      marginBottom: '16px',
      transition: 'transform 0.2s, box-shadow 0.2s'
    },
    cardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    statusBadge: (status) => {
      const colors = {
        draft: { bg: '#e5e7eb', text: '#4b5563' },
        active: { bg: '#d1fae5', text: '#047857' },
        paused: { bg: '#dbeafe', text: '#1e40af' },
        filled: { bg: '#fef3c7', text: '#92400e' },
        expired: { bg: '#fee2e2', text: '#b91c1c' }
      };
      
      return {
        display: 'inline-block',
        padding: '4px 8px',
        borderRadius: '16px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: colors[status]?.bg || colors.draft.bg,
        color: colors[status]?.text || colors.draft.text
      };
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    loadingState: {
      textAlign: 'center',
      padding: '40px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }
  };

  return (
    <Layout>
      <Head>
        <title>Employer Dashboard - VFied</title>
      </Head>
      
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Job Requisitions</h1>
          <button 
            style={styles.button}
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : '+ Create Job Requisition'}
          </button>
        </div>
        
        {error && <ErrorHandler error={error} onRetry={() => setError(null)} />}
        
        {showCreateForm && (
          <JobRequisitionForm 
            onSubmit={handleCreateRequisition}
            onCancel={() => setShowCreateForm(false)}
          />
        )}
        
        {/* Stats Cards */}
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Requisitions</div>
            <div style={styles.statValue}>{stats.total}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Active</div>
            <div style={{...styles.statValue, color: '#047857'}}>{stats.active}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Draft</div>
            <div style={{...styles.statValue, color: '#4b5563'}}>{stats.draft}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Filled</div>
            <div style={{...styles.statValue, color: '#92400e'}}>{stats.filled}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Expired</div>
            <div style={{...styles.statValue, color: '#b91c1c'}}>{stats.expired}</div>
          </div>
        </div>
        
        {/* Filters */}
        <div style={styles.filters}>
          <button 
            style={{
              ...styles.filterButton, 
              ...(selectedFilter === 'all' ? styles.activeFilter : {})
            }}
            onClick={() => setSelectedFilter('all')}
          >
            All
          </button>
          <button 
            style={{
              ...styles.filterButton, 
              ...(selectedFilter === 'active' ? styles.activeFilter : {})
            }}
            onClick={() => setSelectedFilter('active')}
          >
            Active
          </button>
          <button 
            style={{
              ...styles.filterButton, 
              ...(selectedFilter === 'draft' ? styles.activeFilter : {})
            }}
            onClick={() => setSelectedFilter('draft')}
          >
            Draft
          </button>
          <button 
            style={{
              ...styles.filterButton, 
              ...(selectedFilter === 'filled' ? styles.activeFilter : {})
            }}
            onClick={() => setSelectedFilter('filled')}
          >
            Filled
          </button>
          <button 
            style={{
              ...styles.filterButton, 
              ...(selectedFilter === 'expired' ? styles.activeFilter : {})
            }}
            onClick={() => setSelectedFilter('expired')}
          >
            Expired
          </button>
        </div>
        
        {/* Requisition List */}
        {loading && requisitions.length === 0 ? (
          <div style={styles.loadingState}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
            <p>Loading job requisitions...</p>
          </div>
        ) : requisitions.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              No job requisitions found
            </h3>
            <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto 24px' }}>
              Get started by creating your first job requisition to find qualified candidates with verified credentials.
            </p>
            <button 
              style={styles.button}
              onClick={() => setShowCreateForm(true)}
            >
              Create Your First Job Requisition
            </button>
          </div>
        ) : filteredRequisitions.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No job requisitions match the selected filter.</p>
          </div>
        ) : (
          filteredRequisitions.map((req, index) => {
            const [isHovered, setIsHovered] = React.useState(false);
            
            return (
              <div 
                key={req.id || index}
                style={{
                  ...styles.card,
                  ...(isHovered ? styles.cardHover : {})
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                    {req.title}
                  </h3>
                  <div style={styles.statusBadge(req.status)}>
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Company</div>
                    <div>{req.company}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Location</div>
                    <div>{req.location} {req.remote && '(Remote)'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Work Type</div>
                    <div style={{ textTransform: 'capitalize' }}>{req.workType}</div>
                  </div>
                  {(req.salaryMin || req.salaryMax) && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Salary</div>
                      <div>
                        {req.salaryMin && `${req.salaryMin.toLocaleString()} `}
                        {req.salaryMin && req.salaryMax && '- '}
                        {req.salaryMax && `${req.salaryMax.toLocaleString()} `}
                        {(req.salaryMin || req.salaryMax) && req.salaryCurrency}
                      </div>
                    </div>
                  )}
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Required Skills</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {req.requiredSkills && req.requiredSkills.length > 0 ? (
                      req.requiredSkills.map((skill, i) => (
                        <div key={i} style={{
                          backgroundColor: '#f3f4f6',
                          borderRadius: '16px',
                          padding: '4px 12px',
                          fontSize: '14px'
                        }}>
                          {skill.skill}
                          {skill.importance >= 4 && ' *'}
                        </div>
                      ))
                    ) : (
                      <span style={{ color: '#6b7280', fontStyle: 'italic' }}>No specific skills listed</span>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Created: {formatDate(req.createdAt)}
                    {req.expiryDate && ` • Expires: ${formatDate(req.expiryDate)}`}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link href={`/employer/requisitions/${req.id}`}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #5a45f8',
                        backgroundColor: 'white',
                        color: '#5a45f8',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}>
                        View
                      </span>
                    </Link>
                    
                    {req.status === 'draft' && (
                      <button
                        onClick={() => handleActivate(req.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: '#047857',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Activate
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(req.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #ef4444',
                        backgroundColor: 'white',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Layout>
  );
}