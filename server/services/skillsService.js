// server/services/skillsService.js
// This would connect to a skills database or taxonomy
// For now, we'll use a simple in-memory approach

// Common skills by domain
const skillsByDomain = {
    software: [
      'JavaScript', 'Python', 'Java', 'C++', 'C#', 'React', 'Angular', 'Vue.js',
      'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'ASP.NET',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD',
      'Git', 'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL',
      'Data Structures', 'Algorithms', 'System Design', 'Microservices'
    ],
    design: [
      'UI Design', 'UX Design', 'Wireframing', 'Prototyping', 'User Research',
      'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
      'Design Systems', 'Interaction Design', 'Visual Design', 'Typography'
    ],
    business: [
      'Project Management', 'Agile', 'Scrum', 'Kanban', 'Product Management',
      'Business Analysis', 'Requirements Gathering', 'Stakeholder Management',
      'Strategic Planning', 'Market Research', 'Financial Analysis',
      'Leadership', 'Team Management', 'Communication', 'Presentation'
    ],
    data: [
      'Data Analysis', 'Data Science', 'Machine Learning', 'Deep Learning',
      'NLP', 'Computer Vision', 'Statistics', 'R', 'Python',
      'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy',
      'Data Visualization', 'Tableau', 'Power BI', 'D3.js'
    ]
  };
  
  // Flatten the skills list for matching
  const allSkills = Object.values(skillsByDomain).flat();
  
  /**
   * Identifies known skills from extracted text
   * @param {string} text - Text to analyze for skills
   * @returns {Array} Array of identified skills
   */
  function extractSkillsFromText(text) {
    if (!text) return [];
    
    const lowerText = text.toLowerCase();
    return allSkills.filter(skill => lowerText.includes(skill.toLowerCase()));
  }
  
  /**
   * Normalizes and enhances extracted skills
   * @param {Array} extractedSkills - Skills extracted by AI
   * @param {string} documentText - Full document text
   * @param {string} credentialType - Type of credential
   * @returns {Array} Enhanced skills list
   */
  function enhanceSkills(extractedSkills, documentText, credentialType) {
    // Start with AI-extracted skills
    let skills = [...extractedSkills];
    
    // Add skills from text analysis
    const textExtractedSkills = extractSkillsFromText(documentText);
    
    // Combine skills lists without duplicates
    const allSkills = [...new Set([...skills, ...textExtractedSkills])];
    
    // Add domain-specific skills based on credential type
    if (credentialType === 'education' && documentText.toLowerCase().includes('computer science')) {
      allSkills.push(...skillsByDomain.software.slice(0, 3));
    }
    
    // Return unique, sorted skills
    return [...new Set(allSkills)].sort();
  }
  
  module.exports = {
    extractSkillsFromText,
    enhanceSkills
  };