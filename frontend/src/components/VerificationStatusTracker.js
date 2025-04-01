// src/components/VerificationStatusTracker.js
import React, { useState } from 'react';
import { styles } from '../styles/sharedStyles';

const VerificationStatusTracker = ({ credential }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!credential) return null;
  
  const statusMap = {
    draft: {
      icon: '📝',
      title: 'Draft',
      description: 'Your credential has been saved but not submitted for verification.',
      color: '#6b7280',
      progress: 0
    },
    pending: {
      icon: '⏳',
      title: 'Pending Verification',
      description: 'Your credential is being reviewed by our verification team.',
      color: '#d97706',
      progress: 33
    },
    inProgress: {
      icon: '🔍',
      title: 'Verification in Progress',
      description: 'Our team is actively verifying this credential with the issuer.',
      color: '#2563eb',
      progress: 66
    },
    verified: {
      icon: '✅',
      title: 'Verified',
      description: 'This credential has been successfully verified.',
      color: '#16a34a',
      progress: 100
    },
    rejected: {
      icon: '❌',
      title: 'Verification Failed',
      description: 'We could not verify this credential. Please check the details and try again.',
      color: '#dc2626',
      progress: 100
    }
  };
  
  // Get current status (default to draft if not set)
  const status = credential.verificationStatus || credential.status || 'draft';
  const statusDetails = statusMap[status] || statusMap.draft;
  
  const getVerificationTimeline = () => {
    // Sample verification events (in a real app, these would come from the credential object)
    const events = [];
    
    if (credential.dateUploaded || credential.createdAt) {
      events.push({
        date: credential.dateUploaded || credential.createdAt,
        status: 'Credential Uploaded',
        description: 'You uploaded this credential to VFied.'
      });
    }
    
    if (status !== 'draft' && credential.dateSubmitted) {
      events.push({
        date: credential.dateSubmitted,
        status: 'Submitted for Verification',
        description: 'You requested verification of this credential.'
      });
    }
    
    if (status === 'pending' || status === 'inProgress' || status === 'verified' || status === 'rejected') {
      events.push({
        date: credential.verificationStartDate || new Date(Date.now() - 172800000).toISOString(), // Mock date if not available
        status: 'Verification Started',
        description: 'Our team started verifying this credential.'
      });
    }
    
    if (status === 'inProgress' || status === 'verified' || status === 'rejected') {
      events.push({
        date: credential.verificationProgressDate || new Date(Date.now() - 86400000).toISOString(), // Mock date if not available
        status: 'Issuer Contacted',
        description: 'We reached out to the issuer to confirm the credential details.'
      });
    }
    
    if (status === 'verified') {
      events.push({
        date: credential.verificationDate || new Date().toISOString(),
        status: 'Verification Complete',
        description: 'This credential has been successfully verified!'
      });
    }
    
    if (status === 'rejected') {
      events.push({
        date: credential.rejectionDate || new Date().toISOString(),
        status: 'Verification Failed',
        description: credential.rejectionReason || 'The issuer could not verify this credential. Please check the details and try again.'
      });
    }
    
    // Sort events by date
    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
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
  
  const timeline = getVerificationTimeline();
  
  return (
    <div style={{ 
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          padding: '4px 0'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ fontSize: '24px', marginRight: '12px' }}>
          {statusDetails.icon}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            marginBottom: '4px',
            color: statusDetails.color
          }}>
            {statusDetails.title}
          </h3>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ 
              height: '6px', 
              backgroundColor: '#e5e7eb',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                height: '100%', 
                width: `${statusDetails.progress}%`,
                backgroundColor: statusDetails.color,
                borderRadius: '3px'
              }}></div>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            {statusDetails.description}
          </p>
        </div>
        <div style={{ 
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          fontSize: '18px',
          color: '#9ca3af'
        }}>
          ▼
        </div>
      </div>
      
      {expanded && (
        <div style={{ 
          marginTop: '16px',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '16px'
        }}>
          <h4 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '12px' 
          }}>
            Verification Timeline
          </h4>
          
          <div style={{ position: 'relative' }}>
            <div style={{ 
              position: 'absolute',
              left: '8px',
              top: '0',
              bottom: '0',
              width: '2px',
              backgroundColor: '#e5e7eb',
              zIndex: 1
            }}></div>
            
            {timeline.map((event, index) => (
              <div 
                key={index}
                style={{ 
                  display: 'flex',
                  position: 'relative',
                  zIndex: 2,
                  marginBottom: '20px'
                }}
              >
                <div style={{ 
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: index === timeline.length - 1 ? statusDetails.color : '#9ca3af',
                  marginRight: '16px',
                  flexShrink: 0,
                  marginTop: '2px'
                }}></div>
                
                <div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600',
                    marginBottom: '2px'
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
                    {event.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {status === 'draft' && (
            <div style={{ marginTop: '16px' }}>
              <button
                style={{
                  backgroundColor: '#5a45f8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Request Verification
              </button>
              <p style={{ 
                fontSize: '13px', 
                color: '#6b7280', 
                marginTop: '8px',
                fontStyle: 'italic'
              }}>
                Note: Verification typically takes 2-3 business days.
              </p>
            </div>
          )}
          
          {status === 'rejected' && (
            <div style={{ marginTop: '16px' }}>
              <button
                style={{
                  backgroundColor: '#5a45f8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Update & Resubmit
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerificationStatusTracker;