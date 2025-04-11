// frontend/src/services/jobDescriptionService.js
import { getIdToken } from './authService';

/**
 * Analyze job requirements and suggest appropriate experience
 * @param {Object} jobData - Job data to analyze
 * @returns {Promise<Object>} - Analysis results
 */
export const analyzeJobRequirements = async (jobData) => {
  try {
    const token = await getIdToken();
    
    const response = await fetch('/api/ai-job-description/analyze', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jobData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Job requirements analysis failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Job requirements analysis error:', error);
    throw error;
  }
};

/**
 * Generate a complete job description
 * @param {Object} jobData - Job data for generation
 * @returns {Promise<Object>} - Generated job description
 */
export const generateJobDescription = async (jobData) => {
  try {
    const token = await getIdToken();
    
    const response = await fetch('/api/ai-job-description/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jobData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Job description generation failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Job description generation error:', error);
    throw error;
  }
};

/**
 * Save a job description template
 * @param {Object} template - Template data
 * @param {string} name - Template name
 * @param {boolean} isPublic - Whether template is public
 * @returns {Promise<Object>} - Saved template info
 */
export const saveJobTemplate = async (template, name, isPublic = false) => {
  try {
    const token = await getIdToken();
    
    const response = await fetch('/api/ai-job-description/save-template', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ template, name, isPublic })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save job template');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving job template:', error);
    throw error;
  }
};

/**
 * Get job description templates
 * @param {boolean} includePublic - Whether to include public templates
 * @returns {Promise<Array>} - Array of templates
 */
export const getJobTemplates = async (includePublic = true) => {
  try {
    const token = await getIdToken();
    
    const response = await fetch(`/api/ai-job-description/templates?includePublic=${includePublic}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get job templates');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting job templates:', error);
    throw error;
  }
};