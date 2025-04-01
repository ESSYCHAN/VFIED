// server/services/aiService.js
const axios = require('axios');
require('dotenv').config();

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;

/**
 * Analyzes a candidate's skills against job requirements using Claude
 * @param {Object} candidateData - Candidate credentials and profile
 * @param {Object} jobRequirements - Job requirements and details
 * @returns {Promise<Object>} Promise resolving to assessment results
 */
async function analyzeSkillsWithClaude(candidateData, jobRequirements) {
  try {
    console.log('Sending request to Claude API for skills assessment');
    
    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: "claude-3-opus-20240229",
        max_tokens: 4000,
        system: "You are an expert in credential analysis and skills assessment. Your task is to analyze a candidate's credentials against job requirements and provide detailed insights and recommendations.",
        messages: [
          {
            role: "user",
            content: `Analyze this candidate's credentials against the job requirements.
              
              Candidate information:
              ${JSON.stringify(candidateData, null, 2)}
              
              Job Requirements:
              ${JSON.stringify(jobRequirements, null, 2)}
              
              Please provide a comprehensive analysis including:
              1. Overall match percentage (a number between 0-100)
              2. Skill-by-skill assessment with match percentages for each required skill
              3. Top strengths of the candidate relative to the position
              4. Skill gaps or areas for development
              5. Assessment of credential verification strength
              6. Recommendations for the recruiter
              7. 5-7 suggested interview questions tailored to this candidate
              
              Format your response as a detailed JSON object with these sections:
              {
                "overallMatchPercentage": number,
                "skillMatchRatings": [{"skill": string, "matchPercentage": number}],
                "strengths": [string],
                "skillGaps": [string],
                "verificationAssessment": string,
                "recommendations": [string],
                "suggestedInterviewQuestions": [string]
              }`
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    console.log('Received response from Claude API');
    
    // Extract and parse the JSON response
    const content = response.data.content[0].text;
    let jsonStart = content.indexOf('{');
    let jsonEnd = content.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('Could not find valid JSON in Claude response');
    }
    
    const jsonString = content.substring(jsonStart, jsonEnd);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Claude API error:", error);
    throw new Error(`Failed to analyze skills: ${error.message}`);
  }
}

/**
 * Generates interview questions for a candidate based on their profile and job requirements
 * @param {Object} candidateData - Candidate credentials and profile
 * @param {Object} jobRequirements - Job requirements and details
 * @returns {Promise<Array>} Promise resolving to interview questions
 */
async function generateInterviewQuestions(candidateData, jobRequirements) {
  try {
    console.log('Sending request to Claude API for interview questions');
    
    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: "claude-3-haiku-20240307",
        max_tokens: 2000,
        system: "You are an expert in technical interviews and recruitment. Your task is to generate targeted interview questions based on a candidate's profile and job requirements.",
        messages: [
          {
            role: "user",
            content: `Generate interview questions for this candidate based on their profile and the job requirements.
              
              Candidate information:
              ${JSON.stringify(candidateData, null, 2)}
              
              Job Requirements:
              ${JSON.stringify(jobRequirements, null, 2)}
              
              Please generate 10 interview questions that:
              1. Assess technical skills relevant to the position
              2. Verify experience claimed in credentials
              3. Explore ability to handle job-specific challenges
              4. Evaluate cultural fit and soft skills
              
              For each question, include:
              - The question itself
              - What this question aims to assess
              - What to look for in a good answer
              
              Format your response as a JSON array of question objects.`
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    console.log('Received response from Claude API');
    
    // Extract and parse the JSON response
    const content = response.data.content[0].text;
    let jsonStart = content.indexOf('[');
    let jsonEnd = content.lastIndexOf(']') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      jsonStart = content.indexOf('{');
      jsonEnd = content.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('Could not find valid JSON in Claude response');
      }
    }
    
    const jsonString = content.substring(jsonStart, jsonEnd);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Claude API error:", error);
    throw new Error(`Failed to generate interview questions: ${error.message}`);
  }
}

/**
 * Finds candidates that match job requirements
 * @param {Object} jobRequirements - Job requirements and details
 * @param {Array} candidatePool - Pool of available candidates to match from
 * @returns {Promise<Object>} Promise resolving to candidate matches and scores
 */
async function findMatchingCandidates(jobRequirements, candidatePool) {
  try {
    console.log('Analyzing candidate matches for job requirements');
    
    // For simplicity, we'll score candidates locally without using Claude API
    // In a real implementation, you could use Claude for more sophisticated matching
    
    const scoredCandidates = candidatePool.map(candidate => {
      // Basic matching algorithm
      let matchScore = 0;
      let totalSkills = jobRequirements.skills.length;
      
      // Score based on skills match
      if (candidate.skills) {
        jobRequirements.skills.forEach(requiredSkill => {
          if (candidate.skills.some(skill => 
            skill.toLowerCase().includes(requiredSkill.toLowerCase())
          )) {
            matchScore += 1;
          }
        });
      }
      
      // Calculate percentage
      const matchPercentage = totalSkills > 0 
        ? Math.round((matchScore / totalSkills) * 100) 
        : 50;
      
      // Add random factor for demo purposes
      const adjustedMatch = Math.min(100, Math.max(0, 
        matchPercentage + Math.floor(Math.random() * 30)
      ));
      
      return {
        id: candidate.id,
        name: candidate.name,
        matchPercentage: adjustedMatch,
        topCredentials: candidate.credentials?.slice(0, 3) || [],
        verificationStrength: getVerificationStrength(candidate)
      };
    });
    
    // Sort by match percentage descending
    scoredCandidates.sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    return {
      candidates: scoredCandidates,
      searchCriteria: jobRequirements,
      totalCandidates: scoredCandidates.length
    };
  } catch (error) {
    console.error("Error finding matching candidates:", error);
    throw new Error(`Failed to find matching candidates: ${error.message}`);
  }
}

/**
 * Helper function to determine verification strength
 * @param {Object} candidate - Candidate data
 * @returns {String} Verification strength (High, Medium, Low)
 */
function getVerificationStrength(candidate) {
  if (!candidate.credentials) return 'Low';
  
  const verifiedCount = candidate.credentials.filter(
    cred => cred.verificationStatus === 'verified'
  ).length;
  
  const percentage = verifiedCount / candidate.credentials.length;
  
  if (percentage >= 0.7) return 'High';
  if (percentage >= 0.3) return 'Medium';
  return 'Low';
}

module.exports = {
  analyzeSkillsWithClaude,
  generateInterviewQuestions,
  findMatchingCandidates
};