// src/pages/requisitions/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { styles } from '../../styles/sharedStyles';
import { getRequisitions, deleteRequisition, activateRequisition } from '../../services/requisitionService';
import JobRequisitionForm from '../../components/recruiter/JobRequisitionForm';
import ErrorHandler from '../../components/ErrorHandler';

export default function JobRequisitionsPage() {
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

  // Check if user has appropriate role
  useEffect(() => {
    if (currentUser && currentUser.role) {
      const allowedRoles = ['employer', 'recruiter', 'admin'];
      if (!allowedRoles.includes(currentUser.role)) {
        router.push('/dashboard');
      }
    }
  }, [currentUser, router]);

  // Fetch requisitions on load
  useEffect(() => {
    const fetchRequisitions = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const result = await getRequisitions();
        
        // If no requisitions found, use empty array
        const reqList = result.requisitions || [];
        setRequisitions(reqList);
        
        // Calculate stats
        const statsData = {
          total: reqList.length,
          active: reqList.filter(req => req.status === 'active').length,
          draft: reqList.filter(req => req.status === 'draft').length,
          filled: reqList.filter(req => req.status === 'filled').length,
          expired: reqList.filter(req => req.status === 'expired').length
        };
        
        setStats(statsData);
      } catch (err) {
        console.error("Error fetching requisitions:", err);
        setError("Failed to load job requisitions. Please try again.");
        
        // Use empty data in case of error
        setRequisitions([]);
        setStats({
          total: 0,
          active: 0,
          draft: 0,
          filled: 0,
          expired: 0
        });
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
        status: 'draft',
        companyId: currentUser.uid
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

  return (
    <Layout>
      <Head>
        <title>Job Requisitions - VFied</title>
        <meta name="description" content="Manage your job requisitions on VFied platform" />
      </Head>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={styles.flexBetween}>
          <div>
            <h1 style={styles.title}>Job Requisitions</h1>
            <p style={styles.subtitle}>
              Create and manage your job requisitions to find verified talent
            </p>
          </div>
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
        <div style={styles.statsGrid}>
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
        
        {/* Filter tabs */}
        <div style={{ 
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          flexWrap: 'wrap'
        }}>
          <button 
            style={{
              padding: '6px 12px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              backgroundColor: selectedFilter === 'all' ? '#5a45f8' : 'white',
              color: selectedFilter === 'all' ? 'white' : '#6b7280',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onClick={() => setSelectedFilter('all')}
          >
            All
          </button>
          <button 
            style={{
              padding: '6px 12px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              backgroundColor: selectedFilter === 'active' ? '#5a45f8' : 'white',
              color: selectedFilter === 'active' ? 'white' : '#6b7280',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onClick={() => setSelectedFilter('active')}
          >
            Active
          </button>
          <button 
            style={{
              padding: '6px 12px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              backgroundColor: selectedFilter === 'draft' ? '#5a45f8' : 'white',
              color: selectedFilter === 'draft' ? 'white' : '#6b7280',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onClick={() => setSelectedFilter('draft')}
          >
            Draft
          </button>
          <button 
            style={{
              padding: '6px 12px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              backgroundColor: selectedFilter === 'filled' ? '#5a45f8' : 'white',
              color: selectedFilter === 'filled' ? 'white' : '#6b7280',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onClick={() => setSelectedFilter('filled')}
          >
            Filled
          </button>
          <button 
            style={{
              padding: '6px 12px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              backgroundColor: selectedFilter === 'expired' ? '#5a45f8' : 'white',
              color: selectedFilter === 'expired' ? 'white' : '#6b7280',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onClick={() => setSelectedFilter('expired')}
          >
            Expired
          </button>
        </div>
        
        {/* Requisition List */}
        {loading ? (
          <div style={{ ...styles.card, textAlign: 'center', padding: '32px' }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>⟳</div>
            <p>Loading job requisitions...</p>
          </div>
        ) : filteredRequisitions.length === 0 ? (
          <div style={{ ...styles.card, textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', color: '#d1d5db' }}>📋</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              No job requisitions found
            </h3>
            <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto 24px' }}>
              {selectedFilter === 'all' 
                ? 'Create your first job requisition to find qualified candidates with verified credentials.'
                : `You don't have any ${selectedFilter} requisitions.`}
            </p>
            {selectedFilter === 'all' && (
              <button 
                style={styles.button}
                onClick={() => setShowCreateForm(true)}
              >
                Create Your First Job Requisition
              </button>
            )}
          </div>
        ) : (
          filteredRequisitions.map((req) => (
            <RequisitionCard 
              key={req.id} 
              requisition={req} 
              onActivate={handleActivate}
              onDelete={handleDelete}
              formatDate={formatDate}
            />
          ))
        )}
      </div>
    </Layout>
  );
}

// Requisition Card Component
const RequisitionCard = ({ requisition, onActivate, onDelete, formatDate }) => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
          {requisition.title}
        </h3>
        <div style={getStatusBadge(requisition.status)}>
          {requisition.status.charAt(0).toUpperCase() + requisition.status.slice(1)}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Company</div>
          <div>{requisition.company}</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Location</div>
          <div>{requisition.location} {requisition.remote && '(Remote)'}</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Work Type</div>
          <div style={{ textTransform: 'capitalize' }}>{requisition.workType}</div>
        </div>
        {(requisition.salaryMin || requisition.salaryMax) && (
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Salary</div>
            <div>
              {requisition.salaryMin && `${requisition.salaryMin.toLocaleString()} `}
              {requisition.salaryMin && requisition.salaryMax && '- '}
              {requisition.salaryMax && `${requisition.salaryMax.toLocaleString()} `}
              {(requisition.salaryMin || requisition.salaryMax) && requisition.salaryCurrency}
              {' / '}
              {requisition.salaryPeriod}
            </div>
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Required Skills</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {requisition.requiredSkills && requisition.requiredSkills.length > 0 ? (
            requisition.requiredSkills.map((skill, i) => (
              <div key={i} style={{
                backgroundColor: '#f3f4f6',
                borderRadius: '16px',
                padding: '4px 12px',
                fontSize: '14px'
              }}>
                {typeof skill === 'object' ? skill.skill : skill}
                {typeof skill === 'object' && skill.importance >= 4 && ' *'}
              </div>
            ))
          ) : (
            <span style={{ color: '#6b7280', fontStyle: 'italic' }}>No specific skills listed</span>
          )}
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          Created: {formatDate(requisition.createdAt)}
          {requisition.expiryDate && ` • Expires: ${formatDate(requisition.expiryDate)}`}
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/requisitions/${requisition.id}`}>
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
          
          {requisition.status === 'draft' && (
            <button
              onClick={() => onActivate(requisition.id)}
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
            onClick={() => onDelete(requisition.id)}
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
};