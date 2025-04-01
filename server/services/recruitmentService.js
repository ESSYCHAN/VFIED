// server/routes/ai-recruitment.js
const express = require('express');
const { OpenAI } = require('openai');
const { db, admin } = require('../firebase');
const router = express.Router();
const auth = require('../middleware/auth');

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Fetch user credentials for assessment
 */
async function fetchUserCredentials(userId) {
  try {
    const credentialsRef = db.collection('credentials');
    const snapshot = await credentialsRef.where('userId', '==', userId).get();
    
    if (snapshot.empty) {
      return [];
    }
    
    const credentials = [];
    snapshot.forEach(doc => {
      credentials.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return credentials;
  } catch (error) {
    console.error('Error fetching user credentials:', error);
    throw error;
  }
}

/**
 * Fetch user profile for assessment
 */
async function fetchUserProfile(userId) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new Error('User profile not found');
    }
    
    return userDoc.data();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Analyze skills from credentials
 */
async function analyzeSkills(credentials, profile) {
  // Format credential data for the AI
  const credentialData = credentials.map(cred => {
    return {
      title: cred.title,
      type: cred.type,
      issuer: cred.issuer,
      dateIssued: cred.dateIssued,
      description: cred.description || '',
      verificationStatus: cred.verificationStatus || 'unverified'
    };
  });
  
  // Create a summary of the user's background
  const userSummary = {
    name: profile.name,
    title: profile.title || '',
    summary: profile.summary || '',
    experience: profile.experience || [],
    education: profile.education || [],
    skills: profile.skills || []
  };
  
  // Combine all data for analysis
  const analysisData = {
    credentials: credentialData,
    profile: userSummary
  };
  
  return analysisData;
}

/**
 * Skills assessment endpoint
 */
router.post('/assess-skills', auth, async (req, res) => {
  try {
    const { candidateId, jobRequirements } = req.body;
    
    if (!candidateId || !jobRequirements) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Ensure recruiter has permission to view this data
    // Implementation depends on your permission system
    
    // Fetch candidate data
    const credentials = await fetchUserCredentials(candidateId);
    const profile = await fetchUserProfile(candidateId);
    
    // Analyze skills
    const analysisData = await analyzeSkills(credentials, profile);
    
    // Use LBM to assess skills match
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert AI recruitment assistant specializing in skills assessment. 
          Analyze the candidate's credentials and profile against the job requirements.
          Provide a detailed assessment of skills match, including strengths, gaps, and overall fit.
          Be objective and thorough in your analysis.`
        },
        {
          role: "user",
          content: `
          Candidate information:
          ${JSON.stringify(analysisData, null, 2)}
          
          Job Requirements:
          ${JSON.stringify(jobRequirements, null, 2)}
          
          Perform a comprehensive skills assessment for this candidate against the job requirements.
          Include:
          1. Overall match percentage
          2. Specific skill match ratings (for each required skill)
          3. Strengths relative to the position
          4. Skill gaps or areas for development
          5. Verification assessment (how well are their claims verified)
          6. Recommendations for the recruiter
          
          Format your response as a detailed JSON object with the above sections.
          `
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const assessment = JSON.parse(completion.choices[0].message.content);
    
    // Save assessment to database for future reference
    await db.collection('skillsAssessments').add({
      candidateId,
      recruiterId: req.user.uid,
      jobRequirements,
      assessment,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json(assessment);
  } catch (error) {
    console.error('Error performing skills assessment:', error);
    res.status(500).json({ error: 'Failed to perform skills assessment' });
  }
});

/**
 * Find candidates for a job role
 */
router.post('/find-candidates', auth, async (req, res) => {
  try {
    const { jobRequirements, searchParams } = req.body;
    
    if (!jobRequirements) {
      return res.status(400).json({ error: 'Missing job requirements' });
    }
    
    // Fetch candidates based on search parameters
    // This would depend on your database structure and search implementation
    
    // For demonstration, we'll return a sample response
    const candidateMatches = {
      candidates: [
        {
          id: "candidate1",
          name: "Jane Smith",
          matchPercentage: 92,
          topCredentials: [
            "Master's in Computer Science",
            "AWS Certified Solutions Architect",
            "5 years at Google"
          ],
          verificationStrength: "High"
        },
        {
          id: "candidate2",
          name: "John Doe",
          matchPercentage: 87,
          topCredentials: [
            "Bachelor's in Software Engineering",
            "Full Stack Developer Certification",
            "4 years at Amazon"
          ],
          verificationStrength: "Medium"
        },
        {
          id: "candidate3",
          name: "Emily Johnson",
          matchPercentage: 78,
          topCredentials: [
            "Bachelor's in Computer Science",
            "JavaScript Certification",
            "3 years at Startup"
          ],
          verificationStrength: "High"
        }
      ],
      searchCriteria: jobRequirements,
      totalCandidates: 3,
      searchParameters: searchParams
    };
    
    res.json(candidateMatches);
  } catch (error) {
    console.error('Error finding candidates:', error);
    res.status(500).json({ error: 'Failed to find candidates' });
  }
});

/**
 * Compare candidate to job requirements
 */
router.post('/compare-candidate', auth, async (req, res) => {
  try {
    const { candidateId, jobRequirements } = req.body;
    
    if (!candidateId || !jobRequirements) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Fetch candidate data
    const credentials = await fetchUserCredentials(candidateId);
    const profile = await fetchUserProfile(candidateId);
    
    // Analyze skills
    const analysisData = await analyzeSkills(credentials, profile);
    
    // Use LBM to generate comparison
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert AI recruitment assistant specializing in candidate comparison.
          Generate a detailed comparison between the candidate and job requirements.
          Focus on specific skills, experience, and credentials.`
        },
        {
          role: "user",
          content: `
          Candidate information:
          ${JSON.stringify(analysisData, null, 2)}
          
          Job Requirements:
          ${JSON.stringify(jobRequirements, null, 2)}
          
          Generate a detailed comparison between this candidate and the job requirements.
          Include specific skill-by-skill comparison, experience relevance, and credential match.
          `
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const comparison = JSON.parse(completion.choices[0].message.content);
    
    res.json(comparison);
  } catch (error) {
    console.error('Error comparing candidate:', error);
    res.status(500).json({ error: 'Failed to compare candidate' });
  }
});

/**
 * Identify skill gaps for a candidate
 */
router.post('/skill-gaps', auth, async (req, res) => {
  try {
    const { candidateId, jobRequirements } = req.body;
    
    if (!candidateId || !jobRequirements) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Fetch candidate data
    const credentials = await fetchUserCredentials(candidateId);
    const profile = await fetchUserProfile(candidateId);
    
    // Analyze skills
    const analysisData = await analyzeSkills(credentials, profile);
    
    // Use LBM to identify skill gaps
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert AI recruitment assistant specializing in skill gap analysis.
          Identify specific skill gaps between the candidate and job requirements.
          Provide recommendations for addressing these gaps.`
        },
        {
          role: "user",
          content: `
          Candidate information:
          ${JSON.stringify(analysisData, null, 2)}
          
          Job Requirements:
          ${JSON.stringify(jobRequirements, null, 2)}
          
          Identify specific skill gaps between this candidate and the job requirements.
          For each gap, provide:
          1. The missing or underdeveloped skill
          2. The importance of this skill for the role
          3. Recommendations for how the candidate could develop this skill
          4. Estimated time to develop the skill to the required level
          
          Format your response as a JSON object.
          `
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const skillGaps = JSON.parse(completion.choices[0].message.content);
    
    res.json(skillGaps);
  } catch (error) {
    console.error('Error identifying skill gaps:', error);
    res.status(500).json({ error: 'Failed to identify skill gaps' });
  }
});

/**
 * Generate interview questions
 */
router.post('/interview-questions', auth, async (req, res) => {
  try {
    const { candidateId, jobRequirements } = req.body;
    
    if (!candidateId || !jobRequirements) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Fetch candidate data
    const credentials = await fetchUserCredentials(candidateId);
    const profile = await fetchUserProfile(candidateId);
    
    // Analyze skills
    const analysisData = await analyzeSkills(credentials, profile);
    
    // Use LBM to generate interview questions
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert AI recruitment assistant specializing in interview preparation.
          Generate targeted interview questions based on the candidate's profile and job requirements.
          Focus on assessing skills, experience, and cultural fit.`
        },
        {
          role: "user",
          content: `
          Candidate information:
          ${JSON.stringify(analysisData, null, 2)}
          
          Job Requirements:
          ${JSON.stringify(jobRequirements, null, 2)}
          
          Generate 10-15 targeted interview questions for this candidate based on:
          1. Technical skills assessment
          2. Experience verification
          3. Skill gap exploration
          4. Cultural fit evaluation
          5. Problem-solving capabilities
          
          For each question, include:
          - The question itself
          - What you're trying to assess with this question
          - What to look for in a good answer
          
          Format your response as a JSON object.
          `
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const interviewQuestions = JSON.parse(completion.choices[0].message.content);
    
    res.json(interviewQuestions);
  } catch (error) {
    console.error('Error generating interview questions:', error);
    res.status(500).json({ error: 'Failed to generate interview questions' });
  }
});

module.exports = router;