// src/services/aiService.js
import { auth } from '../lib/firebase';

/**
 * Analyzes a document using AI to extract credential information
 * @param {File} file - The document file to analyze
 * @param {string} credentialType - The type of credential (education, work, certificate, skill)
 * @returns {Promise<Object>} Extracted credential information
 */
export const analyzeDocumentWithAI = async (file, credentialType) => {
  try {
    // Get user authentication token
    const token = await auth.currentUser.getIdToken();
    
    // Create form data with the file and credential type
    const formData = new FormData();
    formData.append('file', file);
    formData.append('credentialType', credentialType);
    
    // Send to your backend AI endpoint
    const response = await fetch('/api/ai/analyze-document', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Document analysis failed');
    }
    
    // Return the extracted data
    return await response.json();
  } catch (error) {
    console.error('AI analysis error:', error);
    throw error;
  }
};