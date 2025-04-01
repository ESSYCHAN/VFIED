// src/pages/admin/verification.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import Head from 'next/head';
import ErrorHandler from '../../components/ErrorHandler';
import { useRouter } from 'next/router';  // Add this import
export default function VerificationAdmin() {
  const router = useRouter();
  const { currentUser, userClaims, getIdToken } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updateNotes, setUpdateNotes] = useState('');
  const [publicNotes, setPublicNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastStartAfter, setLastStartAfter] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  // Check if user has admin permissions
  useEffect(() => {
    if (currentUser && userClaims) {
      if (userClaims.role !== 'admin' && userClaims.role !== 'verifier') {
        router.push('/dashboard');
      }
    }
  }, [currentUser, userClaims, router]);

  // Fetch verification requests
  useEffect(() => {
    const fetchRequests = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const idToken = await getIdToken();
        
        let url = `/api/verification/admin/requests?status=${activeTab}&limit=10`;
        if (lastStartAfter) {
          url += `&startAfter=${lastStartAfter}`;
        }
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch verification requests');
        }
        
        setRequests(prev => lastStartAfter ? [...prev, ...data.requests] : data.requests);
        setHasMore(data.hasMore);
        setLastStartAfter(data.requests.length > 0 ? data.requests[data.requests.length - 1].id : null);
      } catch (err) {
        console.error('Error fetching verification requests:', err);
        setError(err.message || 'Failed to fetch verification requests');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, [currentUser, activeTab, getIdToken]);

  const handleLoadMore = () => {
    // Load more requests
    fetchRequests(true);
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setRequests([]);
    setLastStartAfter(null);
    setHasMore(false);
  };
  
  const handleRequestSelect = (request) => {
    setSelectedRequest(request);
    setUpdateNotes('');
    setPublicNotes('');
  };
  
  const handleUpdateStatus = async (status) => {
    if (!selectedRequest) return;
    
    try {
      setIsUpdating(true);
      
      const idToken = await getIdToken();
      
      const response = await fetch(`/api/verification/admin/update/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          status,
          notes: updateNotes,
          publicNotes
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to update status to ${status}`);
      }
      
      // Update the request in the list
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status, lastUpdated: new Date(), timeline: [...(req.timeline || []), data.timeline] }
          : req
      ));
      
      // If status changed, remove from current tab list
      if (status !== activeTab) {
        setRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
      }
      
      // Close the details view
      setSelectedRequest(null);
      
    } catch (err) {
      console.error('Error updating verification status:', err);
      setError(err.message || 'Failed to update verification status');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get credential type icon
  const getTypeIcon = (type) => {
    return type === 'education' ? '🎓' : 
           type === 'work' ? '💼' : 
           type === 'certificate' ? '📜' : 
           type === 'skill' ? '⚡' : '📄';
  };
  
  return (
    <Layout>
      <Head>
        <title>Verification Admin - VFied</title>
      </Head>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '4px' }}>
          Verification Admin
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Manage verification requests and update their status
        </p>
        
        {error && (
          <ErrorHandler 
            error={error}
            onRetry={() => {
              setError(null);
              setRequests([]);
              setLastStartAfter(null);
              setHasMore(false);
            }}
          />
        )}
        
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => handleTabChange('pending')}
            style={{
              padding: '12px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'pending' ? '600' : '400',
              color: activeTab === 'pending' ? '#5a45f8' : '#6b7280',
              borderBottom: activeTab === 'pending' ? '2px solid #5a45f8' : 'none',
              marginBottom: activeTab === 'pending' ? '-1px' : '0'
            }}
          >
            Pending
          </button>
          <button
            onClick={() => handleTabChange('inProgress')}
            style={{
              padding: '12px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'inProgress' ? '600' : '400',
              color: activeTab === 'inProgress' ? '#5a45f8' : '#6b7280',
              borderBottom: activeTab === 'inProgress' ? '2px solid #5a45f8' : 'none',
              marginBottom: activeTab === 'inProgress' ? '-1px' : '0'
            }}
          >
            In Progress
          </button>
          <button
            onClick={() => handleTabChange('verified')}
            style={{
              padding: '12px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'verified' ? '600' : '400',
              color: activeTab === 'verified' ? '#5a45f8' : '#6b7280',
              borderBottom: activeTab === 'verified' ? '2px solid #5a45f8' : 'none',
              marginBottom: activeTab === 'verified' ? '-1px' : '0'
            }}
          >
            Verified
          </button>
          <button
            onClick={() => handleTabChange('rejected')}
            style={{
              padding: '12px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'rejected' ? '600' : '400',
              color: activeTab === 'rejected' ? '#5a45f8' : '#6b7280',
              borderBottom: activeTab === 'rejected' ? '2px solid #5a45f8' : 'none',
              marginBottom: activeTab === 'rejected' ? '-1px' : '0'
            }}
          >
            Rejected
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ flex: selectedRequest ? '1' : '2' }}>
            {loading && requests.length === 0 ? (
              <div style={{ 
                padding: '40px', 
                textAlign: 'center', 
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '16px' }}>⟳</div>
                <p>Loading verification requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div style={{ 
                padding: '40px', 
                textAlign: 'center', 
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', color: '#d1d5db' }}>📋</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  No {activeTab} requests found
                </h3>
                <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto' }}>
                  {activeTab === 'pending' ? 
                    'There are no pending verification requests at this time.' :
                    `No requests in ${activeTab} status.`
                  }
                </p>
              </div>
            ) : (
              <div style={{ 
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}>
                {requests.map((request, index) => (
                  <div 
                    key={request.id}
                    style={{ 
                      padding: '16px',
                      borderBottom: index === requests.length - 1 ? 'none' : '1px solid #e5e7eb',
                      cursor: 'pointer',
                      backgroundColor: selectedRequest?.id === request.id ? '#f9fafb' : 'white'
                    }}
                    onClick={() => handleRequestSelect(request)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontSize: '18px' }}>
                          {getTypeIcon(request.credentialType)}
                        </div>
                        <div style={{ fontWeight: '500' }}>
                          {request.credentialTitle}
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        padding: '4px 8px', 
                        backgroundColor: activeTab === 'pending' ? '#fef3c7' :
                                          activeTab === 'inProgress' ? '#dbeafe' :
                                          activeTab === 'verified' ? '#d1fae5' :
                                          '#fee2e2',
                        borderRadius: '12px',
                        color: activeTab === 'pending' ? '#92400e' :
                                activeTab === 'inProgress' ? '#1e40af' :
                                activeTab === 'verified' ? '#166534' :
                                '#b91c1c'
                      }}>
                        {request.status}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280' }}>
                      <div>Issuer: {request.credentialIssuer || 'N/A'}</div>
                      <div>Submitted: {formatDate(request.submissionDate)}</div>
                    </div>
                  </div>
                ))}
                
                {hasMore && (
                  <div style={{ padding: '16px', textAlign: 'center' }}>
                    <button
                      onClick={handleLoadMore}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#5a45f8',
                        border: '1px solid #5a45f8',
                        borderRadius: '4px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {selectedRequest && (
            <div style={{ 
              flex: '1',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              padding: '20px',
              position: 'sticky',
              top: '24px',
              maxHeight: 'calc(100vh - 48px)',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600' }}>
                  Request Details
                </h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '18px',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Credential Information
                </h3>
                
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '2px' }}>Title</div>
                  <div style={{ fontWeight: '500' }}>{selectedRequest.credentialTitle}</div>
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '2px' }}>Type</div>
                  <div style={{ textTransform: 'capitalize' }}>{selectedRequest.credentialType}</div>
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '2px' }}>Issuer</div>
                  <div>{selectedRequest.credentialIssuer || 'N/A'}</div>
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '2px' }}>Submitted On</div>
                  <div>{formatDate(selectedRequest.submissionDate)}</div>
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '2px' }}>Status</div>
                  <div style={{ 
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: selectedRequest.status === 'pending' ? '#fef3c7' :
                                    selectedRequest.status === 'inProgress' ? '#dbeafe' :
                                    selectedRequest.status === 'verified' ? '#d1fae5' :
                                    '#fee2e2',
                    color: selectedRequest.status === 'pending' ? '#92400e' :
                          selectedRequest.status === 'inProgress' ? '#1e40af' :
                          selectedRequest.status === 'verified' ? '#166534' :
                          '#b91c1c'
                  }}>
                    {selectedRequest.status}
                  </div>
                </div>
                
                {selectedRequest.verificationNotes && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '2px' }}>User Notes</div>
                    <div style={{ 
                      backgroundColor: '#f9fafb',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}>
                      {selectedRequest.verificationNotes}
                    </div>
                  </div>
                )}
                
                {selectedRequest.documentUrl && (
                  <div style={{ marginTop: '16px' }}>
                    <a
                      href={selectedRequest.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        padding: '8px 16px',
                        backgroundColor: '#5a45f8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        fontSize: '14px'
                      }}
                    >
                      View Document
                    </a>
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Verification Timeline
                </h3>
                
                <div style={{ position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute',
                    left: '8px',
                    top: '8px',
                    bottom: '0',
                    width: '2px',
                    backgroundColor: '#e5e7eb',
                    zIndex: 1
                  }}></div>
                  
                  {(selectedRequest.timeline || []).map((event, index) => (
                    <div 
                      key={index}
                      style={{ 
                        display: 'flex',
                        position: 'relative',
                        zIndex: 2,
                        marginBottom: '20px',
                        paddingLeft: '24px'
                      }}
                    >
                      <div style={{ 
                        position: 'absolute',
                        left: '0',
                        top: '2px',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: event.status === 'submitted' ? '#6b7280' :
                                        event.status === 'pending' ? '#d97706' :
                                        event.status === 'inProgress' ? '#2563eb' :
                                        event.status === 'verified' ? '#16a34a' :
                                        event.status === 'rejected' ? '#dc2626' : '#6b7280'
                      }}></div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '600',
                          marginBottom: '2px',
                          textTransform: 'capitalize'
                        }}>
                          {event.status}
                        </div>
                        <div style={{ 
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '4px'
                        }}>
                          {formatDate(event.date)}
                        </div>
                        <div style={{ fontSize: '14px' }}>
                          {event.note}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Update Status
                </h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                    Internal Notes
                  </label>
                  <textarea
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                    placeholder="Add notes about verification decision (internal only)"
                    style={{ 
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                    Public Notes
                  </label>
                  <textarea
                    value={publicNotes}
                    onChange={(e) => setPublicNotes(e.target.value)}
                    placeholder="These notes will be visible to the user"
                    style={{ 
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(selectedRequest.status === 'pending' || selectedRequest.status === 'rejected') && (
                    <button
                      onClick={() => handleUpdateStatus('inProgress')}
                      disabled={isUpdating}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        opacity: isUpdating ? 0.7 : 1
                      }}
                    >
                      {isUpdating ? 'Updating...' : 'Mark In Progress'}
                    </button>
                  )}
                  
                  {selectedRequest.status !== 'verified' && (
                    <button
                      onClick={() => handleUpdateStatus('verified')}
                      disabled={isUpdating}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        opacity: isUpdating ? 0.7 : 1
                      }}
                    >
                      {isUpdating ? 'Updating...' : 'Verify Credential'}
                    </button>
                  )}
                  
                  {selectedRequest.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus('rejected')}
                      disabled={isUpdating}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        opacity: isUpdating ? 0.7 : 1
                      }}
                    >
                      {isUpdating ? 'Updating...' : 'Reject Credential'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}