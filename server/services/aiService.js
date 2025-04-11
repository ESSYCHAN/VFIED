
// server/services/aiService.js
const fs = require('fs').promises;
const path = require('path');
const { createAnthropicClient } = require('@anthropic-ai/sdk');
const { enhanceSkills } = require('./skillsService');

// Initialize the Anthropic client
const anthropic = createAnthropicClient({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Analyzes a document using Claude to extract credential information
 * @param {string} filePath - Path to the uploaded file
 * @param {string} credentialType - Type of credential
 * @returns {Promise<Object>} Extracted credential data
 */
async function analyzeDocumentWithClaude(filePath, credentialType) {
  try {
    // Read the file
    const fileExtension = path.extname(filePath).toLowerCase();
    
    // For PDFs and images, we'd use OCR or a document processing API here
    // For now, we'll assume text files or basic document processing
    
    let documentText = '';
    
    // This is a simplified approach - in production you would:
    // 1. Use OCR for images and PDFs
    // 2. Extract text from DOC/DOCX using libraries
    // 3. Handle different file formats appropriately
    if (['.txt', '.md'].includes(fileExtension)) {
      // For text files, read directly
      documentText = await fs.readFile(filePath, 'utf-8');
    } else {
      // For other files, you'd use a document processing library
      // This is a placeholder for when you add that functionality
      documentText = `This is a ${fileExtension} file that would be processed for text content.`;
    }
    
    // Create a prompt based on credential type
    const prompt = generatePromptForCredentialType(credentialType, documentText);
    
    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      system: "You are an expert at extracting structured information from credential documents. Extract accurate information without adding details that aren't present.",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    
    // Parse the response
    const responseText = response.content[0].text;
    
    // Extract JSON object from response
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)```/) || 
                     responseText.match(/{[\s\S]*}/);
                     
    if (!jsonMatch) {
      throw new Error('Failed to extract structured data from AI response');
    }
    
    // Parse the JSON response
    const jsonString = jsonMatch[1] || jsonMatch[0];
    const extractedData = JSON.parse(jsonString);

    // Enhance the extracted skills
    const enhancedSkills = enhanceSkills(
      extractedData.skills || [],
      documentText,
      credentialType
    );
    
    return {
      title: extractedData.title || '',
      issuer: extractedData.issuer || '',
      dateIssued: extractedData.dateIssued || '',
      description: extractedData.description || '',
      skills: enhancedSkills
      // skills: extractedData.skills || []
    };
  } catch (error) {
    console.error('Document analysis error:', error);
    throw new Error(`Failed to analyze document: ${error.message}`);
  }
}

async function analyzeSkillsWithClaude(candidateData, jobRequirements) {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240307",
      max_tokens: 4000,
      system: "You are an expert in credential analysis and skills assessment...",
      messages: [
        {
          role: "user",
          content: `Analyze this candidate's credentials against the job requirements...`
        }
      ]
    });
    
    return JSON.parse(response.content[0].text);
  } catch (error) {
    console.error("Claude API error:", error);
    throw new Error(`Failed to analyze skills: ${error.message}`);
  }
}


/**
 * Generates a prompt based on the credential type
 */
function generatePromptForCredentialType(credentialType, documentText) {
  const basePrompt = `Extract structured information from this ${credentialType} document. Here's the document content:
  
  ${documentText}
  
  Based on this content, extract the following information in JSON format:`;
  
  const typeSpecificPrompts = {
    education: `
    - title: The name of the degree or educational program
    - issuer: The educational institution that issued this credential
    - dateIssued: The graduation or issue date in YYYY-MM-DD format
    - description: A brief description of the educational program
    - skills: An array of skills or knowledge areas associated with this education
    
    Return only a valid JSON object like this:
    {
      "title": "...",
      "issuer": "...",
      "dateIssued": "YYYY-MM-DD",
      "description": "...",
      "skills": ["skill1", "skill2", ...]
    }`,
    
    work: `
    - title: The job title or position
    - issuer: The company or organization name
    - dateIssued: The start date of this position in YYYY-MM-DD format
    - description: A description of job responsibilities and achievements
    - skills: An array of skills demonstrated or gained in this position
    
    Return only a valid JSON object like this:
    {
      "title": "...",
      "issuer": "...",
      "dateIssued": "YYYY-MM-DD", 
      "description": "...",
      "skills": ["skill1", "skill2", ...]
    }`,
    
    certificate: `
    - title: The name of the certification or credential
    - issuer: The organization that issued this certification
    - dateIssued: The date the certification was awarded in YYYY-MM-DD format
    - description: A description of what this certification represents
    - skills: An array of skills validated by this certification
    
    Return only a valid JSON object like this:
    {
      "title": "...",
      "issuer": "...",
      "dateIssued": "YYYY-MM-DD",
      "description": "...",
      "skills": ["skill1", "skill2", ...]
    }`,
    
    skill: `
    - title: The name of the skill or competency
    - issuer: The organization or platform validating this skill (if applicable)
    - dateIssued: The date the skill was validated in YYYY-MM-DD format (if applicable)
    - description: A description of this skill and proficiency level
    - skills: Related sub-skills or technologies
    
    Return only a valid JSON object like this:
    {
      "title": "...",
      "issuer": "...",
      "dateIssued": "YYYY-MM-DD",
      "description": "...",
      "skills": ["skill1", "skill2", ...]
    }`
  };
  
  return basePrompt + (typeSpecificPrompts[credentialType] || typeSpecificPrompts.certificate);
}

