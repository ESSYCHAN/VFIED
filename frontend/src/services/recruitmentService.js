/// src/services/recruitmentService.js

/**
 * Performs a skills assessment for a candidate against a job role
 */
export const performSkillsAssessment = async (candidateId, jobRequirements) => {
  try {
    // For demo purposes, return mock data instead of making an API call
    await new Promise(r => setTimeout(r, 2000)); // Simulate API delay
    
    // Simulate assessment results
    const mockAssessment = {
      overallMatchPercentage: Math.floor(Math.random() * 30) + 70, // 70-99%
      skillMatchRatings: jobRequirements.skills.map(skill => ({
        skill,
        matchPercentage: Math.floor(Math.random() * 40) + 60 // 60-99%
      })),
      strengths: [
        "Strong background in " + jobRequirements.skills[0],
        "Verified education credentials in relevant field",
        "Demonstrated experience with " + (jobRequirements.skills[1] || jobRequirements.skills[0])
      ],
      skillGaps: [
        "Limited experience with " + (jobRequirements.skills[jobRequirements.skills.length - 1] || "advanced technologies"),
        "No verification for " + (jobRequirements.skills[Math.floor(jobRequirements.skills.length / 2)] || "leadership skills"),
        "Consider obtaining certification in " + (jobRequirements.skills[0] || "relevant field")
      ],
      recommendations: [
        "Focus on obtaining certification for " + (jobRequirements.skills[0] || "key skills"),
        "Add more details to work experience credentials",
        "Update education credentials with specific courses"
      ]
    };
    
    return mockAssessment;
  } catch (error) {
    console.error('Skills assessment failed:', error);
    throw error;
  }
};

/**
 * Gets candidate recommendations for a job role
 */
export const getJobCandidates = async (jobRequirements, searchParams = {}) => {
  try {
    // For demo purposes, return mock data instead of making an API call
    await new Promise(r => setTimeout(r, 1500)); // Simulate API delay
    
    // Mock candidate matches
    const mockMatches = {
      candidates: [
        {
          id: "candidate1",
          name: "Jane Smith",
          matchPercentage: 92,
          topCredentials: ["Master's in Computer Science", "AWS Certified Solutions Architect", "5 years at Google"],
          verificationStrength: "High"
        },
        {
          id: "candidate2",
          name: "John Doe",
          matchPercentage: 85,
          topCredentials: ["Bachelor's in Software Engineering", "Full Stack Developer Certification", "4 years at Amazon"],
          verificationStrength: "Medium"
        },
        {
          id: "candidate3",
          name: "Emily Johnson",
          matchPercentage: 78,
          topCredentials: ["Bachelor's in Computer Science", "JavaScript Certification", "3 years at Startup"],
          verificationStrength: "High"
        }
      ],
      searchCriteria: jobRequirements,
      totalCandidates: 3
    };
    
    return mockMatches;
  } catch (error) {
    console.error('Candidate search failed:', error);
    throw error;
  }
};

/**
 * Suggests interview questions based on candidate profile and job requirements
 */
export const suggestInterviewQuestions = async (candidateId, jobRequirements) => {
  try {
    // For demo purposes, return mock data instead of making an API call
    await new Promise(r => setTimeout(r, 1000)); // Simulate API delay
    
    // Mock interview questions
    const mockQuestions = {
      questions: [
        "Describe a project where you used " + (jobRequirements.skills[0] || "your technical skills") + " to solve a complex problem.",
        "How do you keep your knowledge of " + (jobRequirements.skills[1] || "your field") + " up to date?",
        "Tell me about a time when you had to learn a new technology quickly.",
        "How would you explain " + (jobRequirements.skills[0] || "a complex technical concept") + " to someone with no technical background?",
        "What challenges did you face in your previous role and how did you overcome them?"
      ]
    };
    
    return mockQuestions;
  } catch (error) {
    console.error('Failed to generate interview questions:', error);
    throw error;
  }
};