// src/pages/requisitions/index.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { getRequisitions } from '../../services/requisitionService';
import { useAuth } from '../../contexts/AuthContext';

const statusColors = {
  active: { bg: '#dcfce7', text: '#15803d' },  // Green
  draft: { bg: '#f3f4f6', text: '#6b7280' },   // Gray
  expired: { bg: '#fee2e2', text: '#b91c1c' }, // Red
  filled: { bg: '#dbeafe', text: '#1d4ed8' },  // Blue
  closed: { bg: '#fef3c7', text: '#b45309' }   // Amber
};

const JobRequisitionList = () => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!currentUser) {
      return;
    }
    
    const fetchRequisitions = async () => {
      try {
        setLoading(true);
        
        // Apply filters
        const filters = {};
        if (filter !== 'all') {
          filters.status = filter;
        }
        
        const data = await getRequisitions(filters);
        setRequisitions(data);
      } catch (err) {
        console.error('Error fetching requisitions:', err);
        setError('Failed to load requisitions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequisitions();
  }, [currentUser, filter]);

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

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Job Requisitions</h1>
          <Link href="/requisitions/new">
            <button style={styles.createButton}>
              Create New Requisition
            </button>
          </Link>
        </div>

        <div style={styles.filterBar}>
          <div style={styles.filters}>
            <button 
              style={{
                ...styles.filterButton,
                ...(filter === 'all' ? styles.activeFilter : {})
              }}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              style={{
                ...styles.filterButton,
                ...(filter === 'active' ? styles.activeFilter : {})
              }}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button 
              style={{
                ...styles.filterButton,
                ...(filter === 'draft' ? styles.activeFilter : {})
              }}
              onClick={() => setFilter('draft')}
            >
              Drafts
            </button>
            <button 
              style={{
                ...styles.filterButton,
                ...(filter === 'filled' ? styles.activeFilter : {})
              }}
              onClick={() => setFilter('filled')}
            >
              Filled
            </button>
            <button 
              style={{
                ...styles.filterButton,
                ...(filter === 'closed' ? styles.activeFilter : {})
              }}
              onClick={() => setFilter('closed')}
            >
              Closed
            </button>
          </div>
        </div>

        {loading ? (
          <div style={styles.loading}>Loading requisitions...</div>
        ) : error ? (
          <div style={styles.error}>{error}</div>
        ) : requisitions.length === 0 ? (
          <div style={styles.empty}>
            <p>No requisitions found.</p>
            {filter !== 'all' && (
              <p>Try changing your filter or create a new requisition.</p>
            )}
          </div>
        ) : (
          <div style={styles.list}>
            {requisitions.map((req) => (
              <div key={req.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <Link href={`/requisitions/${req.id}`} style={styles.cardTitle}>
                    {req.title}
                  </Link>
                  {getStatusBadge(req.status)}
                </div>
                
                <div style={styles.cardBody}>
                  <div style={styles.cardInfo}>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Company:</span>
                      <span style={styles.infoValue}>{req.company}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Location:</span>
                      <span style={styles.infoValue}>{req.location}</span>
                    </div>
                    {req.workType && (
                      <div style={styles.infoItem}>
                        <span style={styles.infoLabel}>Type:</span>
                        <span style={styles.infoValue}>{req.workType}</span>
                      </div>
                    )}
                  </div>
                  
                  <div style={styles.cardMeta}>
                    <div style={styles.salary}>
                      {req.salaryMin && req.salaryMax ? (
                        <span>{req.salaryCurrency || 'USD'} {req.salaryMin.toLocaleString()} - {req.salaryMax.toLocaleString()}</span>
                      ) : (
                        <span>Salary not specified</span>
                      )}
                    </div>
                    
                    <div style={styles.date}>
                      Created: {new Date(req.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div style={styles.cardActions}>
                  <Link href={`/requisitions/${req.id}`} style={styles.viewButton}>
                    View Details
                  </Link>
                  {req.status === 'active' && (
                    <Link href={`/requisitions/${req.id}?tab=candidates`} style={styles.candidatesButton}>
                      View Candidates
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: 0,
  },
  createButton: {
    backgroundColor: '#5a45f8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 16px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  filterBar: {
    marginBottom: '24px',
  },
  filters: {
    display: 'flex',
    gap: '12px',
  },
  filterButton: {
    background: 'none',
    border: 'none',
    padding: '8px 12px',
    cursor: 'pointer',
    borderRadius: '4px',
    color: '#4b5563',
    fontWeight: '500',
  },
  activeFilter: {
    backgroundColor: '#f3f4f6',
    color: '#5a45f8',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '16px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    textDecoration: 'none',
  },
  cardBody: {
    marginBottom: '16px',
  },
  cardInfo: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '12px',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  infoLabel: {
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    color: '#111827',
  },
  cardMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#6b7280',
    fontSize: '14px',
  },
  salary: {
    fontWeight: '500',
  },
  cardActions: {
    display: 'flex',
    gap: '12px',
  },
  viewButton: {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: '#f3f4f6',
    color: '#1f2937',
    border: 'none',
    borderRadius: '4px',
    fontWeight: '500',
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: '14px',
  },
  candidatesButton: {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: '#5a45f8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontWeight: '500',
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: '14px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px 0',
    color: '#6b7280',
  },
  error: {
    textAlign: 'center',
    padding: '40px 0',
    color: '#ef4444',
  },
  empty: {
    textAlign: 'center',
    padding: '40px 0',
    color: '#6b7280',
  },
};

export default JobRequisitionList;