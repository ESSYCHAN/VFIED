// src/services/aiJobAnalysisService.js

import { auth } from '../lib/firebase';

/**
 * Analyzes job requirements to determine appropriate experience levels
 * @param {Object} jobData - Job information
 * @returns {Promise<Object>} - Analysis results
 */
// In src/services/aiJobAnalysisService.js
export const analyzeJobRequirements = async (jobData) => {
    
    try {
    
        const token = await auth.currentUser.getIdToken(true); // Add this line to force token refresh
      // Make sure the URL is correct - this should match your server route
      const response = await fetch('/api/ai-job-analysis/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });
      
      // Add proper error handling for non-JSON responses
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Job analysis failed');
        } else {
          // If not JSON, get the text to see what's being returned
          const errorText = await response.text();
          console.error('Non-JSON response received:', errorText);
          throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Job description analysis error:', error);
      
      // Always return mock data during development for easier testing
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