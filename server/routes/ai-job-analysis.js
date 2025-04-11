// server/routes/ai-job-analysis.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createAnthropicClient } = require('@anthropic-ai/sdk');
const { db, admin } = require('../firebase/admin');

// Initialize the Anthropic client
const anthropic = createAnthropicClient({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Analyze job requirements to determine appropriate experience
 */
async function analyzeJobRequirements(jobData) {
  try {
    // Format the skills for better processing
    const skills = Array.isArray(jobData.requiredSkills) 
      ? jobData.requiredSkills.join(', ') 
      : jobData.requiredSkills || '';
    
    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1000,
      system: `You are an expert in HR and workforce analysis with deep knowledge of skill requirements across industries.
Your task is to analyze job requirements and determine the appropriate years of experience needed.

Consider these factors when analyzing:
1. Industry standards for the specific role
2. Technical debt and learning curves for the required skills
3. Typical career progression in the field
4. Realistic timelines for skill acquisition
5. The complexity of the responsibilities

Watch for common problems:
- Experience inflation (asking for too many years)
- Technology timeline mismatches (requiring more years than a technology has existed)
- Skill stacking (requiring too many diverse skills)
- Qualification/responsibility misalignment

Provide a balanced, realistic assessment that would help both employers and candidates.`,
      messages: [
        {
          role: "user",
          content: `Analyze this job information:
      
Job Title: ${jobData.jobTitle}
Department: ${jobData.department || 'Not specified'}
Industry: ${jobData.industry || 'Not specified'}
Seniority Level: ${jobData.seniorityLevel || 'Not specified'}
Key Responsibilities: ${jobData.responsibilities || 'Not provided'}
Required Skills: ${skills}

Based on this information, please provide:
1. The appropriate years of experience range for this role
2. Whether the requirements are reasonable or unrealistic
3. Any specific unrealistic requirements that should be adjusted
4. Suggestions to make the requirements more balanced
5. A detailed explanation of your reasoning
6. A health score (0-100) indicating how realistic these requirements are

Return your analysis as a JSON object with the following structure:
{
  "yearsOfExperience": "X-Y years",
  "isReasonable": true/false,
  "unrealisticRequirements": ["requirement1", "requirement2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "reasoning": "Detailed explanation...",
  "healthScore": 85
}`
        }
      ]
    });
    
    // Parse the response
    try {
      const responseText = response.content[0].text;
      // Remove any markdown code blocks if present
      const jsonText = responseText.replace(/```json\n|\n```|```/g, '');
      const analysisData = JSON.parse(jsonText);
      
      return analysisData;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('Raw response:', response.content[0].text);
      
      // Return a default response if parsing fails
      return {
        yearsOfExperience: "3-5 years",
        isReasonable: true,
        unrealisticRequirements: [],
        suggestions: ["Consider reviewing the requirements manually."],
        reasoning: "Unable to parse AI response into JSON format. This default response is provided as a fallback.",
        healthScore: 70
      };
    }
  } catch (error) {
    console.error('AI job analysis error:', error);
    throw error;
  }
}

/**
 * Analyze job requirements and suggest appropriate experience levels
 * POST /api/ai-job-analysis/analyze
 */
router.post('/analyze', auth, async (req, res) => {
  try {
    const { 
      jobTitle, 
      responsibilities, 
      requiredSkills, 
      seniorityLevel,
      department,
      industry 
    } = req.body;
    
    if (!jobTitle) {
      return res.status(400).json({ error: 'Job title is required' });
    }
    
    // Call the AI service to analyze job requirements
    const analysis = await analyzeJobRequirements({
      jobTitle, 
      responsibilities, 
      requiredSkills, 
      seniorityLevel,
      department,
      industry
    });
    
    // Log the analysis for model improvement
    try {
      await db.collection('job_requirement_analyses').add({
        jobData: req.body,
        analysis,
        userId: req.user.uid,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (logError) {
      console.warn('Failed to log analysis to Firestore:', logError);
      // Continue even if logging fails
    }
    
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing job requirements:', error);
    res.status(500).json({ 
      error: 'Failed to analyze job requirements',
      message: error.message
    });
  }
});

/**
 * Submit feedback on an analysis
 * POST /api/ai-job-analysis/feedback
 */
router.post('/feedback', auth, async (req, res) => {
  try {
    const { 
      originalAnalysis, 
      isAccurate, 
      correctExperience,
      feedback
    } = req.body;
    
    // Store the feedback for model improvement
    await db.collection('job_analysis_feedback').add({
      userId: req.user.uid,
      originalAnalysis,
      isAccurate,
      correctExperience,
      feedback,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, message: 'Feedback recorded successfully' });
  } catch (error) {
    console.error('Error recording feedback:', error);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
});

module.exports = router;