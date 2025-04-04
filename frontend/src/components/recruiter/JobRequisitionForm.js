// src/components/recruiter/JobRequisitionForm.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ErrorHandler from '../ErrorHandler';

const JobRequisitionForm = ({ requisition, onSubmit, onCancel }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    workType: 'full-time',
    remote: false,
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'USD',
    salaryPeriod: 'annual',
    benefits: [],
    requiredSkills: [],
    requiredEducation: [
      { degreeLevel: 'bachelor', field: '', required: true }
    ],
    requiredExperience: 0,
    verificationRequirements: {
      educationVerified: false,
      experienceVerified: false,
      skillsVerified: false,
      minimumVerificationStrength: 'none'
    },
    applicationProcess: {
      acceptDirect: true,
      redirectUrl: '',
      assessmentRequired: false,
      allowAiMatching: true,
      customQuestions: []
    },
    expiryDate: '',
    status: 'draft',
    visibility: 'public',
    keywords: [],
    industry: '',
    category: '',
    referenceId: ''
  });


  
  // Current skill being added
  const [currentSkill, setCurrentSkill] = useState({ skill: '', importance: 3, yearsRequired: 0 });
  const [currentBenefit, setCurrentBenefit] = useState('');
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  
  // Initialize the form if editing an existing requisition
  useEffect(() => {
    if (requisition) {
      setFormData({
        ...formData,
        ...requisition,
        // Convert dates if they exist
        expiryDate: requisition.expiryDate 
          ? new Date(requisition.expiryDate).toISOString().split('T')[0] 
          : ''
      });
    }
  }, [requisition]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkboxes
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
      return;
    }
    
    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
      return;
    }
    
    // Handle normal fields
    setFormData({ ...formData, [name]: value });
  };
  
  const handleAddSkill = () => {
    if (!currentSkill.skill.trim()) return;
    
    setFormData({
      ...formData,
      requiredSkills: [
        ...formData.requiredSkills,
        { ...currentSkill }
      ]
    });
    
    setCurrentSkill({ skill: '', importance: 3, yearsRequired: 0 });
  };
  
  const handleRemoveSkill = (index) => {
    const updatedSkills = [...formData.requiredSkills];
    updatedSkills.splice(index, 1);
    setFormData({ ...formData, requiredSkills: updatedSkills });
  };
  
  const handleAddBenefit = () => {
    if (!currentBenefit.trim()) return;
    
    setFormData({
      ...formData,
      benefits: [...formData.benefits, currentBenefit.trim()]
    });
    
    setCurrentBenefit('');
  };
  
  const handleRemoveBenefit = (index) => {
    const updatedBenefits = [...formData.benefits];
    updatedBenefits.splice(index, 1);
    setFormData({ ...formData, benefits: updatedBenefits });
  };
  
  const handleAddKeyword = () => {
    if (!currentKeyword.trim()) return;
    
    setFormData({
      ...formData,
      keywords: [...formData.keywords, currentKeyword.trim()]
    });
    
    setCurrentKeyword('');
  };
  
  const handleRemoveKeyword = (index) => {
    const updatedKeywords = [...formData.keywords];
    updatedKeywords.splice(index, 1);
    setFormData({ ...formData, keywords: updatedKeywords });
  };
  
  const handleAddQuestion = () => {
    if (!currentQuestion.trim()) return;
    
    setFormData({
      ...formData,
      applicationProcess: {
        ...formData.applicationProcess,
        customQuestions: [
          ...formData.applicationProcess.customQuestions,
          currentQuestion.trim()
        ]
      }
    });
    
    setCurrentQuestion('');
  };
  
  const handleRemoveQuestion = (index) => {
    const updatedQuestions = [...formData.applicationProcess.customQuestions];
    updatedQuestions.splice(index, 1);
    
    setFormData({
      ...formData,
      applicationProcess: {
        ...formData.applicationProcess,
        customQuestions: updatedQuestions
      }
    });
  };
  
  const handleAddEducation = () => {
    setFormData({
      ...formData,
      requiredEducation: [
        ...formData.requiredEducation,
        { degreeLevel: 'bachelor', field: '', required: true }
      ]
    });
  };
  
  const handleRemoveEducation = (index) => {
    const updatedEducation = [...formData.requiredEducation];
    updatedEducation.splice(index, 1);
    setFormData({ ...formData, requiredEducation: updatedEducation });
  };
  
  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...formData.requiredEducation];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: field === 'required' ? value === 'true' : value
    };
    
    setFormData({ ...formData, requiredEducation: updatedEducation });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Call parent onSubmit
      await onSubmit(formData);
    } catch (err) {
      console.error('Error submitting job requisition:', err);
      setError(err.message || 'Failed to submit job requisition');
    } finally {
      setLoading(false);
    }
  };
  
  // Styling
  const styles = {
    container: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      marginBottom: '24px'
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '24px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      fontSize: '14px'
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '16px'
    },
    select: {
      width: '100%',
      padding: '10px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '16px',
      backgroundColor: 'white'
    },
    textarea: {
      width: '100%',
      padding: '10px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '16px',
      minHeight: '120px'
    },
    button: {
      backgroundColor: '#5a45f8',
      color: 'white',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '6px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'inline-block'
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      color: '#5a45f8',
      border: '1px solid #5a45f8',
      padding: '10px 16px',
      borderRadius: '6px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'inline-block',
      marginLeft: '12px'
    },
    dangerButton: {
      backgroundColor: 'transparent',
      color: '#ef4444',
      border: '1px solid #ef4444',
      padding: '10px 16px',
      borderRadius: '6px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'inline-block',
      marginLeft: '12px'
    },
    buttonRow: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '24px'
    },
    tagContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '8px'
    },
    tag: {
      backgroundColor: '#f3f4f6',
      borderRadius: '16px',
      padding: '4px 12px',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center'
    },
    tagRemove: {
      marginLeft: '8px',
      cursor: 'pointer',
      color: '#6b7280',
      fontWeight: 'bold'
    },
    skillRow: {
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-end',
      marginBottom: '12px'
    },
    skillInputGroup: {
      flex: 3
    },
    importanceGroup: {
      flex: 1
    },
    yearsGroup: {
      flex: 1
    },
    addButton: {
      backgroundColor: '#5a45f8',
      color: 'white',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '6px',
      fontWeight: '500',
      cursor: 'pointer'
    },
    section: {
      padding: '16px',
      backgroundColor: '#f9fafb',
      borderRadius: '6px',
      marginBottom: '24px'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '16px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    },
    checkboxGroup: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '8px'
    },
    checkbox: {
      marginRight: '8px'
    },
    educationRow: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      marginBottom: '12px',
      padding: '12px',
      backgroundColor: '#f3f4f6',
      borderRadius: '6px'
    },
    helpText: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '4px'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        {requisition ? 'Edit Job Requisition' : 'Create New Job Requisition'}
      </h2>

      {error && <ErrorHandler error={error} onRetry={() => setError(null)} />}

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Basic Information</h3>
          
          <div style={styles.grid}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="title">Job Title*</label>
              <input
                type="text"
                id="title"
                name="title"
                style={styles.input}
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Senior Software Engineer"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="company">Company Name*</label>
              <input
                type="text"
                id="company"
                name="company"
                style={styles.input}
                value={formData.company}
                onChange={handleChange}
                required
                placeholder="e.g., Acme Inc."
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="description">Job Description*</label>
            <textarea
              id="description"
              name="description"
              style={styles.textarea}
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Provide a detailed description of the role, responsibilities, and requirements..."
            />
          </div>

          <div style={styles.grid}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="location">Location*</label>
              <input
                type="text"
                id="location"
                name="location"
                style={styles.input}
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g., New York, NY or Remote"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="workType">Work Type*</label>
              <select
                id="workType"
                name="workType"
                style={styles.select}
                value={formData.workType}
                onChange={handleChange}
                required
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>

          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="remote"
              name="remote"
              style={styles.checkbox}
              checked={formData.remote}
              onChange={handleChange}
            />
            <label htmlFor="remote">This is a remote position</label>
          </div>
        </div>

        {/* Compensation */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Compensation</h3>
          
          <div style={styles.grid}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="salaryMin">Minimum Salary</label>
              <input
                type="number"
                id="salaryMin"
                name="salaryMin"
                style={styles.input}
                value={formData.salaryMin}
                onChange={handleChange}
                placeholder="e.g., 50000"
                min="0"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="salaryMax">Maximum Salary</label>
              <input
                type="number"
                id="salaryMax"
                name="salaryMax"
                style={styles.input}
                value={formData.salaryMax}
                onChange={handleChange}
                placeholder="e.g., 80000"
                min={formData.salaryMin || 0}
              />
            </div>
          </div>

          <div style={styles.grid}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="salaryCurrency">Currency</label>
              <select
                id="salaryCurrency"
                name="salaryCurrency"
                style={styles.select}
                value={formData.salaryCurrency}
                onChange={handleChange}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
                <option value="INR">INR</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="salaryPeriod">Period</label>
              <select
                id="salaryPeriod"
                name="salaryPeriod"
                style={styles.select}
                value={formData.salaryPeriod}
                onChange={handleChange}
              >
                <option value="hourly">Hourly</option>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Benefits</label>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <input
                type="text"
                value={currentBenefit}
                onChange={(e) => setCurrentBenefit(e.target.value)}
                style={{ ...styles.input, borderRadius: '6px 0 0 6px' }}
                placeholder="e.g., Health Insurance"
              />
              <button
                type="button"
                onClick={handleAddBenefit}
                style={{
                  padding: '10px 16px',
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

            <div style={styles.tagContainer}>
              {formData.benefits.map((benefit, index) => (
                <div key={index} style={styles.tag}>
                  {benefit}
                  <span
                    style={styles.tagRemove}
                    onClick={() => handleRemoveBenefit(index)}
                  >
                    ×
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Required Skills */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Required Skills</h3>
          
          <div style={styles.skillRow}>
            <div style={styles.skillInputGroup}>
              <label style={styles.label} htmlFor="skillName">Skill</label>
              <input
                type="text"
                id="skillName"
                style={styles.input}
                value={currentSkill.skill}
                onChange={(e) => setCurrentSkill({ ...currentSkill, skill: e.target.value })}
                placeholder="e.g., JavaScript, Project Management"
              />
            </div>

            <div style={styles.importanceGroup}>
              <label style={styles.label} htmlFor="importance">Importance</label>
              <select
                id="importance"
                style={styles.select}
                value={currentSkill.importance}
                onChange={(e) => setCurrentSkill({ ...currentSkill, importance: parseInt(e.target.value) })}
              >
                <option value="1">Nice to have</option>
                <option value="2">Helpful</option>
                <option value="3">Important</option>
                <option value="4">Very Important</option>
                <option value="5">Essential</option>
              </select>
            </div>

            <div style={styles.yearsGroup}>
              <label style={styles.label} htmlFor="yearsRequired">Years</label>
              <input
                type="number"
                id="yearsRequired"
                style={styles.input}
                value={currentSkill.yearsRequired}
                onChange={(e) => setCurrentSkill({ ...currentSkill, yearsRequired: parseInt(e.target.value) })}
                min="0"
                placeholder="0"
              />
            </div>

            <button
              type="button"
              onClick={handleAddSkill}
              style={{ ...styles.addButton, alignSelf: 'flex-end' }}
            >
              Add Skill
            </button>
          </div>

          {formData.requiredSkills.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Added Skills</h4>
              
              {formData.requiredSkills.map((skill, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
                  borderRadius: '4px',
                  marginBottom: '4px',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 3 }}>{skill.skill}</div>
                  <div style={{ flex: 2 }}>
                    {['', 'Nice to have', 'Helpful', 'Important', 'Very Important', 'Essential'][skill.importance]}
                  </div>
                  <div style={{ flex: 1 }}>{skill.yearsRequired} years</div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(index)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Education Requirements */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Education Requirements</h3>
          
          {formData.requiredEducation.map((edu, index) => (
            <div key={index} style={styles.educationRow}>
              <div style={{ flex: 2 }}>
                <label style={{ ...styles.label, fontSize: '12px' }}>Degree Level</label>
                <select
                  value={edu.degreeLevel}
                  onChange={(e) => handleEducationChange(index, 'degreeLevel', e.target.value)}
                  style={styles.select}
                >
                  <option value="high_school">High School</option>
                  <option value="associate">Associate's</option>
                  <option value="bachelor">Bachelor's</option>
                  <option value="master">Master's</option>
                  <option value="doctorate">Doctorate</option>
                  <option value="certification">Certification</option>
                  <option value="none">No specific degree</option>
                </select>
              </div>
              
              <div style={{ flex: 2 }}>
                <label style={{ ...styles.label, fontSize: '12px' }}>Field of Study</label>
                <input
                  type="text"
                  value={edu.field}
                  onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                  style={styles.input}
                  placeholder="e.g., Computer Science"
                />
              </div>
              
              <div style={{ flex: 1 }}>
                <label style={{ ...styles.label, fontSize: '12px' }}>Required?</label>
                <select
                  value={edu.required.toString()}
                  onChange={(e) => handleEducationChange(index, 'required', e.target.value)}
                  style={styles.select}
                >
                  <option value="true">Required</option>
                  <option value="false">Preferred</option>
                </select>
              </div>
              
              <button
                type="button"
                onClick={() => handleRemoveEducation(index)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '16px',
                  alignSelf: 'flex-end',
                  marginBottom: '10px'
                }}
              >
                ×
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={handleAddEducation}
            style={{
              backgroundColor: 'transparent',
              color: '#5a45f8',
              border: '1px solid #5a45f8',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '8px',
              fontSize: '14px'
            }}
          >
            + Add Another Education Requirement
          </button>
          
          <div style={{ marginTop: '16px' }}>
            <label style={styles.label} htmlFor="requiredExperience">Years of Experience</label>
            <input
              type="number"
              id="requiredExperience"
              name="requiredExperience"
              style={styles.input}
              value={formData.requiredExperience}
              onChange={handleChange}
              min="0"
              placeholder="0"
            />
            <p style={styles.helpText}>Enter 0 for no specific experience requirement</p>
          </div>
        </div>

        {/* Verification Requirements */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Verification Requirements</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <p style={{ marginBottom: '12px', fontSize: '14px' }}>
              Specify which credentials must be verified for candidates applying to this position:
            </p>
            
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="educationVerified"
                name="verificationRequirements.educationVerified"
                style={styles.checkbox}
                checked={formData.verificationRequirements.educationVerified}
                onChange={handleChange}
              />
              <label htmlFor="educationVerified">Education must be verified</label>
            </div>
            
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="experienceVerified"
                name="verificationRequirements.experienceVerified"
                style={styles.checkbox}
                checked={formData.verificationRequirements.experienceVerified}
                onChange={handleChange}
              />
              <label htmlFor="experienceVerified">Work experience must be verified</label>
            </div>
            
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="skillsVerified"
                name="verificationRequirements.skillsVerified"
                style={styles.checkbox}
                checked={formData.verificationRequirements.skillsVerified}
                onChange={handleChange}
              />
              <label htmlFor="skillsVerified">Skills must be verified</label>
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="minimumVerificationStrength">Minimum Verification Strength</label>
            <select
              id="minimumVerificationStrength"
              name="verificationRequirements.minimumVerificationStrength"
              style={styles.select}
              value={formData.verificationRequirements.minimumVerificationStrength}
              onChange={handleChange}
            >
              <option value="none">No minimum (accept all)</option>
              <option value="low">Low (basic verification)</option>
              <option value="medium">Medium (standard verification)</option>
              <option value="high">High (rigorous verification)</option>
            </select>
            <p style={styles.helpText}>
              Higher verification strength means credentials have undergone more thorough verification
            </p>
          </div>
        </div>

        {/* Application Process */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Application Process</h3>
          
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="acceptDirect"
              name="applicationProcess.acceptDirect"
              style={styles.checkbox}
              checked={formData.applicationProcess.acceptDirect}
              onChange={handleChange}
            />
            <label htmlFor="acceptDirect">Accept direct applications through VFied</label>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="redirectUrl">External Application URL (optional)</label>
            <input
              type="url"
              id="redirectUrl"
              name="applicationProcess.redirectUrl"
              style={styles.input}
              value={formData.applicationProcess.redirectUrl}
              onChange={handleChange}
              placeholder="e.g., https://yourcompany.com/careers/job123"
            />
            <p style={styles.helpText}>
              If provided, candidates will be redirected to this URL to complete their application
            </p>
          </div>
          
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="assessmentRequired"
              name="applicationProcess.assessmentRequired"
              style={styles.checkbox}
              checked={formData.applicationProcess.assessmentRequired}
              onChange={handleChange}
            />
            <label htmlFor="assessmentRequired">Require skills assessment</label>
          </div>
          
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="allowAiMatching"
              name="applicationProcess.allowAiMatching"
              style={styles.checkbox}
              checked={formData.applicationProcess.allowAiMatching}
              onChange={handleChange}
            />
            <label htmlFor="allowAiMatching">Allow AI matching to recommend candidates</label>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Custom Application Questions</label>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <input
                type="text"
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                style={{ ...styles.input, borderRadius: '6px 0 0 6px' }}
                placeholder="e.g., What interests you about this role?"
              />
              <button
                type="button"
                onClick={handleAddQuestion}
                style={{
                  padding: '10px 16px',
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
            
            {formData.applicationProcess.customQuestions.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                {formData.applicationProcess.customQuestions.map((question, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    alignItems: 'center'
                  }}>
                    <div>{question}</div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(index)}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Posting Details */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Posting Details</h3>
          
          <div style={styles.grid}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="expiryDate">Expiry Date</label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                style={styles.input}
                value={formData.expiryDate}
                onChange={handleChange}
              />
              <p style={styles.helpText}>
                Leave blank for no expiration
              </p>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="visibility">Visibility</label>
              <select
                id="visibility"
                name="visibility"
                style={styles.select}
                value={formData.visibility}
                onChange={handleChange}
              >
                <option value="public">Public (visible to all)</option>
                <option value="private">Private (by invitation only)</option>
                <option value="network">Network (visible to your network)</option>
              </select>
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Keywords</label>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <input
                type="text"
                value={currentKeyword}
                onChange={(e) => setCurrentKeyword(e.target.value)}
                style={{ ...styles.input, borderRadius: '6px 0 0 6px' }}
                placeholder="e.g., remote, startup, fintech"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                style={{
                  padding: '10px 16px',
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
            
            <div style={styles.tagContainer}>
              {formData.keywords.map((keyword, index) => (
                <div key={index} style={styles.tag}>
                  {keyword}
                  <span
                    style={styles.tagRemove}
                    onClick={() => handleRemoveKeyword(index)}
                  >
                    ×
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div style={styles.grid}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="industry">Industry</label>
              <input
                type="text"
                id="industry"
                name="industry"
                style={styles.input}
                value={formData.industry}
                onChange={handleChange}
                placeholder="e.g., Technology, Healthcare, Finance"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                name="category"
                style={styles.input}
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Engineering, Marketing, Sales"
              />
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="referenceId">Reference ID (optional)</label>
            <input
              type="text"
              id="referenceId"
              name="referenceId"
              style={styles.input}
              value={formData.referenceId}
              onChange={handleChange}
              placeholder="Your internal reference ID for this position"
            />
          </div>
        </div>

        <div style={styles.buttonRow}>
          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Saving...' : (requisition ? 'Update Requisition' : 'Create Requisition')}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            style={styles.secondaryButton}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobRequisitionForm;