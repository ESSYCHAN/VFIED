// src/services/aiJobAnalysisService.js

import { auth } from '../lib/firebase';

/**
 * Analyzes job requirements to determine appropriate experience levels
 * @param {Object} jobData - Job information
 * @returns {Promise<Object>} - Analysis results
 */
export const analyzeJobRequirements = async (jobData) => {
  try {
    // Get user authentication token
    const token = await auth.currentUser.getIdToken();
    
    // Call your backend endpoint
    const response = await fetch('/api/ai-job-analysis/analyze', {
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

/**
 * Submit feedback on an experience analysis
 * @param {Object} feedbackData - Feedback data 
 * @returns {Promise<Object>} - Response
 */
export const submitAnalysisFeedback = async (feedbackData) => {
  try {
    // Get user authentication token
    const token = await auth.currentUser.getIdToken();
    
    // Call your backend endpoint
    const response = await fetch('/api/ai-job-analysis/feedback', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(feedbackData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit feedback');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};