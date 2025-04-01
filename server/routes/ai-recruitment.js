// server/routes/ai-recruitment.js
const express = require('express');
const router = express.Router();
const { db, admin } = require('../firebase/admin');
const auth = require('../middleware/auth');
const { 
  analyzeSkillsWithClaude, 
  generateInterviewQuestions,
  findMatchingCandidates
} = require('../services/aiService');

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
      const data = doc.data();
      credentials.push({
        id: doc.id,
        title: data.title,
        type: data.type,
        issuer: data.issuer || '',
        description: data.description || '',
        dateIssued: data.dateIssued ? new Date(data.dateIssued).toISOString() : null,
        verificationStatus: data.verificationStatus || 'unverified',
        documentUrl: data.documentUrl || null
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
    
    const userData = userDoc.data();
    
    return {
      name: userData.name || '',
      title: userData.title || '',
      summary: userData.summary || '',
      skills: userData.skills || [],
      experience: userData.experience || [],
      education: userData.education || []
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
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
    
    console.log(`Processing skills assessment for candidate ${candidateId}`);
    
    // Fetch candidate data
    const credentials = await fetchUserCredentials(candidateId);
    const profile = await fetchUserProfile(candidateId);
    
    // Combine data for analysis
    const candidateData = { credentials, profile };
    
    // Use Claude to assess skills
    const assessment = await analyzeSkillsWithClaude(candidateData, jobRequirements);
    
    // Save assessment to database
    const assessmentRef = await db.collection('skillsAssessments').add({
      candidateId,
      recruiterId: req.user.uid,
      jobRequirements,
      assessment,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Return assessment with ID
    res.json({
      id: assessmentRef.id,
      ...assessment
    });
  } catch (error) {
    console.error('Error performing skills assessment:', error);
    res.status(500).json({ error: 'Failed to perform skills assessment: ' + error.message });
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
    
    console.log('Processing candidate search for job requirements:', jobRequirements.title);
    
    // Fetch candidate pool
    // In a real implementation, you would query your database for candidates
    // For demo purposes, we'll use a mock candidatePool
    const candidatePool = await fetchCandidatePool();
    
    // Find matching candidates
    const matches = await findMatchingCandidates(jobRequirements, candidatePool);
    
    res.json(matches);
  } catch (error) {
    console.error('Error finding candidates:', error);
    res.status(500).json({ error: 'Failed to find candidates: ' + error.message });
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
    
    console.log(`Generating interview questions for candidate ${candidateId}`);
    
    // Fetch candidate data
    const credentials = await fetchUserCredentials(candidateId);
    const profile = await fetchUserProfile(candidateId);
    
    // Combine data for analysis
    const candidateData = { credentials, profile };
    
    // Use Claude to generate interview questions
    const questions = await generateInterviewQuestions(candidateData, jobRequirements);
    
    res.json({ questions });
  } catch (error) {
    console.error('Error generating interview questions:', error);
    res.status(500).json({ error: 'Failed to generate interview questions: ' + error.message });
  }
});

/**
 * Fetch candidate pool (mock function)
 * In a real implementation, this would query your database
 */
async function fetchCandidatePool() {
  // Mock candidate pool for demo purposes
  return [
    {
      id: 'candidate1',
      name: 'Jane Smith',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS'],
      credentials: [
        { title: 'BS Computer Science', issuer: 'MIT', verificationStatus: 'verified' },
        { title: 'Full Stack Developer', issuer: 'Google', verificationStatus: 'verified' },
        { title: 'AWS Certified Developer', issuer: 'Amazon', verificationStatus: 'pending' }
      ]
    },
    {
      id: 'candidate2',
      name: 'John Doe',
      skills: ['Python', 'Django', 'PostgreSQL', 'React', 'Docker'],
      credentials: [
        { title: 'MS in Data Science', issuer: 'Stanford', verificationStatus: 'verified' },
        { title: 'Backend Engineer', issuer: 'Amazon', verificationStatus: 'verified' },
        { title: 'Python Certification', issuer: 'Coursera', verificationStatus: 'verified' }
      ]
    },
    {
      id: 'candidate3',
      name: 'Emily Johnson',
      skills: ['Java', 'Spring', 'Kubernetes', 'MySQL', 'React Native'],
      credentials: [
        { title: 'BS Software Engineering', issuer: 'UC Berkeley', verificationStatus: 'verified' },
        { title: 'Mobile Developer', issuer: 'Facebook', verificationStatus: 'pending' },
        { title: 'Cloud Architect', issuer: 'Microsoft', verificationStatus: 'unverified' }
      ]
    }
  ];
}

module.exports = router;