module.exports = {
  analyzeDocumentWithClaude
};

/**
 * Analyzes job requirements and suggests appropriate experience levels
 * @param {object} jobData Job details including title, responsibilities, etc.
 * @returns {Promise<object>} Analysis results
 */
async function analyzeJobRequirements(jobData) {
  try {
    // Call Claude with your prompt
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      system: `You are an expert in job market analysis with deep knowledge of industry standards.
When analyzing job requirements, carefully check for:
1. EXPERIENCE INFLATION: Flag when years of experience requested exceeds industry norms
2. TECHNOLOGY TIMELINE MISMATCHES: Identify when more years are requested than a technology has existed
3. SKILL STACKING: Flag when too many diverse skills are required for a single role
4. QUALIFICATION/RESPONSIBILITY MISMATCH: Identify mismatches between level and responsibilities

Always return well-formed JSON with these fields:
- yearsOfExperience (string): The suggested years of experience
- isReasonable (boolean): Whether the overall requirements are reasonable
- unrealisticRequirements (array): List of any unrealistic requirements
- suggestions (array): Specific suggestions to improve the description
- reasoning (string): Explanation of your analysis
- healthScore (number): A score from 0-100 indicating how realistic the requirements are`,
      messages: [
        {
          role: "user",
          content: `Analyze this job information:
          
Job Title: ${jobData.jobTitle}
${jobData.department ? `Department: ${jobData.department}` : ''}
${jobData.industry ? `Industry: ${jobData.industry}` : ''}
Seniority Level: ${jobData.seniorityLevel || 'Not specified'}
Key Responsibilities: ${jobData.responsibilities || 'Not provided'}
Required Skills: ${Array.isArray(jobData.requiredSkills) 
  ? jobData.requiredSkills.join(', ') 
  : (jobData.requiredSkills || 'Not provided')}

Please provide:
1. Appropriate years of experience for this role (e.g., "3-5 years")
2. Analysis of whether the requirements are reasonable
3. Identification of any unrealistic expectations
4. Specific suggestions to make requirements more balanced
5. Explanation of your reasoning

IMPORTANT: Return ONLY valid JSON with no additional text.`
        }
      ]
    });
    
    // Parse response as JSON
    try {
      const analysisData = JSON.parse(response.content[0].text);
      return analysisData;
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError);
      console.log('Raw response:', response.content[0].text);
      
      // Return a fallback response
      return {
        yearsOfExperience: "3-5 years",
        isReasonable: true,
        unrealisticRequirements: [],
        suggestions: ["Consider reviewing the job requirements manually."],
        reasoning: "Unable to parse AI response into JSON.",
        healthScore: 70
      };
    }
  } catch (error) {
    console.error('AI job analysis error:', error);
    throw new Error(`Failed to analyze job requirements: ${error.message}`);
  }
}

router.post('/analyze-job-description', auth, async (req, res) => {
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
    
    // Call the AI service
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
    console.error('Error analyzing job description:', error);
    res.status(500).json({ 
      error: 'Failed to analyze job description',
      message: error.message
    });
  }
});
// Export the new function
module.exports = {
  analyzeDocumentWithClaude,
  // Add your new function
  analyzeJobRequirements
};