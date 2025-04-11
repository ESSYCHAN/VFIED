// server/services/aiJobDescriptionService.js
const { createAnthropicClient } = require('@anthropic-ai/sdk');
const { db } = require('../firebase/admin');

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
Always return well-formed JSON that can be parsed by JavaScript's JSON.parse() function.`,
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

Format your response as JSON with the following keys:
- yearsOfExperience (string): The suggested years of experience
- isReasonable (boolean): Whether the overall requirements are reasonable
- unrealisticRequirements (array): List of any unrealistic requirements
- suggestions (array): Specific suggestions to improve the description
- reasoning (string): Explanation of your analysis
- healthScore (number): A score from 0-100 indicating how realistic the requirements are`
        }
      ]
    });
    
    // Parse the response
    try {
      const responseText = response.content[0].text;
      const analysisData = JSON.parse(responseText);
      
      // Log the analysis for future model improvements
      await db.collection('job_requirement_analyses').add({
        jobData,
        analysis: analysisData,
        timestamp: new Date()
      });
      
      return analysisData;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('Raw response:', response.content[0].text);
      throw new Error('Failed to parse AI response');
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
    const analysis = await analyzeJobRequirements(jobData);
    
    // Now generate the full job description
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2000,
      system: `You are an expert in writing effective, balanced job descriptions that are fair to both employers and candidates. 
Create professional job descriptions that accurately reflect role requirements without being unrealistic.
Focus on being specific, clear, and concise while using inclusive language.
Format job descriptions professionally with proper sections and bullet points.
Always return well-formed JSON that can be parsed by JavaScript's JSON.parse() function.`,
      messages: [
        {
          role: "user",
          content: `Create a complete job description based on the following information:
          
Job Title: ${jobTitle}
${department ? `Department: ${department}` : ''}
${industry ? `Industry: ${industry}` : ''}
Seniority Level: ${seniorityLevel || 'Not specified'}
Suggested Experience: ${analysis.yearsOfExperience || 'Not specified'}
Key Responsibilities: ${responsibilities || 'Not provided'}
Required Skills: ${skills || 'Not provided'}
${companyInfo ? `Company Information: ${JSON.stringify(companyInfo)}` : ''}

Format your response as JSON with the following sections:
- title (string): The formatted job title
- summary (string): A brief overview of the role
- responsibilities (array): Detailed bullet points of job responsibilities
- requiredQualifications (array): Must-have qualifications including education and experience
- preferredQualifications (array): Nice-to-have qualifications
- benefits (array): Company benefits if provided in company info
- yearsOfExperience (string): The experience requirement
- educationRequirement (string): Suggested education level
- skillsRequired (array): Organized list of required skills
- salary (object): Suggested salary range with min and max properties if applicable`
        }
      ]
    });
    
    // Parse the response
    try {
      const responseText = response.content[0].text;
      const jobDescriptionData = JSON.parse(responseText);
      
      // Combine with the analysis data
      return {
        ...jobDescriptionData,
        analysis: {
          isReasonable: analysis.isReasonable,
          unrealisticRequirements: analysis.unrealisticRequirements,
          suggestions: analysis.suggestions,
          healthScore: analysis.healthScore
        }
      };
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('Raw response:', response.content[0].text);
      throw new Error('Failed to parse AI response');
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
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return templateRef.id;
  } catch (error) {
    console.error('Error saving job template:', error);
    throw error;
  }
}

module.exports = {
  analyzeJobRequirements,
  generateJobDescription,
  saveJobTemplate
};