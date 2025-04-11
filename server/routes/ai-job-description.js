// server/routes/ai-job-description.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { analyzeJobRequirements } = require('../services/aiJobDescriptionService');

/**
 * Analyze job requirements and suggest appropriate experience levels
 * POST /api/ai-job-description/analyze
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
    
    if (!jobTitle || !responsibilities) {
      return res.status(400).json({ error: 'Job title and responsibilities are required' });
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
 * Generate a complete job description
 * POST /api/ai-job-description/generate
 */
router.post('/generate', auth, async (req, res) => {
  try {
    const { 
      jobTitle, 
      responsibilities, 
      requiredSkills, 
      seniorityLevel,
      department,
      industry,
      companyInfo
    } = req.body;
    
    if (!jobTitle) {
      return res.status(400).json({ error: 'Job title is required' });
    }
    
    // Generate complete job description
    const jobDescription = await generateJobDescription({
      jobTitle, 
      responsibilities, 
      requiredSkills, 
      seniorityLevel,
      department,
      industry,
      companyInfo
    });
    
    res.json(jobDescription);
  } catch (error) {
    console.error('Error generating job description:', error);
    res.status(500).json({ 
      error: 'Failed to generate job description',
      message: error.message
    });
  }
});

/**
 * Save a job description template
 * POST /api/ai-job-description/save-template
 */
router.post('/save-template', auth, async (req, res) => {
  try {
    const { template, name, isPublic } = req.body;
    const userId = req.user.uid;
    
    if (!template || !name) {
      return res.status(400).json({ error: 'Template and name are required' });
    }
    
    // Save template
    const templateId = await saveJobTemplate(template, name, userId, isPublic);
    
    res.json({ id: templateId, name });
  } catch (error) {
    console.error('Error saving job template:', error);
    res.status(500).json({ error: 'Failed to save job template' });
  }
});

module.exports = router;