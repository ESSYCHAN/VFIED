// server/services/aiJobDescriptionService.js
const { createAnthropicClient } = require('@anthropic-ai/sdk');
const { db, admin } = require('../firebase/admin');

// Initialize the Anthropic client
const anthropic = createAnthropicClient({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Analyze job requirements and suggest appropriate experience levels
 * @param {Object} jobData - Job data to analyze
 * @returns {Promise<Object>} - Analysis results
 */
async function analyzeJobRequirements(jobData) {
  try {
    const { 
      jobTitle, 
      responsibilities, 
      requiredSkills, 
      seniorityLevel,
      department,
      industry
    } = jobData;
    
    // Format the skills list
    const skills = Array.isArray(requiredSkills) 
      ? requiredSkills.join(', ') 
      : requiredSkills;
    
    // Craft the prompt for Claude
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      system: `You are an expert in job market analysis with deep knowledge of industry standards.

When analyzing job requirements, carefully check for:
1. EXPERIENCE INFLATION: Flag when years of experience requested exceeds industry norms for the role
2. TECHNOLOGY TIMELINE MISMATCHES: Identify when more years are requested than a technology has existed
3. SKILL STACKING: Flag when too many diverse skills are required for a single role
4. QUALIFICATION/RESPONSIBILITY MISMATCH: Identify mismatches between level and responsibilities

For all issues, provide specific, actionable recommendations to make requirements more realistic.
Use your knowledge of industry standards to recommend appropriate experience levels.

Consider the realities of the job market from both employer and candidate perspectives.
IMPORTANT: Return ONLY valid JSON with no additional text, explanations, or markdown formatting.
Your response MUST be a single JSON object that can be parsed by JavaScript's JSON.parse().`,
      messages: [
        {
          role: "user",
          content: `Analyze this job information:
          
Job Title: ${jobTitle}
${department ? `Department: ${department}` : ''}
${industry ? `Industry: ${industry}` : ''}
Seniority Level: ${seniorityLevel || 'Not specified'}
Key Responsibilities: ${responsibilities || 'Not provided'}
Required Skills: ${skills || 'Not provided'}

Please provide:
1. Appropriate years of experience for this role (e.g., "3-5 years")
2. Analysis of whether the requirements are reasonable
3. Identification of any unrealistic expectations
4. Specific suggestions to make requirements more balanced
5. Explanation of your reasoning

Return ONLY a JSON object with the following structure (and no other text):
{
  "yearsOfExperience": "3-5 years",
  "isReasonable": true,
  "unrealisticRequirements": ["Requirement 1", "Requirement 2"],
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "reasoning": "Reasoning for the analysis...",
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
      
      // Log the analysis for future model improvements
      try {
        await db.collection('job_requirement_analyses').add({
          jobData,
          analysis: analysisData,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (logError) {
        console.warn('Failed to log analysis to Firestore:', logError);
        // Continue even if logging fails
      }
      
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
 * Generate a complete job description
 * @param {Object} jobData - Job data for generation
 * @returns {Promise<Object>} - Generated job description
 */
async function generateJobDescription(jobData) {
  try {
    const { 
      jobTitle, 
      responsibilities, 
      requiredSkills, 
      seniorityLevel,
      department,
      industry,
      companyInfo
    } = jobData;
    
    // Format the skills list
    const skills = Array.isArray(requiredSkills) 
      ? requiredSkills.join(', ') 
      : requiredSkills;
    
    // Get suggested experience levels first
    let experienceLevel = "3-5 years"; // Default
    try {
      const analysis = await analyzeJobRequirements(jobData);
      experienceLevel = analysis.yearsOfExperience || experienceLevel;
    } catch (analysisError) {
      console.warn('Error getting experience analysis, using default:', analysisError);
      // Continue with default experience level
    }
    
    // Now generate the full job description
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2000,
      system: `You are an expert in writing effective, balanced job descriptions that are fair to both employers and candidates. 
Create professional job descriptions that accurately reflect role requirements without being unrealistic.
Focus on being specific, clear, and concise while using inclusive language.
Format job descriptions professionally with proper sections and bullet points.
IMPORTANT: Return ONLY valid JSON with no additional text, explanations, or markdown formatting.
Your response MUST be a single JSON object that can be parsed by JavaScript's JSON.parse().`,
      messages: [
        {
          role: "user",
          content: `Create a complete job description based on the following information:
          
Job Title: ${jobTitle}
${department ? `Department: ${department}` : ''}
${industry ? `Industry: ${industry}` : ''}
Seniority Level: ${seniorityLevel || 'Not specified'}
Suggested Experience: ${experienceLevel}
Key Responsibilities: ${responsibilities || 'Not provided'}
Required Skills: ${skills || 'Not provided'}
${companyInfo ? `Company Information: ${JSON.stringify(companyInfo)}` : ''}

Return ONLY a JSON object with the following structure (and no other text):
{
  "title": "Full Job Title",
  "summary": "A brief overview of the role",
  "responsibilities": ["Responsibility 1", "Responsibility 2"],
  "requiredQualifications": ["Qualification 1", "Qualification 2"],
  "preferredQualifications": ["Preferred Qualification 1", "Preferred Qualification 2"],
  "benefits": ["Benefit 1", "Benefit 2"],
  "yearsOfExperience": "3-5 years",
  "educationRequirement": "Bachelor's degree or equivalent experience",
  "skillsRequired": ["Skill 1", "Skill 2"],
  "salary": {"min": 70000, "max": 90000}
}`
        }
      ]
    });
    
    // Parse the response
    try {
      const responseText = response.content[0].text;
      // Remove any markdown code blocks if present
      const jsonText = responseText.replace(/```json\n|\n```|```/g, '');
      const generatedData = JSON.parse(jsonText);
      
      return generatedData;
    } catch (parseError) {
      console.error('Error parsing AI response for job description:', parseError);
      console.log('Raw response:', response.content[0].text);
      
      // Return error message
      throw new Error('Failed to generate job description. Please try again.');
    }
  } catch (error) {
    console.error('AI job description generation error:', error);
    throw error;
  }
}

/**
 * Save a job description template
 * @param {Object} template - Template data
 * @param {string} name - Template name
 * @param {string} userId - User ID
 * @param {boolean} isPublic - Whether template is public
 * @returns {Promise<string>} - Template ID
 */
async function saveJobTemplate(template, name, userId, isPublic = false) {
  try {
    const templateRef = await db.collection('job_description_templates').add({
      name,
      template,
      createdBy: userId,
      isPublic,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return templateRef.id;
  } catch (error) {
    console.error('Error saving job template:', error);
    throw error;
  }
}

/**
 * Get job description templates
 * @param {string} userId - User ID
 * @param {boolean} includePublic - Whether to include public templates
 * @returns {Promise<Array>} - Array of templates
 */
async function getJobTemplates(userId, includePublic = true) {
  try {
    // Get user's templates
    const userTemplatesQuery = await db.collection('job_description_templates')
      .where('createdBy', '==', userId)
      .orderBy('updatedAt', 'desc')
      .get();
    
    const templates = [];
    userTemplatesQuery.forEach(doc => {
      templates.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || null,
        updatedAt: doc.data().updatedAt?.toDate() || null
      });
    });
    
    // Get public templates if requested
    if (includePublic) {
      const publicTemplatesQuery = await db.collection('job_description_templates')
        .where('isPublic', '==', true)
        .where('createdBy', '!=', userId) // Exclude user's own templates
        .orderBy('createdBy') // Required for the inequality filter
        .orderBy('updatedAt', 'desc')
        .limit(20)
        .get();
      
      publicTemplatesQuery.forEach(doc => {
        templates.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || null,
          updatedAt: doc.data().updatedAt?.toDate() || null
        });
      });
    }
    
    return templates;
  } catch (error) {
    console.error('Error fetching job templates:', error);
    throw error;
  }
}

module.exports = {
  analyzeJobRequirements,
  generateJobDescription,
  saveJobTemplate,
  getJobTemplates
};