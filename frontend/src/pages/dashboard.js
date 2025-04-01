// src/pages/dashboard.js
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import Layout from '../components/Layout';
import Head from 'next/head';
import { styles } from '../styles/sharedStyles';
import Link from 'next/link';
import { performSkillsAssessment, getJobCandidates } from '../services/recruitmentService';
// // Import all the components used
// import CredentialCard from '../components/CredentialCard';
// import StatCard from '../components/StatCard';
// import AIJobMatching from '../components/AIJobMatching';
// import CredentialUploadForm from '../components/CredentialUploadForm';

// Credential Card Component
const CredentialCard = ({ credential, onUpdate }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  
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

  // Get status badge style
  const getStatusBadge = (status) => {
    switch(status) {
      case 'verified':
        return { ...styles.badge, ...styles.badgeSuccess };
      case 'pending':
        return { ...styles.badge, ...styles.badgeWarning };
      case 'rejected':
        return { ...styles.badge, ...styles.badgeDanger };
      case 'draft':
        return { ...styles.badge, ...styles.badgeInfo };
      default:
        return { ...styles.badge, ...styles.badgeInfo };
    }
  };

  // Get icon and color for credential type
  const getTypeIcon = (type) => {
    return (
      <div style={{ fontSize: '16px', marginRight: '8px' }}>
        {type === 'education' ? '🎓' : 
         type === 'work' ? '💼' : 
         type === 'certificate' ? '📜' : 
         type === 'skill' ? '⚡' : '📄'}
      </div>
    );
  };

  const handleRequestVerification = async (e) => {
    e.stopPropagation();
    if (credential.verificationStatus !== 'draft' && credential.status !== 'draft') return;
    
    try {
      setIsRequesting(true);
      // This would be replaced with your actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onUpdate(); // Refresh the list
    } catch (error) {
      console.error('Failed to request verification:', error);
      alert('Failed to request verification. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this credential?')) {
      try {
        setIsDeleting(true);
        // This would be replaced with your actual API call
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        onUpdate(); // Refresh the list
      } catch (error) {
        console.error('Failed to delete credential:', error);
        alert('Failed to delete credential. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const status = credential.verificationStatus || credential.status || 'draft';

  return (
    <div 
      style={{
        ...styles.credentialCard,
        ...(isHovered ? styles.credentialCardHover : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {getTypeIcon(credential.type)}
          <span style={styles.credentialType}>
            {credential.type ? (credential.type.charAt(0).toUpperCase() + credential.type.slice(1)) : 'Document'}
          </span>
        </div>
        <div style={getStatusBadge(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>
      
      <h3 style={styles.credentialTitle}>{credential.title}</h3>
      {credential.issuer && <p style={styles.credentialIssuer}>{credential.issuer}</p>}
      
      <p style={{ fontSize: '12px', color: '#6b7280' }}>
        {credential.dateIssued ? 
          `Issued: ${formatDate(credential.dateIssued)}` : 
          `Uploaded: ${formatDate(credential.createdAt || credential.dateUploaded)}`}
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
        {(credential.documentUrl || credential.fileUrl) ? (
          <a 
            href={credential.documentUrl || credential.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#5a45f8', fontSize: '12px', fontWeight: '500', textDecoration: 'none' }}
          >
            View Document
          </a>
        ) : (
          <span></span>
        )}
        
        <div>
          {(status === 'draft') && (
            <button 
              style={{ 
                backgroundColor: 'transparent', 
                border: 'none', 
                color: '#15803d', 
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                marginLeft: '8px'
              }}
              onClick={handleRequestVerification}
              disabled={isRequesting}
            >
              {isRequesting ? 'Requesting...' : 'Request Verification'}
            </button>
          )}
          
          <Link href={`/credentials/${credential.id}`} passHref>
            <a
              style={{ 
                backgroundColor: 'transparent', 
                border: 'none', 
                color: '#5a45f8', 
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                marginLeft: '8px',
                textDecoration: 'none'
              }}
            >
              Details
            </a>
          </Link>
          
          <button 
            style={{ 
              backgroundColor: 'transparent', 
              border: 'none', 
              color: '#b91c1c', 
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              marginLeft: '8px'
            }}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, color, icon }) => {
  return (
    <div style={styles.statCard}>
      <div style={styles.flexBetween}>
        <div>
          <p style={styles.statLabel}>{title}</p>
          <p style={{ ...styles.statValue, color }}>{value}</p>
        </div>
        <div style={{ 
          width: '36px', 
          height: '36px', 
          borderRadius: '8px',
          backgroundColor: color + '10', // 10% opacity
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// AI Job Matching Component
const AIJobMatching = ({ userId, credentials }) => {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleAddSkill = () => {
    if (currentSkill.trim()) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!jobTitle || !jobDescription || skills.length === 0) {
      setError('Please fill in all required fields and add at least one skill');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const jobRequirements = {
        title: jobTitle,
        description: jobDescription,
        skills,
        userId
      };
      
      // Call LBM-powered skills assessment service
      // For demonstration, we'll mock this response
      await new Promise(r => setTimeout(r, 2000)); // Simulate API delay
      
      // Simulate assessment results
      const mockAssessment = {
        overallMatchPercentage: Math.floor(Math.random() * 30) + 70, // 70-99%
        skillMatchRatings: skills.map(skill => ({
          skill,
          matchPercentage: Math.floor(Math.random() * 40) + 60 // 60-99%
        })),
        strengths: [
          "Strong background in " + skills[0],
          "Verified education credentials in relevant field",
          "Demonstrated experience with " + (skills[1] || skills[0])
        ],
        skillGaps: [
          "Limited experience with " + (skills[skills.length - 1] || "advanced technologies"),
          "No verification for " + (skills[Math.floor(skills.length / 2)] || "leadership skills"),
          "Consider obtaining certification in " + (skills[0] || "relevant field")
        ],
        recommendations: [
          "Focus on obtaining certification for " + (skills[0] || "key skills"),
          "Add more details to work experience credentials",
          "Update education credentials with specific courses"
        ]
      };
      
      setResults(mockAssessment);
    } catch (err) {
      console.error('Error performing skills assessment:', err);
      setError('Failed to analyze skills. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to render the skill match result
  const renderSkillMatch = () => {
    if (!results) return null;
    
    return (
      <div style={{ 
        backgroundColor: '#f9fafb', 
        borderRadius: '8px', 
        padding: '16px',
        marginTop: '20px' 
      }}>
        <h3 style={{ fontWeight: '600', fontSize: '18px', marginBottom: '12px' }}>
          Skills Assessment Results
        </h3>
        
        <div style={{ 
          backgroundColor: getMatchColor(results.overallMatchPercentage), 
          color: 'white', 
          padding: '8px 16px', 
          borderRadius: '16px', 
          display: 'inline-block',
          marginBottom: '16px'
        }}>
          {results.overallMatchPercentage}% Match
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>Key Strengths:</h4>
          <ul style={{ paddingLeft: '20px' }}>
            {results.strengths.slice(0, 3).map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>Skill Gaps:</h4>
          <ul style={{ paddingLeft: '20px' }}>
            {results.skillGaps.slice(0, 3).map((gap, index) => (
              <li key={index}>{gap}</li>
            ))}
          </ul>
        </div>
        
        <button
          onClick={() => setResults(null)}
          style={{
            backgroundColor: '#5a45f8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer'
          }}
        >
          Close Assessment
        </button>
      </div>
    );
  };

  // Helper function to get color based on match percentage
  const getMatchColor = (percentage) => {
    if (percentage >= 90) return '#15803d'; // green
    if (percentage >= 75) return '#5a45f8'; // purple
    if (percentage >= 60) return '#c2410c'; // orange
    return '#6b7280'; // gray
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={styles.flexBetween}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          AI Skills Assessment
        </h2>
        {!showForm && !results && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              backgroundColor: '#5a45f8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            Assess My Skills
          </button>
        )}
      </div>
      
      {showForm && !results && (
        <div style={styles.card}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Enter Job Details to Assess Your Skills
          </h3>
          
          {error && (
            <div style={{ 
              backgroundColor: '#FFEBEE', 
              color: '#B71C1C', 
              padding: '12px', 
              borderRadius: '4px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Job Title*
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px'
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Job Description*
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  minHeight: '100px'
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Required Skills*
              </label>
              <div style={{ display: 'flex' }}>
                <input
                  type="text"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  placeholder="Add a skill"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px 0 0 4px'
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
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
              
              {skills.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '8px',
                  marginTop: '12px'
                }}>
                  {skills.map((skill, index) => (
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
                        onClick={() => handleRemoveSkill(skill)}
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
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: '#5a45f8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Analyzing...' : 'Analyze My Skills'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={loading}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {renderSkillMatch()}
    </div>
  );
};

// Credential Upload Form Component
const CredentialUploadForm = ({ onClose, onUploadSuccess }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('education');
  const [issuer, setIssuer] = useState('');
  const [dateIssued, setDateIssued] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title) {
      setError('Please enter a title');
      return;
    }
    
    if (!file) {
      setError('Please upload a document');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Mock successful upload for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onUploadSuccess) {
        onUploadSuccess({
          id: Date.now().toString(),
          title,
          type,
          issuer,
          dateIssued,
          createdAt: new Date().toISOString(),
          status: 'draft'
        });
      }
      
      onClose();
    } catch (err) {
      console.error("Error uploading credential:", err);
      setError("Failed to upload credential: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // This would be enhanced with Claude analysis of the document
  const analyzeWithAI = async () => {
    if (!file) {
      setError('Please upload a document first');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Mock AI analysis
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate AI extraction of document data
      const mockAnalysis = {
        title: type === 'education' ? 'Bachelor of Science in Computer Science' : 
               type === 'work' ? 'Senior Software Engineer' : 
               'AWS Certified Developer',
        issuer: type === 'education' ? 'Stanford University' : 
                type === 'work' ? 'Google Inc.' : 
                'Amazon Web Services',
        dateIssued: '2022-05-15',
        skills: ['JavaScript', 'React', 'Node.js', 'AWS']
      };
      
      setAiAnalysis(mockAnalysis);
      
      // Pre-fill form with AI extracted data
      setTitle(mockAnalysis.title);
      setIssuer(mockAnalysis.issuer);
      setDateIssued(mockAnalysis.dateIssued);
      
    } catch (err) {
      console.error("AI analysis failed:", err);
      setError("AI analysis failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <div style={{ ...styles.card, marginBottom: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Upload New Credential</h2>
      
      {error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#FFEBEE', 
          color: '#B71C1C', 
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Credential Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ 
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          >
            <option value="education">Education</option>
            <option value="work">Work Experience</option>
            <option value="certificate">Certificate</option>
            <option value="skill">Skill</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Upload Document
          </label>
          <div
            style={{
              border: '2px dashed #d1d5db',
              borderRadius: '6px',
              padding: '24px',
              textAlign: 'center',
              cursor: 'pointer'
            }}
            onClick={() => document.getElementById('file-upload').click()}
          >
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            
            <div style={{ marginBottom: '12px', fontSize: '24px' }}>
              {file ? '📄' : '⬆️'}
            </div>
            
            <p style={{ marginBottom: '8px' }}>
              {file ? file.name : 'Drag and drop your file here, or click to browse'}
            </p>
            
            <p style={{ fontSize: '12px', color: '#6b7280' }}>
              Accepts PDF, Images, or Word documents up to 10MB
            </p>
          </div>
          
          {file && !aiAnalysis && (
            <button
              type="button"
              onClick={analyzeWithAI}
              style={{
                backgroundColor: '#5a45f8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
                marginTop: '12px',
                width: '100%'
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Analyzing...' : 'Analyze with AI'}
            </button>
          )}
        </div>
        
        {aiAnalysis && (
          <div style={{ 
            backgroundColor: '#f0f9ff', 
            border: '1px solid #bae6fd', 
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#0369a1',
              marginBottom: '8px'
            }}>
              AI Analysis Results
            </h3>
            <p style={{ fontSize: '14px', marginBottom: '8px' }}>
              The AI has analyzed your document and extracted the following information:
            </p>
            <ul style={{ paddingLeft: '20px' }}>
              <li style={{ marginBottom: '4px' }}>Title: {aiAnalysis.title}</li>
              <li style={{ marginBottom: '4px' }}>Issuer: {aiAnalysis.issuer}</li>
              <li style={{ marginBottom: '4px' }}>Date Issued: {aiAnalysis.dateIssued}</li>
              <li>
                Skills: {aiAnalysis.skills.join(', ')}
              </li>
            </ul>
            <p style={{ 
              fontSize: '14px', 
              fontStyle: 'italic',
              marginTop: '8px'
            }}>
              These details have been pre-filled in the form below. Please verify and edit if needed.
            </p>
          </div>
        )}
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Bachelor of Science, Software Engineer"
            style={{ 
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Issuer
          </label>
          <input
            type="text"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            placeholder="e.g., MIT, Google, Coursera"
            style={{ 
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Date Issued
          </label>
          <input
            type="date"
            value={dateIssued}
            onChange={(e) => setDateIssued(e.target.value)}
            style={{ 
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: 'white',
              fontSize: '14px',
              cursor: 'pointer'
            }}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: '#5a45f8',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              opacity: isSubmitting ? 0.7 : 1
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Uploading...' : 'Upload Credential'}
          </button>
        </div>
      </form>
    </div>
  );
};

// // Main Dashboard Component
// export default function Dashboard() {
//   const { currentUser } = useAuth();
//   const [credentials, setCredentials] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showUploader, setShowUploader] = useState(false);
//   const [stats, setStats] = useState({
//     total: 0,
//     verified: 0,
//     pending: 0,
//     rejected: 0
//   });
//   const [activeFilter, setActiveFilter] = useState('all');
//   const [activeTypeFilter, setActiveTypeFilter] = useState('all');
//   const [error, setError] = useState(null);
//   const

// Main Dashboard Component
export default function Dashboard() {
  const { currentUser } = useAuth();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0
  });
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [error, setError] = useState(null);
  const [showAIFeatures, setShowAIFeatures] = useState(false);

  // Create some mock credentials if needed
  const mockCredentials = [
    {
      id: "mock1",
      title: "Bachelor of Computer Science",
      type: "education",
      issuer: "MIT",
      dateIssued: "2020-05-15",
      verificationStatus: "verified",
      dateUploaded: new Date().toISOString()
    },
    {
      id: "mock2",
      title: "Senior Software Engineer",
      type: "work",
      issuer: "Google",
      dateIssued: "2021-06-01",
      verificationStatus: "pending",
      dateUploaded: new Date().toISOString()
    },
    {
      id: "mock3",
      title: "Machine Learning Certification",
      type: "certificate",
      issuer: "Coursera",
      dateIssued: "2022-01-10",
      verificationStatus: "draft",
      dateUploaded: new Date().toISOString()
    }
  ];

  useEffect(() => {
    console.log("Dashboard component initialized");
    
    async function fetchCredentials() {
      if (!currentUser) {
        console.log("No user authenticated, waiting...");
        // If no user but component mounted, we'll try again when currentUser changes
        return;
      }
      
      console.log("Attempting to fetch credentials for user:", currentUser.uid);
      setLoading(true);
      
      try {
        // Try to fetch from Firestore
        const q = query(
          collection(db, 'credentials'), 
          where('userId', '==', currentUser.uid),
          orderBy('dateUploaded', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const credentialsList = [];
        
        querySnapshot.forEach((doc) => {
          try {
            const data = doc.data();
            credentialsList.push({
              id: doc.id,
              ...data,
              dateIssued: data.dateIssued?.toDate?.()?.toISOString() || data.dateIssued,
              dateUploaded: data.dateUploaded?.toDate?.()?.toISOString() || data.dateUploaded
            });
          } catch (docError) {
            console.error("Error processing document:", docError);
          }
        });
        
        console.log("Fetched credentials:", credentialsList);
        
        if (credentialsList.length === 0) {
          console.log("No credentials found, using mock data for demo");
          setCredentials(mockCredentials);
        } else {
          setCredentials(credentialsList);
        }
        
        // Calculate stats
        const statsCounts = credentialsList.reduce((acc, credential) => {
          acc.total += 1;
          
          const status = credential.verificationStatus || credential.status;
          
          if (status === 'verified') {
            acc.verified += 1;
          } else if (status === 'pending') {
            acc.pending += 1;
          } else if (status === 'rejected') {
            acc.rejected += 1;
          }
          
          return acc;
        }, { total: 0, verified: 0, pending: 0, rejected: 0 });
        
        // If we're using mock data, use mock stats
        if (credentialsList.length === 0) {
          setStats({
            total: mockCredentials.length,
            verified: mockCredentials.filter(c => c.verificationStatus === 'verified').length,
            pending: mockCredentials.filter(c => c.verificationStatus === 'pending').length,
            rejected: mockCredentials.filter(c => c.verificationStatus === 'rejected').length
          });
        } else {
          setStats(statsCounts);
        }
        
        setError(null);
        
      } catch (error) {
        console.error("Error fetching credentials:", error);
        console.error("Error details:", error.code, error.message);
        
        // Fallback to mock data if there's an error
        console.log("Using mock data due to error");
        setCredentials(mockCredentials);
        setStats({
          total: mockCredentials.length,
          verified: mockCredentials.filter(c => c.verificationStatus === 'verified').length,
          pending: mockCredentials.filter(c => c.verificationStatus === 'pending').length,
          rejected: mockCredentials.filter(c => c.verificationStatus === 'rejected').length
        });
        
        // If it's a permission error, show specific message
        if (error.code === 'permission-denied') {
          setError("You don't have permission to access these credentials.");
        } else {
          setError("There was an error loading your credentials. Mock data is shown below.");
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchCredentials();
  }, [currentUser]);

  const handleCredentialUpload = (newCredential) => {
    // Add the new credential to the list
    const updatedCredentials = [newCredential, ...credentials];
    setCredentials(updatedCredentials);
    
    // Update stats
    setStats({
      ...stats,
      total: stats.total + 1
    });
    
    setShowUploader(false);
  };

  const refreshCredentials = () => {
    // Simply reload the page for now
    // This can be optimized later to just fetch the data
    setLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const getFilteredCredentials = () => {
    return credentials.filter(cred => {
      const status = cred.verificationStatus || cred.status;
      const typeMatch = activeTypeFilter === 'all' || cred.type === activeTypeFilter;
      const statusMatch = activeFilter === 'all' || status === activeFilter;
      return typeMatch && statusMatch;
    });
  };

  return (
    <Layout>
      <Head>
        <title>Dashboard - VFied</title>
      </Head>
      
      <div style={styles.flexBetween}>
        <div>
          <h1 style={styles.title}>Your Credentials</h1>
          <p style={styles.subtitle}>
            Manage your verified credentials and upload new ones.
          </p>
        </div>
        <button
          onClick={() => setShowUploader(!showUploader)}
          style={styles.button}
        >
          {showUploader ? 'Hide Uploader' : '+ Add Credential'}
        </button>
      </div>
      
      {/* AI Features Toggle */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '16px'
      }}>
        <button
          onClick={() => setShowAIFeatures(!showAIFeatures)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: showAIFeatures ? '#5a45f8' : 'transparent',
            color: showAIFeatures ? 'white' : '#5a45f8',
            border: showAIFeatures ? 'none' : '1px solid #5a45f8',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <span>AI Features</span>
          <span style={{ fontSize: '18px' }}>{showAIFeatures ? '✓' : '🔍'}</span>
        </button>
      </div>
      
      {/* AI Skills Assessment (only shown when AI Features is on) */}
      {showAIFeatures && (
        <AIJobMatching 
          userId={currentUser?.uid}
          credentials={credentials}
        />
      )}
      
      {/* Credential Upload Form */}
      {showUploader && (
        <CredentialUploadForm 
          onClose={() => setShowUploader(false)}
          onUploadSuccess={handleCredentialUpload}
        />
      )}
      
      {/* Stats Cards */}
      {credentials.length > 0 && (
        <div style={styles.statsGrid}>
          <StatCard 
            title="Total Credentials" 
            value={stats.total} 
            color="#5a45f8" 
            icon="📊"
          />
          <StatCard 
            title="Verified" 
            value={stats.verified} 
            color="#15803d" 
            icon="✓"
          />
          <StatCard 
            title="Pending" 
            value={stats.pending} 
            color="#c2410c" 
            icon="⏳"
          />
          <StatCard 
            title="Rejected" 
            value={stats.rejected} 
            color="#b91c1c" 
            icon="✗"
          />
        </div>
      )}
      
      {/* Loading State */}
      {loading ? (
        <div style={{ ...styles.card, textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>⟳</div>
          <p style={{ color: '#6b7280' }}>Loading credentials...</p>
        </div>
      ) : error ? (
        <div style={{ ...styles.card, textAlign: 'center', padding: '32px' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px', color: '#ef4444' }}>⚠️</div>
          <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
          <button 
            onClick={refreshCredentials}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: '#5a45f8',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      ) : credentials.length === 0 ? (
        <div style={{ ...styles.card, textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', color: '#d1d5db' }}>📄</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>No credentials yet</h3>
          <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto 24px' }}>
            Get started by adding your first credential. Upload your education, work experience, certificates, or skills.
          </p>
          <button 
            onClick={() => setShowUploader(true)}
            style={styles.button}
          >
            Add Your First Credential
          </button>
        </div>
      ) : (
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Your Credentials</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select 
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: '6px', 
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
                value={activeTypeFilter}
                onChange={(e) => setActiveTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="education">Education</option>
                <option value="work">Work</option>
                <option value="certificate">Certificate</option>
                <option value="skill">Skill</option>
              </select>
              <select 
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: '6px', 
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          
          <div style={styles.credentialGrid}>
            {getFilteredCredentials().map((credential) => (
              <CredentialCard 
                key={credential.id} 
                credential={credential} 
                onUpdate={refreshCredentials}
              />
            ))}
          </div>
          
          {getFilteredCredentials().length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280' }}>
              <p>No credentials match your current filters.</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}