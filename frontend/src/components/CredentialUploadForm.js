// src/components/CredentialUploadForm.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { styles } from '../styles/sharedStyles';

const CredentialUploadForm = ({ onClose, onUploadSuccess }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('education');
  const [issuer, setIssuer] = useState('');
  const [dateIssued, setDateIssued] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analysisStep, setAnalysisStep] = useState('upload'); // upload, analyzing, complete
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
      
      // In a real implementation, you would upload the file and credential data to your backend
      // For now, we'll simulate a successful upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onUploadSuccess) {
        onUploadSuccess({
          id: Date.now().toString(),
          title,
          type,
          issuer,
          dateIssued,
          description,
          skills,
          createdAt: new Date().toISOString(),
          status: 'draft',
          fileName: file.name
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
  
  const analyzeWithAI = async () => {
    if (!file) {
      setError('Please upload a document first');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setAnalysisStep('analyzing');
      
      // Simulate AI analysis processing steps
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Extract file extension to determine document type
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      // Generate different mock analysis based on selected credential type and file extension
      let mockAnalysis = {
        title: '',
        issuer: '',
        dateIssued: '',
        description: '',
        skills: []
      };
      
      if (type === 'education') {
        mockAnalysis = {
          title: fileExtension === 'pdf' ? 'Bachelor of Science in Computer Science' : 'Master of Business Administration',
          issuer: fileExtension === 'pdf' ? 'Stanford University' : 'Harvard Business School',
          dateIssued: new Date(Date.now() - Math.random() * 94608000000).toISOString().split('T')[0], // Random date in last 3 years
          description: fileExtension === 'pdf' 
            ? 'Computer Science degree with focus on software engineering and artificial intelligence.'
            : 'MBA with specialization in technology management and entrepreneurship.',
          skills: ['Research', 'Critical Thinking', 'Data Analysis', fileExtension === 'pdf' ? 'Programming' : 'Business Strategy']
        };
      } else if (type === 'work') {
        mockAnalysis = {
          title: fileExtension === 'pdf' ? 'Senior Software Engineer' : 'Product Manager',
          issuer: fileExtension === 'pdf' ? 'Google Inc.' : 'Microsoft Corporation',
          dateIssued: new Date(Date.now() - Math.random() * 94608000000).toISOString().split('T')[0],
          description: fileExtension === 'pdf'
            ? 'Led development of cloud-based applications using modern JavaScript frameworks and microservices architecture.'
            : 'Managed product lifecycle for enterprise software solutions, coordinating between engineering, design, and marketing teams.',
          skills: ['Leadership', 'Communication', fileExtension === 'pdf' ? 'Software Development' : 'Product Strategy', 'Team Management']
        };
      } else if (type === 'certificate') {
        mockAnalysis = {
          title: fileExtension === 'pdf' ? 'AWS Certified Developer' : 'Google Cloud Professional Architect',
          issuer: fileExtension === 'pdf' ? 'Amazon Web Services' : 'Google Cloud',
          dateIssued: new Date(Date.now() - Math.random() * 47304000000).toISOString().split('T')[0], // Random date in last 1.5 years
          description: fileExtension === 'pdf'
            ? 'Professional certification for designing and developing applications on the AWS platform.'
            : 'Advanced certification for designing, developing, and managing cloud architecture on Google Cloud Platform.',
          skills: [fileExtension === 'pdf' ? 'AWS' : 'GCP', 'Cloud Architecture', 'Infrastructure as Code']
        };
      } else if (type === 'skill') {
        mockAnalysis = {
          title: fileExtension === 'pdf' ? 'Advanced JavaScript Programming' : 'Data Science with Python',
          issuer: fileExtension === 'pdf' ? 'Mozilla Developer Network' : 'DataCamp',
          dateIssued: new Date(Date.now() - Math.random() * 31536000000).toISOString().split('T')[0], // Random date in last year
          description: fileExtension === 'pdf'
            ? 'Advanced proficiency in JavaScript including modern ES6+ features, async programming, and framework development.'
            : 'Expertise in data analysis, visualization, and machine learning using Python and its scientific computing libraries.',
          skills: [fileExtension === 'pdf' ? 'JavaScript' : 'Python', 'Problem Solving', fileExtension === 'pdf' ? 'Web Development' : 'Machine Learning']
        };
      }
      
      // Simulate progressive analysis
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAiAnalysis(mockAnalysis);
      setAnalysisStep('complete');
      
      // Pre-fill form with AI extracted data
      setTitle(mockAnalysis.title);
      setIssuer(mockAnalysis.issuer);
      setDateIssued(mockAnalysis.dateIssued);
      setDescription(mockAnalysis.description);
      setSkills(mockAnalysis.skills);
      
    } catch (err) {
      console.error("AI analysis failed:", err);
      setError("AI analysis failed: " + err.message);
      setAnalysisStep('upload');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Reset analysis state when a new file is selected
      setAiAnalysis(null);
      setAnalysisStep('upload');
    }
  };

  const handleAddSkill = () => {
    if (currentSkill.trim()) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
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
              cursor: 'pointer',
              backgroundColor: file ? '#f9fafb' : 'white'
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
          
          {file && analysisStep === 'upload' && (
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
          
          {file && analysisStep === 'analyzing' && (
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#f0f9ff', 
              borderRadius: '4px', 
              marginTop: '12px',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
                <p style={{ fontWeight: '500', marginBottom: '4px' }}>AI is analyzing your document</p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>This may take a few moments...</p>
              </div>
            </div>
          )}
        </div>
        
        {aiAnalysis && analysisStep === 'complete' && (
          <div style={{ 
            backgroundColor: '#f0f9ff', 
            border: '1px solid #bae6fd', 
            borderRadius: '6px',
            padding: '16px',
            marginTop: '16px',
            marginBottom: '16px'
          }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#0369a1',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>✨</span>
              <span>AI Analysis Results</span>
            </h3>
            
            <p style={{ fontSize: '14px', marginBottom: '12px', lineHeight: '1.5' }}>
              The AI has analyzed your document and extracted the following information:
            </p>
            
            <div style={{ 
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              padding: '12px',
              marginBottom: '12px'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Title</div>
                <div style={{ fontWeight: '500' }}>{aiAnalysis.title}</div>
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Issuer</div>
                <div style={{ fontWeight: '500' }}>{aiAnalysis.issuer}</div>
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Date Issued</div>
                <div style={{ fontWeight: '500' }}>{aiAnalysis.dateIssued}</div>
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Description</div>
                <div style={{ fontWeight: '500' }}>{aiAnalysis.description}</div>
              </div>
              
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Identified Skills</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {aiAnalysis.skills.map((skill, index) => (
                    <div key={index} style={{
                      backgroundColor: '#e5e7eb',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <p style={{ 
              fontSize: '14px', 
              fontStyle: 'italic',
              color: '#0369a1'
            }}>
              These details have been pre-filled in the form below. Please verify and edit if needed.
            </p>
          </div>
        )}
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Title <span style={{ color: '#ef4444' }}>*</span>
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
            required
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
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details about this credential..."
            style={{ 
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '16px',
              minHeight: '80px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Skills
          </label>
          <div style={{ display: 'flex' }}>
            <input
              type="text"
              value={currentSkill}
              onChange={(e) => setCurrentSkill(e.target.value)}
              placeholder="Add relevant skills"
              style={{ 
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px 0 0 6px',
                fontSize: '16px'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
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
                borderRadius: '0 6px 6px 0',
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

export default CredentialUploadForm;