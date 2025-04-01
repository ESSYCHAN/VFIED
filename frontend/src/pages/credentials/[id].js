// src/pages/credentials/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Head from 'next/head';
import Layout from '../../components/Layout';
import VerificationStatusTracker from '../../components/VerificationStatusTracker';
import ErrorHandler from '../../components/ErrorHandler';
import { styles } from '../../styles/sharedStyles';
import CredentialShareModal from '../../components/CredentialShareModal';

export default function CredentialDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { currentUser } = useAuth();
  const [credential, setCredential] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCredential, setEditedCredential] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  
  useEffect(() => {
    async function fetchCredential() {
      if (!id || !currentUser) return;
      
      setLoading(true);
      
      try {
        // Try to fetch from Firestore
        const docRef = doc(db, 'credentials', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Verify this credential belongs to the current user
          if (data.userId !== currentUser.uid) {
            setError("You don't have permission to view this credential");
            setCredential(null);
            return;
          }
          
          const credentialData = {
            id: docSnap.id,
            ...data,
            dateIssued: data.dateIssued?.toDate?.()?.toISOString() || data.dateIssued,
            dateUploaded: data.dateUploaded?.toDate?.()?.toISOString() || data.dateUploaded
          };
          
          setCredential(credentialData);
          setEditedCredential(credentialData);
          setError(null);
        } else {
          // Handle case where credential doesn't exist
          setError("Credential not found");
          
          // For demo purposes, create a mock credential
          const mockCredential = {
            id,
            title: "Sample Credential",
            type: "certificate",
            issuer: "VFied Demo Organization",
            dateIssued: new Date().toISOString(),
            dateUploaded: new Date().toISOString(),
            description: "This is a sample credential for demonstration purposes.",
            verificationStatus: ["draft", "pending", "inProgress", "verified", "rejected"][Math.floor(Math.random() * 5)],
            userId: currentUser.uid,
            skills: ["Sample Skill 1", "Sample Skill 2", "Sample Skill 3"]
          };
          
          setCredential(mockCredential);
          setEditedCredential(mockCredential);
        }
      } catch (err) {
        console.error("Error fetching credential:", err);
        setError("Failed to load credential details");
        
        // For demo purposes, use a mock credential
        const mockCredential = {
          id,
          title: "Sample Credential",
          type: "certificate",
          issuer: "VFied Demo Organization",
          dateIssued: new Date().toISOString(),
          dateUploaded: new Date().toISOString(),
          description: "This is a sample credential for demonstration purposes.",
          verificationStatus: ["draft", "pending", "inProgress", "verified", "rejected"][Math.floor(Math.random() * 5)],
          userId: currentUser.uid,
          skills: ["Sample Skill 1", "Sample Skill 2", "Sample Skill 3"]
        };
        
        setCredential(mockCredential);
        setEditedCredential(mockCredential);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCredential();
  }, [id, currentUser]);
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setEditedCredential(credential);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedCredential(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSkillChange = (skills) => {
    setEditedCredential(prev => ({
      ...prev,
      skills
    }));
  };
  
  const handleSave = async () => {
    // Save changes logic would go here
    // For demo, just update the local state
    setCredential(editedCredential);
    setIsEditing(false);
    
    // Show success message
    alert("Credential updated successfully!");
  };
  
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this credential? This action cannot be undone.")) {
      // Delete logic would go here
      
      // Navigate back to dashboard
      router.push('/dashboard');
    }
  };
  
  const handleRetry = () => {
    // Re-fetch credential
    router.reload();
  };
  
  if (loading) {
    return (
      <Layout>
        <div style={{ ...styles.card, textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
          <p>Loading credential details...</p>
        </div>
      </Layout>
    );
  }
  
  // Get credential type icon
  const getTypeIcon = (type) => {
    return type === 'education' ? '🎓' : 
           type === 'work' ? '💼' : 
           type === 'certificate' ? '📜' : 
           type === 'skill' ? '⚡' : '📄';
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (error) {
      console.error("Date formatting error:", error);
      return 'Invalid date';
    }
  };
  
  return (
    <Layout>
      <Head>
        <title>{credential?.title || 'Credential Details'} - VFied</title>
      </Head>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <div style={styles.flexBetween}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => router.push('/dashboard')}
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
            <h1 style={{ fontSize: '24px', fontWeight: '600' }}>Credential Details</h1>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {!isEditing ? (
              <>
                <button
                  onClick={handleEdit}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#5a45f8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Edit Credential
                </button>
                
                <button
                  onClick={handleDelete}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: '#dc2626',
                    border: '1px solid #dc2626',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Save Changes
                </button>
                
                <button
                  onClick={handleCancel}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
        
        {error && (
          <ErrorHandler
            error={error}
            onRetry={handleRetry}
          />
        )}
        
        {credential && (
          <>
            <VerificationStatusTracker credential={credential} />
            
            <div style={{ ...styles.card, marginBottom: '20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '24px', marginRight: '12px' }}>
                    {getTypeIcon(credential.type)}
                  </div>
                  
                  {isEditing ? (
                    <input 
                      type="text"
                      name="title"
                      value={editedCredential.title}
                      onChange={handleChange}
                      style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        width: '100%'
                      }}
                    />
                  ) : (
                    <h2 style={{ fontSize: '20px', fontWeight: '600' }}>
                      {credential.title}
                    </h2>
                  )}
                </div>
                
                <div style={{ 
                  display: 'inline-block',
                  padding: '4px 12px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '16px',
                  fontSize: '14px',
                  marginBottom: '16px'
                }}>
                  {isEditing ? (
                    <select
                      name="type"
                      value={editedCredential.type}
                      onChange={handleChange}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        fontSize: '14px'
                      }}
                    >
                      <option value="education">Education</option>
                      <option value="work">Work Experience</option>
                      <option value="certificate">Certificate</option>
                      <option value="skill">Skill</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    credential.type.charAt(0).toUpperCase() + credential.type.slice(1)
                  )}
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Details</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Issuer</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="issuer"
                        value={editedCredential.issuer || ''}
                        onChange={handleChange}
                        placeholder="e.g., MIT, Google, Coursera"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '16px'
                        }}
                      />
                    ) : (
                      <div>{credential.issuer || 'N/A'}</div>
                    )}
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Date Issued</div>
                    {isEditing ? (
                      <input
                        type="date"
                        name="dateIssued"
                        value={editedCredential.dateIssued ? editedCredential.dateIssued.split('T')[0] : ''}
                        onChange={handleChange}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '16px'
                        }}
                      />
                    ) : (
                      <div>{formatDate(credential.dateIssued)}</div>
                    )}
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Description</div>
                    {isEditing ? (
                      <textarea
                        name="description"
                        value={editedCredential.description || ''}
                        onChange={handleChange}
                        placeholder="Add details about this credential..."
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '16px',
                          minHeight: '100px'
                        }}
                      />
                    ) : (
                      <div style={{ lineHeight: '1.5' }}>{credential.description || 'No description provided.'}</div>
                    )}
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Skills</div>
                    {isEditing ? (
                      <div>
                        <div style={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: '8px',
                          marginBottom: '12px'
                        }}>
                          {(editedCredential.skills || []).map((skill, index) => (
                            <div key={index} style={{
                              backgroundColor: '#e5e7eb',
                              padding: '4px 12px',
                              borderRadius: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: '14px'
                            }}>
                              {skill}
                              <button
                                type="button"
                                onClick={() => {
                                  const newSkills = [...editedCredential.skills];
                                  newSkills.splice(index, 1);
                                  handleSkillChange(newSkills);
                                }}
                                style={{
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  marginLeft: '4px',
                                  cursor: 'pointer',
                                  fontSize: '16px',
                                  color: '#6b7280',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <div style={{ display: 'flex' }}>
                          <input
                            type="text"
                            placeholder="Add a skill"
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px 0 0 4px',
                              fontSize: '16px'
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const newSkill = e.target.value.trim();
                                if (newSkill) {
                                  handleSkillChange([...(editedCredential.skills || []), newSkill]);
                                  e.target.value = '';
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              const input = e.target.previousSibling;
                              const newSkill = input.value.trim();
                              if (newSkill) {
                                handleSkillChange([...(editedCredential.skills || []), newSkill]);
                                input.value = '';
                              }
                            }}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#5a45f8',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0 4px 4px 0',
                              cursor: 'pointer'
                            }}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {(credential.skills || []).length > 0 ? (
                          (credential.skills || []).map((skill, index) => (
                            <div key={index} style={{
                              backgroundColor: '#e5e7eb',
                              padding: '4px 12px',
                              borderRadius: '16px',
                              fontSize: '14px'
                            }}>
                              {skill}
                            </div>
                          ))
                        ) : (
                          <div style={{ color: '#6b7280', fontStyle: 'italic' }}>No skills added</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Document</h3>
                {credential.documentUrl || credential.fileUrl ? (
                  <div style={{ 
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{ fontSize: '24px' }}>📄</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                        {credential.fileName || 'Credential Document'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Uploaded on {formatDate(credential.dateUploaded || credential.createdAt)}
                      </div>
                    </div>
                    <a
                      href={credential.documentUrl || credential.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
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
                ) : (
                  <div style={{ 
                    textAlign: 'center',
                    padding: '24px',
                    border: '1px dashed #d1d5db',
                    borderRadius: '4px',
                    color: '#6b7280'
                  }}>
                    {isEditing ? (
                      <div>
                        <p style={{ marginBottom: '12px' }}>Drag and drop a document here or click to browse</p>
                        <button
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#5a45f8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                          onClick={() => alert('File upload functionality would be implemented here')}
                        >
                          Upload Document
                        </button>
                      </div>
                    ) : (
                      <p>No document has been uploaded for this credential.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {credential.verificationStatus === 'verified' && (
              <div style={{ ...styles.card, marginBottom: '20px', border: '1px solid #16a34a' }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  marginBottom: '16px', 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#16a34a'
                }}>
                  <span>🔒</span>
                  <span>Blockchain Verification</span>
                </h3>
                
                <div style={{ 
                  backgroundColor: '#f0fdf4', 
                  padding: '16px', 
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <p style={{ marginBottom: '12px', fontSize: '14px' }}>
                    This credential has been cryptographically verified and recorded on the blockchain.
                    The verification hash below can be used to independently verify the authenticity of this credential.
                  </p>
                  
                  <div style={{ 
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    padding: '8px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    wordBreak: 'break-all',
                    marginBottom: '12px'
                  }}>
                    {`0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      style={{
                        backgroundColor: 'transparent',
                        color: '#16a34a',
                        border: '1px solid #16a34a',
                        borderRadius: '4px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onClick={() => alert('This would open the verification portal')}
                    >
                      <span>🔍</span> Verify on Blockchain
                    </button>
                  </div>
                </div>
                
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  <button
  onClick={() => setShowShareModal(true)}
  style={{
    padding: '8px 16px',
    backgroundColor: '#5a45f8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  }}
>
  Share Credential
</button>
                  </h4>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      style={{
                        backgroundColor: '#0077b5',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        flex: 1
                      }}
                      onClick={() => alert('Share to LinkedIn functionality would be implemented here')}
                    >
                      LinkedIn
                    </button>
                    
                    <button
                      style={{
                        backgroundColor: '#5a45f8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        flex: 1
                      }}
                      onClick={() => alert('Generate public URL functionality would be implemented here')}
                    >
                      Copy Public URL
                    </button>
                    
                    <button
                      style={{
                        backgroundColor: '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        flex: 1
                      }}
                      onClick={() => alert('Download certificate functionality would be implemented here')}
                    >
                      Download Certificate
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div style={styles.card}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Activity Log</h3>
              
              {[
                { 
                  action: 'Credential Created', 
                  date: credential.createdAt || credential.dateUploaded, 
                  user: 'You'
                },
                ...(credential.verificationStatus !== 'draft' ? [{ 
                  action: 'Verification Requested', 
                  date: new Date(new Date(credential.createdAt || credential.dateUploaded).getTime() + 86400000).toISOString(),
                  user: 'You'
                }] : []),
                ...(credential.verificationStatus === 'verified' ? [{ 
                  action: 'Verification Completed', 
                  date: new Date(new Date(credential.createdAt || credential.dateUploaded).getTime() + 345600000).toISOString(),
                  user: 'VFied Verification Team'
                }] : []),
                ...(credential.verificationStatus === 'rejected' ? [{ 
                  action: 'Verification Failed', 
                  date: new Date(new Date(credential.createdAt || credential.dateUploaded).getTime() + 345600000).toISOString(),
                  user: 'VFied Verification Team'
                }] : [])
              ].sort((a, b) => new Date(b.date) - new Date(a.date)).map((activity, index) => (
                <div 
                  key={index}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '12px 0',
                    borderBottom: index === 0 ? 'none' : '1px solid #e5e7eb'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '500' }}>{activity.action}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>By {activity.user}</div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {formatDate(activity.date)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {credential && showShareModal && (
  <CredentialShareModal 
    credential={credential} 
    onClose={() => setShowShareModal(false)} 
  />
)}


    </Layout>
  );
}