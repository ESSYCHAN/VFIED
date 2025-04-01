// src/components/AIJobMatching.js
import React, { useState, useEffect } from 'react';
import { styles } from '../styles/sharedStyles';

const AIJobMatching = ({ userId, credentials }) => {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleAddSkill = () => {
    if (currentSkill.trim()) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!jobTitle || !jobDescription || skills.length === 0) {
      setError('Please fill in all required fields and add at least one skill');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const jobRequirements = {
        title: jobTitle,
        description: jobDescription,
        skills,
        userId
      };
      
      // Generate more personalized assessment based on user's actual credentials
      const userSkills = new Set();
      const userEducation = new Set();
      const userCertifications = new Set();
      
      // Extract skills, education, certifications from user credentials
      credentials.forEach(cred => {
        if (cred.type === 'skill') {
          userSkills.add(cred.title);
        } else if (cred.type === 'education') {
          userEducation.add(cred.title);
        } else if (cred.type === 'certificate') {
          userCertifications.add(cred.title);
        }
      });
      
      // Simulate assessment results but make them more relevant to actual credentials
      await new Promise(r => setTimeout(r, 1500)); // Simulate API delay
      
      // Personalize match percentages based on skills overlap
      const matchingSkills = skills.filter(skill => 
        userSkills.has(skill) || credentials.some(c => 
          c.title.toLowerCase().includes(skill.toLowerCase())
        )
      );
      
      const skillMatchPercentage = skills.length ? 
        Math.round((matchingSkills.length / skills.length) * 100) : 0;
      
      // Better skill-specific match calculations
      const skillMatches = skills.map(skill => {
        const hasSkill = userSkills.has(skill) || credentials.some(c => 
          c.title.toLowerCase().includes(skill.toLowerCase()) || 
          (c.description && c.description.toLowerCase().includes(skill.toLowerCase()))
        );
        
        return {
          skill,
          matchPercentage: hasSkill ? 
            Math.floor(Math.random() * 20) + 80 : // 80-99% for skills they have
            Math.floor(Math.random() * 30) + 50   // 50-79% for skills they don't have
        };
      });
      
      // Personalized assessment
      const assessment = {
        overallMatchPercentage: Math.max(60, skillMatchPercentage),
        skillMatchRatings: skillMatches,
        strengths: generateStrengths(credentials, skills, userSkills, userEducation),
        skillGaps: generateSkillGaps(skills, userSkills, userCertifications),
        recommendations: generateRecommendations(skills, userSkills, userCertifications)
      };
      
      setResults(assessment);
    } catch (err) {
      console.error('Error performing skills assessment:', err);
      setError('Failed to analyze skills. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to generate more personalized assessment data
  const generateStrengths = (credentials, jobSkills, userSkills, userEducation) => {
    const strengths = [];
    
    // Check for matching skills
    const matchingSkills = jobSkills.filter(skill => userSkills.has(skill));
    if (matchingSkills.length > 0) {
      strengths.push(`Strong background in ${matchingSkills.join(', ')}`);
    }
    
    // Check for relevant education
    if (userEducation.size > 0) {
      strengths.push(`Verified education credentials: ${Array.from(userEducation).join(', ')}`);
    }
    
    // Check for experience
    const workExperience = credentials.filter(c => c.type === 'work');
    if (workExperience.length > 0) {
      strengths.push(`Professional experience: ${workExperience.map(w => w.title).join(', ')}`);
    }
    
    // Ensure we have at least 3 strengths
    while (strengths.length < 3) {
      strengths.push(`Potential for growth in ${jobSkills[Math.floor(Math.random() * jobSkills.length)]}`);
    }
    
    return strengths;
  };

  const generateSkillGaps = (jobSkills, userSkills, userCertifications) => {
    const gaps = [];
    
    // Identify missing skills
    const missingSkills = jobSkills.filter(skill => !userSkills.has(skill));
    if (missingSkills.length > 0) {
      for (const skill of missingSkills.slice(0, 2)) {
        gaps.push(`Limited experience with ${skill}`);
      }
    }
    
    // Suggest certifications
    if (userCertifications.size === 0 && jobSkills.length > 0) {
      gaps.push(`No certifications for ${jobSkills[0]}`);
    }
    
    // Ensure we have at least 3 gaps
    while (gaps.length < 3) {
      gaps.push(`Consider developing skills in ${jobSkills[Math.floor(Math.random() * jobSkills.length)]}`);
    }
    
    return gaps;
  };

  const generateRecommendations = (jobSkills, userSkills, userCertifications) => {
    const recommendations = [];
    
    // Recommend certifications
    if (jobSkills.length > 0) {
      recommendations.push(`Obtain certification in ${jobSkills[0]}`);
    }
    
    // Recommend adding more details
    recommendations.push('Add more detailed descriptions to your work experience credentials');
    
    // Recommend specific skill development
    const missingSkills = jobSkills.filter(skill => !userSkills.has(skill));
    if (missingSkills.length > 0) {
      recommendations.push(`Develop skills in ${missingSkills[0]}`);
    } else {
      recommendations.push('Continue expanding your expertise in your strongest skills');
    }
    
    return recommendations;
  };

  // Function to render the skill match result
  const renderSkillMatch = () => {
    if (!results) return null;
    
    return (
      <div style={{ 
        backgroundColor: '#f9fafb', 
        borderRadius: '8px', 
        padding: '16px',
        marginTop: '20px' 
      }}>
        <h3 style={{ fontWeight: '600', fontSize: '18px', marginBottom: '12px' }}>
          Skills Assessment Results
        </h3>
        
        <div style={{ 
          backgroundColor: getMatchColor(results.overallMatchPercentage), 
          color: 'white', 
          padding: '8px 16px', 
          borderRadius: '16px', 
          display: 'inline-block',
          marginBottom: '16px'
        }}>
          {results.overallMatchPercentage}% Match
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>Skill Match Breakdown:</h4>
          
          {results.skillMatchRatings.map((skill, index) => (
            <div key={index} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{skill.skill}</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: getMatchColor(skill.matchPercentage) }}>
                  {skill.matchPercentage}%
                </div>
              </div>
              
              <div style={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${skill.matchPercentage}%`, 
                    backgroundColor: getMatchColor(skill.matchPercentage),
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>Key Strengths:</h4>
          <ul style={{ paddingLeft: '20px' }}>
            {results.strengths.map((strength, index) => (
              <li key={index} style={{ marginBottom: '8px' }}>{strength}</li>
            ))}
          </ul>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>Skill Gaps:</h4>
          <ul style={{ paddingLeft: '20px' }}>
            {results.skillGaps.map((gap, index) => (
              <li key={index} style={{ marginBottom: '8px' }}>{gap}</li>
            ))}
          </ul>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>Recommendations:</h4>
          <ul style={{ paddingLeft: '20px' }}>
            {results.recommendations.map((recommendation, index) => (
              <li key={index} style={{ marginBottom: '8px' }}>{recommendation}</li>
            ))}
          </ul>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button
            onClick={() => setResults(null)}
            style={{
              backgroundColor: '#5a45f8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            Close Assessment
          </button>
          
          <button
            onClick={() => window.print()}
            style={{
              backgroundColor: 'transparent',
              color: '#5a45f8',
              border: '1px solid #5a45f8',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🖨️</span> Print Results
          </button>
        </div>
      </div>
    );
  };

  // Helper function to get color based on match percentage
  const getMatchColor = (percentage) => {
    if (percentage >= 90) return '#15803d'; // green
    if (percentage >= 75) return '#5a45f8'; // purple
    if (percentage >= 60) return '#c2410c'; // orange
    return '#6b7280'; // gray
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={styles.flexBetween}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          AI Skills Assessment
        </h2>
        {!showForm && !results && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              backgroundColor: '#5a45f8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            Assess My Skills
          </button>
        )}
      </div>
      
      {showForm && !results && (
        <div style={styles.card}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Enter Job Details to Assess Your Skills
          </h3>
          
          {error && (
            <div style={{ 
              backgroundColor: '#FFEBEE', 
              color: '#B71C1C', 
              padding: '12px', 
              borderRadius: '4px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Job Title*
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px'
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Job Description*
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  minHeight: '100px'
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Required Skills*
              </label>
              <div style={{ display: 'flex' }}>
                <input
                  type="text"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  placeholder="Add a skill"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px 0 0 4px'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#5a45f8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0 4px 4px 0',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
              
              {skills.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '8px',
                  marginTop: '12px'
                }}>
                  {skills.map((skill, index) => (
                    <div key={index} style={{
                      backgroundColor: '#e5e7eb',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '14px'
                    }}>
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          marginLeft: '4px',
                          cursor: 'pointer',
                          fontSize: '16px',
                          color: '#6b7280',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {skills.length > 0 && (
                <p style={{ 
                  fontSize: '12px', 
                  color: '#6b7280', 
                  marginTop: '8px' 
                }}>
                  Tip: Add multiple skills to get a more comprehensive assessment.
                </p>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: '#5a45f8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Analyzing...' : 'Analyze My Skills'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={loading}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {renderSkillMatch()}
    </div>
  );
};

export default AIJobMatching;