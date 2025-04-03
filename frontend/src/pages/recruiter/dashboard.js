// src/pages/recruiter/dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import Head from 'next/head';
import { styles } from '../../styles/sharedStyles';
import { getJobCandidates, performSkillsAssessment } from '../../services/recruitmentService';
import { getRequisitions } from '../../services/recruiter/requisitionService';
import Link from 'next/link';


// Job Requirements Form
const JobRequirementsForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: [],
    experience: '',
    education: '',
    location: '',
    workType: 'full-time',
  });
  
  const [currentSkill, setCurrentSkill] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleAddSkill = () => {
    if (currentSkill.trim() !== '') {
      setFormData({
        ...formData,
        skills: [...formData.skills, currentSkill.trim()]
      });
      setCurrentSkill('');
    }
  };
  
  const handleRemoveSkill = (index) => {
    const newSkills = [...formData.skills];
    newSkills.splice(index, 1);
    setFormData({
      ...formData,
      skills: newSkills
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <div style={styles.card}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Job Requirements</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Job Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Senior Software Engineer"
            style={{ 
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '16px'
            }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Job Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter a detailed job description..."
            style={{ 
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '16px',
              minHeight: '100px',
              resize: 'vertical'
            }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Required Skills
          </label>
          <div style={{ display: 'flex', marginBottom: '8px' }}>
            <input
              type="text"
              value={currentSkill}
              onChange={(e) => setCurrentSkill(e.target.value)}
              placeholder="e.g., JavaScript, React, Node.js"
              style={{ 
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px 0 0 6px',
                fontSize: '16px'
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
                borderRadius: '0 6px 6px 0',
                cursor: 'pointer'
              }}
            >
              Add
            </button>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {formData.skills.map((skill, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '16px',
                  padding: '4px 12px',
                  fontSize: '14px'
                }}
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(index)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    marginLeft: '4px',
                    color: '#6b7280',
                    fontSize: '16px'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Required Experience (years)
          </label>
          <input
            type="text"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            placeholder="e.g., 3-5 years"
            style={{ 
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Education Requirements
          </label>
          <input
            type="text"
            name="education"
            value={formData.education}
            onChange={handleChange}
            placeholder="e.g., Bachelor's in Computer Science or equivalent"
            style={{ 
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Remote, New York, London"
            style={{ 
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Work Type
          </label>
          <select
            name="workType"
            value={formData.workType}
            onChange={handleChange}
            style={{ 
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="freelance">Freelance</option>
            <option value="internship">Internship</option>
          </select>
        </div>
        
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#5a45f8',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Finding Matches...' : 'Find Matching Candidates'}
        </button>
      </form>
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

// Candidate Card Component
const CandidateCard = ({ candidate, jobRequirements, onAssessClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      style={{
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'white',
        marginBottom: '16px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        boxShadow: isHovered ? '0 4px 6px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{candidate.name}</h3>
          <div style={{ 
            display: 'inline-block',
            padding: '4px 8px',
            backgroundColor: getMatchColor(candidate.matchPercentage),
            color: 'white',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '12px'
          }}>
            {candidate.matchPercentage}% Match
          </div>
        </div>
        
        <div style={{ 
          padding: '4px 8px',
          backgroundColor: '#f3f4f6', 
          borderRadius: '4px',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          Verification: {candidate.verificationStrength}
        </div>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Top Credentials:</p>
        <ul style={{ paddingLeft: '20px', margin: 0 }}>
          {candidate.topCredentials.map((credential, index) => (
            <li key={index} style={{ fontSize: '14px', marginBottom: '4px' }}>
              {credential}
            </li>
          ))}
        </ul>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button
          style={{
            padding: '8px 12px',
            backgroundColor: 'transparent',
            color: '#5a45f8',
            border: '1px solid #5a45f8',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
          onClick={() => window.open(`/profile/${candidate.id}`, '_blank')}
        >
          View Profile
        </button>
        
        <button
          style={{
            padding: '8px 12px',
            backgroundColor: '#5a45f8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
          onClick={() => onAssessClick(candidate.id)}
        >
          Detailed Skills Assessment
        </button>
      </div>
    </div>
  );
};

// Skills Assessment Result Component
const SkillsAssessmentResult = ({ assessment, onClose }) => {
  if (!assessment) return null;
  
  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Skills Assessment Results</h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#6b7280'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ 
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: '#f9fafb',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '48px', fontWeight: '700', color: getMatchColor(assessment.overallMatchPercentage) }}>
          {assessment.overallMatchPercentage}%
        </div>
        <div style={{ fontSize: '16px', color: '#6b7280' }}>Overall Match</div>
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Skill Match Ratings</h3>
        
        {assessment.skillMatchRatings.map((skill, index) => (
          <div key={index} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{skill.skill}</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: getMatchColor(skill.matchPercentage) }}>
                {skill.matchPercentage}%
              </div>
            </div>
            
            <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  width: `${skill.matchPercentage}%`, 
                  backgroundColor: getMatchColor(skill.matchPercentage),
                  borderRadius: '3px'
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Strengths</h3>
        <ul style={{ paddingLeft: '20px' }}>
          {assessment.strengths.map((strength, index) => (
            <li key={index} style={{ marginBottom: '8px', fontSize: '14px' }}>
              {strength}
            </li>
          ))}
        </ul>
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Skill Gaps</h3>
        <ul style={{ paddingLeft: '20px' }}>
          {assessment.skillGaps.map((gap, index) => (
            <li key={index} style={{ marginBottom: '8px', fontSize: '14px' }}>
              {gap}
            </li>
          ))}
        </ul>
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Verification Assessment</h3>
        <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
          {assessment.verificationAssessment}
        </p>
      </div>
      
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Recommendations</h3>
        <ul style={{ paddingLeft: '20px' }}>
          {assessment.recommendations.map((recommendation, index) => (
            <li key={index} style={{ marginBottom: '8px', fontSize: '14px' }}>
              {recommendation}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Main Recruiter Dashboard Component
export default function RecruiterDashboard() {
  const { currentUser } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [jobRequirements, setJobRequirements] = useState(null);
  const [candidateMatches, setCandidateMatches] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [skillsAssessment, setSkillsAssessment] = useState(null);
  const [error, setError] = useState(null);
  const [requisitions, setRequisitions] = useState([]);
  const [requisitionsLoading, setRequisitionsLoading] = useState(false);

  const handleRequirementsSubmit = async (requirements) => {
    try {
      setLoading(true);
      setError(null);
      setJobRequirements(requirements);
      
      // Call API to find matching candidates
      const matches = await getJobCandidates(requirements);
      setCandidateMatches(matches);
    } catch (err) {
      console.error("Error finding candidates:", err);
      setError("Failed to find matching candidates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const forceTokenRefresh = async () => {
    if (!currentUser) return;
    
    try {
      setIsRefreshing(true);
      // Force token refresh
      await currentUser.getIdToken(true);
      window.location.reload();
    } catch (error) {
      console.error("Error refreshing token:", error);
      alert("Error refreshing claims: " + error.message);
    } finally {
      setIsRefreshing(false);
    }
  };
  

  const handleAssessCandidate = async (candidateId) => {
    try {
        setLoading(true);
        const assessment = await performSkillsAssessment(candidateId, jobRequirements);
        setSkillsAssessment(assessment);
      } catch (error) {
        console.error("Failed to assess candidate:", error);
        setError("Assessment failed. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      const fetchRequisitions = async () => {
        console.log('Current User in useEffect:', currentUser);
        
        if (!currentUser) {
          console.log('No current user, cannot fetch requisitions');
          return;
        }
        
        try {
          setRequisitionsLoading(true);
          const filters = { status: 'active' }; 
          console.log('Attempting to fetch requisitions');
          
          const data = await getRequisitions(filters);
          
          console.log('Received requisitions:', data);
          
          setRequisitions(data.slice(0, 3)); 
        } catch (err) {
          console.error('Error fetching requisitions:', err);
          // Optionally set an error state to show to the user
          setError(err.message || 'Failed to fetch requisitions');
        } finally {
          setRequisitionsLoading(false);
        }
      };
    
      fetchRequisitions();
    }, [currentUser]);


  return (
    <Layout>
      <Head>
        <title>Recruiter Dashboard - VFied</title>
      </Head>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1 style={styles.title}>Recruiter Dashboard</h1>
        <p style={{ ...styles.subtitle, marginBottom: '24px' }}>
          Use AI-powered skills assessment to find the perfect candidate match
        </p>
        
        {error && (
          <div style={{ 
            padding: '12px 16px', 
            backgroundColor: '#FFEBEE', 
            color: '#B71C1C', 
            borderRadius: '4px', 
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <JobRequirementsForm 
              onSubmit={handleRequirementsSubmit} 
              isLoading={loading}
            />
          </div>
          
          <div style={{ flex: '1 1 500px' }}>
            {loading ? (
              <div style={{ ...styles.card, textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '24px', marginBottom: '16px' }}>⟳</div>
                <p>Finding matching candidates...</p>
              </div>
            ) : candidateMatches ? (
              <div style={styles.card}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                  Matching Candidates
                </h2>
                
                {candidateMatches.candidates.length > 0 ? (
                  <>
                    {candidateMatches.candidates.map((candidate, index) => (
                      <CandidateCard
                        key={index}
                        candidate={candidate}
                        jobRequirements={jobRequirements}
                        onAssessClick={handleAssessCandidate}
                      />
                    ))}
                    
                    <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
                      Showing {candidateMatches.candidates.length} of {candidateMatches.totalCandidates} candidates
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>No matching candidates found. Try adjusting your requirements.</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ ...styles.card, textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', color: '#d1d5db' }}>👥</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Find Your Ideal Candidates</h3>
                <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto' }}>
                  Define your job requirements on the left to find matching candidates with verified credentials.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {assessmentLoading && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 1000 
          }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              textAlign: 'center',
              maxWidth: '300px'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '16px' }}>⟳</div>
              <p>AI is analyzing candidate skills...</p>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>This may take a few moments</p>
            </div>
          </div>
        )}
        
        {skillsAssessment && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 1000 
          }}>
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <SkillsAssessmentResult 
                assessment={skillsAssessment} 
                onClose={() => setSkillsAssessment(null)} 
              />
            </div>
          </div>
        )}

      </div>
      {requisitions.length > 0 && (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          padding: '16px', 
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '12px' 
          }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '600' 
            }}>
              Active Job Requisitions
            </h2>
            <Link href="/requisitions" style={{ 
              color: '#5a45f8', 
              textDecoration: 'none',
              fontSize: '14px' 
            }}>
              See All Requisitions
            </Link>
          </div>
          
          {requisitionsLoading ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#6b7280', 
              padding: '20px' 
            }}>
              Loading requisitions...
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px' 
            }}>
              {requisitions.map((req) => (
                <div 
                  key={req.id} 
                  style={{ 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '6px', 
                    padding: '12px', 
                    backgroundColor: '#f9fafb' 
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <Link 
                      href={`/requisitions/${req.id}`} 
                      style={{ 
                        fontWeight: '500', 
                        color: '#1f2937', 
                        textDecoration: 'none' 
                      }}
                    >
                      {req.title}
                    </Link>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#6b7280', 
                      textTransform: 'capitalize' 
                    }}>
                      {req.status}
                    </span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    color: '#6b7280', 
                    fontSize: '14px', 
                    marginTop: '8px' 
                  }}>
                    <span>{req.company}</span>
                    <span>{req.location}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div style={{
  margin: '10px 0',
  padding: '15px',
  backgroundColor: '#ffebee',
  borderRadius: '4px'
}}>
  <p>Role not working? Try refreshing your authentication token:</p>
  <button 
    onClick={forceTokenRefresh}
    disabled={isRefreshing}
    style={{
      padding: '8px 16px',
      backgroundColor: '#5a45f8',
      color: 'white', 
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    }}
  >
    {isRefreshing ? 'Refreshing...' : 'Refresh Auth Token'}
  </button>
</div>


    </Layout>
  );
}

