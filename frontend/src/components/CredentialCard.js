// src/components/CredentialCard.js
import React, { useState } from 'react';
import Link from 'next/link';

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

  // Get icon for credential type
  const getTypeIcon = (type) => {
    return type === 'education' ? '🎓' : 
           type === 'work' ? '💼' : 
           type === 'certificate' ? '📜' : 
           type === 'skill' ? '⚡' : '📄';
  };

  const handleRequestVerification = async (e) => {
    e.preventDefault();
    if (credential.verificationStatus !== 'draft' && credential.status !== 'draft') {
      return;
    }
    
    try {
      setIsRequesting(true);
      
      // In a real implementation, you would update the Firestore document
      // For now, we'll simulate this with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the credential locally to show the new status
      credential.verificationStatus = 'pending';
      credential.status = 'pending';
      
      onUpdate(); // Refresh the list
    } catch (error) {
      console.error('Failed to request verification:', error);
      alert('Failed to request verification. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
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
  
  const getStatusBadge = (status) => {
    const badgeClass = status === 'verified' ? 'bg-green-100 text-green-800' :
                        status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800';
    
    return `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClass}`;
  };

  return (
    <div 
      className={`bg-white border rounded-lg p-4 mb-4 transition-all duration-200 ${
        isHovered ? 'shadow-md transform -translate-y-0.5' : 'shadow'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className="text-xl mr-2">
            {getTypeIcon(credential.type)}
          </div>
          <span className="text-sm text-gray-600 capitalize">
            {credential.type || 'Document'}
          </span>
        </div>
        <div className={getStatusBadge(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>
      
      <h3 className="text-lg font-semibold mb-1">{credential.title}</h3>
      {credential.issuer && <p className="text-sm text-gray-600 mb-2">{credential.issuer}</p>}
      
      <p className="text-xs text-gray-500">
        {credential.dateIssued ? 
          `Issued: ${formatDate(credential.dateIssued)}` : 
          `Uploaded: ${formatDate(credential.createdAt || credential.dateUploaded)}`}
      </p>
      
      {status === 'verified' && (
        <div className="flex items-center bg-green-50 p-2 rounded-md mt-3 mb-3 text-sm text-green-800">
          <div className="mr-2">✓</div>
          <div>Blockchain Verified</div>
        </div>
      )}
      
      {status === 'pending' && (
        <div className="flex items-center bg-yellow-50 p-2 rounded-md mt-3 mb-3 text-sm text-yellow-800">
          <div className="mr-2">⏳</div>
          <div>Verification in progress</div>
        </div>
      )}
      
      <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
        {(credential.documentUrl || credential.fileUrl) ? (
          <a 
            href={credential.documentUrl || credential.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 text-xs font-medium hover:text-indigo-800"
          >
            View Document
          </a>
        ) : (
          <span></span>
        )}
        
        <div className="flex space-x-4">
          {(status === 'draft') && (
            <button 
              className="text-green-600 text-xs font-medium hover:text-green-800"
              onClick={handleRequestVerification}
              disabled={isRequesting}
            >
              {isRequesting ? 'Requesting...' : 'Request Verification'}
            </button>
          )}
          
          <Link 
            href={`/credentials/${credential.id}`}
            className="text-indigo-600 text-xs font-medium hover:text-indigo-800"
          >
            Details
          </Link>
          
          <button 
            className="text-red-600 text-xs font-medium hover:text-red-800"
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

export default CredentialCard;