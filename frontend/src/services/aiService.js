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

export const analyzeDocumentWithClaude = async (document) => {
  // Implement your AI analysis
  return {}; // Return analysis results
};
// Add this function to your existing aiService.js file
/**
 * Analyzes job requirements to suggest appropriate experience levels
 * @param {Object} jobData - Job information
 * @returns {Promise<Object>} - Analysis results
 */
export const analyzeJobDescription = async (jobData) => {
  try {
    // Get user authentication token
    const token = await auth.currentUser.getIdToken();
    
    // Call your backend endpoint
    const response = await fetch('/api/ai/analyze-job-description', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jobData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Job analysis failed');
    }
    
    // Return the analysis results
    return await response.json();
  } catch (error) {
    console.error('Job description analysis error:', error);
    
    // For development, return mock data if the API fails
    if (process.env.NODE_ENV !== 'production') {
      console.log('Returning mock data for development');
      return {
        yearsOfExperience: "3-5 years",
        isReasonable: true,
        unrealisticRequirements: [],
        suggestions: ["The requirements seem reasonable."],
        reasoning: "Based on the job title and responsibilities, 3-5 years of experience is appropriate.",
        healthScore: 85
      };
    }
    
    throw error;
  }
};