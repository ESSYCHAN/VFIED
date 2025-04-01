// src/components/CredentialShareModal.js
import React, { useState, useEffect } from 'react';

const CredentialShareModal = ({ credential, onClose }) => {
  const [activeTab, setActiveTab] = useState('link');
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [socialMessage, setSocialMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [qrCodeVisible, setQrCodeVisible] = useState(false);
  
  useEffect(() => {
    // Generate a mock share link
    const baseUrl = window.location.origin;
    const mockToken = Math.random().toString(36).substring(2, 15);
    setShareLink(`${baseUrl}/share/credential/${mockToken}`);
    
    // Set default expiry date (7 days from now)
    const defaultExpiry = new Date();
    defaultExpiry.setDate(defaultExpiry.getDate() + 7);
    setExpiryDate(defaultExpiry.toISOString().split('T')[0]);
    
    // Set default social message
    setSocialMessage(`I've earned ${credential.title} from ${credential.issuer}. This credential has been verified by VFied.`);
  }, [credential]);
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const handleGenerateLink = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newToken = Math.random().toString(36).substring(2, 15);
      const baseUrl = window.location.origin;
      setShareLink(`${baseUrl}/share/credential/${newToken}`);
      setLoading(false);
    }, 1000);
  };
  
  const handleSendEmail = () => {
    if (!shareEmail) {
      alert('Please enter an email address');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    }, 1500);
  };
  
  const handleShareToLinkedIn = () => {
    // This would be replaced with actual LinkedIn API integration
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`;
    window.open(linkedInUrl, '_blank');
  };
  
  const handleShareToTwitter = () => {
    // This would be replaced with actual Twitter API integration
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(socialMessage)}&url=${encodeURIComponent(shareLink)}`;
    window.open(twitterUrl, '_blank');
  };
  
  return (
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
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
            Share "{credential.title}"
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => setActiveTab('link')}
            style={{
              padding: '12px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'link' ? '600' : '400',
              color: activeTab === 'link' ? '#5a45f8' : '#6b7280',
              borderBottom: activeTab === 'link' ? '2px solid #5a45f8' : 'none',
              marginBottom: activeTab === 'link' ? '-1px' : '0'
            }}
          >
            Share Link
          </button>
          <button
            onClick={() => setActiveTab('email')}
            style={{
              padding: '12px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'email' ? '600' : '400',
              color: activeTab === 'email' ? '#5a45f8' : '#6b7280',
              borderBottom: activeTab === 'email' ? '2px solid #5a45f8' : 'none',
              marginBottom: activeTab === 'email' ? '-1px' : '0'
            }}
          >
            Email
          </button>
          <button
            onClick={() => setActiveTab('social')}
            style={{
              padding: '12px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'social' ? '600' : '400',
              color: activeTab === 'social' ? '#5a45f8' : '#6b7280',
              borderBottom: activeTab === 'social' ? '2px solid #5a45f8' : 'none',
              marginBottom: activeTab === 'social' ? '-1px' : '0'
            }}
          >
            Social Media
          </button>
        </div>
        
        {/* Share Link Tab */}
        {activeTab === 'link' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Shareable Link
              </label>
              <div style={{ display: 'flex', marginBottom: '12px' }}>
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px 0 0 4px',
                    fontSize: '14px'
                  }}
                />
                <button
                  onClick={handleCopyLink}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: copied ? '#16a34a' : '#5a45f8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0 4px 4px 0',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
              
              <button
                onClick={() => setQrCodeVisible(!qrCodeVisible)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#5a45f8',
                  border: '1px solid #5a45f8',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '16px'
                }}
              >
                {qrCodeVisible ? 'Hide QR Code' : 'Show QR Code'}
              </button>
              
              {qrCodeVisible && (
                <div style={{ 
                  textAlign: 'center', 
                  marginBottom: '16px',
                  padding: '20px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  {/* This would be replaced with an actual QR code component */}
                  <div style={{ 
                    width: '160px', 
                    height: '160px', 
                    backgroundColor: 'white',
                    margin: '0 auto 12px',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    QR Code Placeholder
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    Scan this QR code to view the verified credential
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Link Expiry Date
              </label>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    marginRight: '12px'
                  }}
                />
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  or <a href="#" onClick={(e) => { e.preventDefault(); setExpiryDate(''); }} style={{ color: '#5a45f8', textDecoration: 'none' }}>no expiry</a>
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                After this date, the link will no longer be accessible (leave empty for no expiry).
              </p>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Link Options
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                  <input type="checkbox" defaultChecked={true} />
                  <span style={{ marginLeft: '8px' }}>Include verification details</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                  <input type="checkbox" defaultChecked={true} />
                  <span style={{ marginLeft: '8px' }}>Show blockchain verification</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                  <input type="checkbox" defaultChecked={true} />
                  <span style={{ marginLeft: '8px' }}>Require recipient authentication</span>
                </label>
              </div>
            </div>
            
            <button
              onClick={handleGenerateLink}
              disabled={loading}
              style={{
                backgroundColor: '#5a45f8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                width: '100%',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Generating...' : 'Generate New Link'}
            </button>
          </div>
        )}
        
        {/* Email Tab */}
        {activeTab === 'email' && (
          <div>
            {emailSent ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '24px', 
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>✅</div>
                <h3 style={{ fontWeight: '600', marginBottom: '8px', color: '#16a34a' }}>Email Sent Successfully!</h3>
                <p style={{ color: '#166534' }}>
                  Your credential has been shared with {shareEmail}.
                </p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="Enter email address"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                    Message (optional)
                  </label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Add a personal message..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      minHeight: '100px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                    Email Preview
                  </label>
                  <div style={{ 
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    padding: '16px',
                    backgroundColor: '#f9fafb'
                  }}>
                    <div style={{ fontWeight: '500', marginBottom: '8px' }}>
                      Subject: {credential.title} - Verified Credential Shared
                    </div>
                    <div style={{ 
                      padding: '12px',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}>
                      <p>Hello,</p>
                      <p>{emailMessage || `I would like to share my verified credential "${credential.title}" from "${credential.issuer}" with you.`}</p>
                      <p>You can view the credential by clicking the button below:</p>
                      <div style={{ 
                        backgroundColor: '#5a45f8',
                        color: 'white',
                        padding: '10px 16px',
                        textAlign: 'center',
                        borderRadius: '4px',
                        margin: '16px 0',
                        fontWeight: '500'
                      }}>
                        View Verified Credential
                      </div>
                      <p>This link will expire on {expiryDate ? new Date(expiryDate).toLocaleDateString() : 'never'}.</p>
                      <p>Regards,<br />{credential.userName || 'User'}</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleSendEmail}
                  disabled={loading || !shareEmail}
                  style={{
                    backgroundColor: '#5a45f8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '10px 16px',
                    cursor: shareEmail ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    width: '100%',
                    opacity: (loading || !shareEmail) ? 0.7 : 1
                  }}
                >
                  {loading ? 'Sending...' : 'Send Email'}
                </button>
              </>
            )}
          </div>
        )}
        
        {/* Social Media Tab */}
        {activeTab === 'social' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Share Message
              </label>
              <textarea
                value={socialMessage}
                onChange={(e) => setSocialMessage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                This message will be used when sharing to social media platforms.
              </p>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '500' }}>
                Choose Platform
              </label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={handleShareToLinkedIn}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: '#0077b5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  <div style={{ marginRight: '12px', fontSize: '18px' }}>in</div>
                  <div>Share to LinkedIn</div>
                </button>
                
                <button
                  onClick={handleShareToTwitter}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: '#1DA1F2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  <div style={{ marginRight: '12px', fontSize: '18px' }}>🐦</div>
                  <div>Share to Twitter</div>
                </button>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(socialMessage + ' ' + shareLink).then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    });
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: copied ? '#16a34a' : '#5a45f8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  <div style={{ marginRight: '12px', fontSize: '18px' }}>📋</div>
                  <div>{copied ? 'Copied!' : 'Copy Message with Link'}</div>
                </button>
              </div>
            </div>
            
            <div style={{ 
              textAlign: 'center', 
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <p style={{ marginBottom: '12px', fontSize: '14px' }}>
                Sharing your verified credentials on social media increases your professional visibility.
              </p>
              <a 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert('This would navigate to a guide on effective credential sharing');
                }}
                style={{
                  color: '#5a45f8',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Learn best practices for credential sharing →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CredentialShareModal;