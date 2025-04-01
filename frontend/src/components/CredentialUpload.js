import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { styles } from '../styles/sharedStyles';

export default function CredentialUpload({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [type, setType] = useState('education');
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit');
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not supported. Please upload a PDF, image, or Word document');
      }
      
      // Upload file to Firebase Storage
      const storageRef = ref(storage, `credentials/${currentUser.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Save credential to Firestore
      const docRef = await addDoc(collection(db, 'credentials'), {
        userId: currentUser.uid,
        type,
        title,
        issuer,
        dateIssued: new Date(issueDate),
        dateUploaded: serverTimestamp(),
        verificationStatus: 'pending',
        verificationMethod: 'document',
        documentUrl: downloadURL,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        }
      });
      
      // Reset form
      setFile(null);
      setTitle('');
      setIssuer('');
      setIssueDate('');
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete();
      }
      
    } catch (error) {
      console.error("Error uploading credential:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Custom styles for this component
  const customStyles = {
    dropArea: {
      border: '2px dashed',
      borderColor: dragActive ? '#5a45f8' : '#d1d5db',
      borderRadius: '8px',
      padding: '32px',
      textAlign: 'center',
      transition: 'border-color 0.2s',
      backgroundColor: dragActive ? 'rgba(90, 69, 248, 0.05)' : 'white',
      cursor: 'pointer',
      marginBottom: '24px'
    },
    fileInfo: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '16px'
    },
    fileName: {
      fontWeight: '500',
      color: '#5a45f8',
      marginBottom: '4px'
    },
    fileSize: {
      fontSize: '12px',
      color: '#6b7280'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      marginBottom: '24px'
    },
    fullWidth: {
      gridColumn: '1 / -1'
    },
    iconContainer: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      backgroundColor: 'rgba(90, 69, 248, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px',
      color: '#5a45f8',
      fontSize: '24px'
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Upload New Credential</h2>
      
      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={styles.success}>
          Credential uploaded successfully! It will be verified shortly.
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={customStyles.formGrid}>
          <div>
            <label style={styles.label} htmlFor="type">
              Credential Type
            </label>
            <select
              id="type"
              style={styles.select}
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="education">Education</option>
              <option value="work">Work Experience</option>
              <option value="certificate">Certificate</option>
              <option value="skill">Skill</option>
            </select>
          </div>
          
          <div>
            <label style={styles.label} htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              style={styles.input}
              placeholder="e.g., Bachelor of Science, Software Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label style={styles.label} htmlFor="issuer">
              Issuer
            </label>
            <input
              id="issuer"
              type="text"
              style={styles.input}
              placeholder="e.g., MIT, Google, Coursera"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label style={styles.label} htmlFor="issueDate">
              Date Issued
            </label>
            <input
              id="issueDate"
              type="date"
              style={styles.input}
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              required
            />
          </div>
          
          <div style={customStyles.fullWidth}>
            <label style={styles.label}>
              Upload Document
            </label>
            <div 
              style={customStyles.dropArea}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                style={{ display: 'none' }}
              />
              
              {file ? (
                <div style={customStyles.fileInfo}>
                  <div style={customStyles.iconContainer}>
                    {file.type.includes('pdf') ? '📄' : 
                     file.type.includes('image') ? '🖼️' : '📝'}
                  </div>
                  <div style={customStyles.fileName}>{file.name}</div>
                  <div style={customStyles.fileSize}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#ef4444',
                      fontWeight: '500',
                      cursor: 'pointer',
                      marginTop: '8px'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div style={customStyles.iconContainer}>
                    ↑
                  </div>
                  <p style={{ fontWeight: '500', marginBottom: '8px' }}>
                    Drag and drop your file here, or click to browse
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>
                    Accepts PDF, Images, or Word documents up to 10MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '120px'
            }}
          >
            {loading ? (
              <>
                <svg 
                  style={{ 
                    animation: 'spin 1s linear infinite',
                    marginRight: '8px',
                    height: '16px',
                    width: '16px'
                  }} 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4" 
                    fill="none" 
                    strokeDasharray="32" 
                    strokeDashoffset="8" 
                  />
                </svg>
                Uploading...
              </>
            ) : 'Upload Credential'}
          </button>
        </div>
      </form>
    </div>
  );
}