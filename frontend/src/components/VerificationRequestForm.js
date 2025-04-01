// src/components/VerificationRequestForm.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ErrorHandler from './ErrorHandler';

const VerificationRequestForm = ({ credential, onComplete, onCancel }) => {
  const [verificationNotes, setVerificationNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { getIdToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const idToken = await getIdToken();
      
      const response = await fetch('/api/verification/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          credentialId: credential.id,
          verificationNotes
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit verification request');
      }
      
      setSuccess(true);
      setTimeout(() => {
        onComplete && onComplete(data);
      }, 2000);
    } catch (err) {
      console.error('Error submitting verification request:', err);
      setError(err.message || 'Failed to submit verification request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
        Request Verification
      </h2>
      
      {error && (
        <ErrorHandler 
          error={error}
          onRetry={() => setError(null)}
        />
      )}
      
      {success ? (
        <div style={{
          padding: '16px',
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>✅</div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#16a34a' }}>
            Verification Request Submitted!
          </h3>
          <p style={{ marginBottom: '16px', color: '#166534' }}>
            Your credential has been submitted for verification. You'll be notified when the process is complete.
          </p>
          <p style={{ fontSize: '14px', color: '#166534' }}>
            Verification typically takes 2-3 business days.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ marginBottom: '16px', fontSize: '14px', lineHeight: '1.5' }}>
              You're requesting verification for: <strong>{credential.title}</strong>
            </p>
            
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#f9fafb', 
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                What happens next?
              </h3>
              <ol style={{ paddingLeft: '20px', fontSize: '14px' }}>
                <li style={{ marginBottom: '8px' }}>Our verification team will review your credential</li>
                <li style={{ marginBottom: '8px' }}>We may contact the issuer to confirm details</li>
                <li style={{ marginBottom: '8px' }}>Once verified, your credential will receive blockchain verification</li>
                <li>You'll be notified when the process is complete</li>
              </ol>
            </div>
            
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Additional Notes (Optional)
            </label>
            <textarea
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="Add any information that might help with verification..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                minHeight: '100px',
                resize: 'vertical'
              }}
            />
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              For example, contact information for the issuer or details about when/how you received this credential.
            </p>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
              <input 
                type="checkbox" 
                required
                style={{ marginRight: '8px' }}
              />
              <span>
                I confirm that all information provided is accurate and authentic.
              </span>
            </label>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 16px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                background: 'white',
                fontSize: '14px',
                cursor: 'pointer'
              }}
              disabled={loading}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              style={{
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
                background: '#5a45f8',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                opacity: loading ? 0.7 : 1
              }}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default VerificationRequestForm;