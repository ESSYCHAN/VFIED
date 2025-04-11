// frontend/src/components/employer/AIJobDescriptionGenerator.js
import React, { useState, useEffect } from 'react';
import { analyzeJobRequirements, generateJobDescription, saveJobTemplate } from '../../services/jobDescriptionService';

const AIJobDescriptionGenerator = ({ onSave, initialData = {} }) => {
  const [activeTab, setActiveTab] = useState('create');
  const [formData, setFormData] = useState({
    jobTitle: initialData.jobTitle || '',
    department: initialData.department || '',
    industry: initialData.industry || '',
    seniorityLevel: initialData.seniorityLevel || 'mid-level',
    responsibilities: initialData.responsibilities || '',
    requiredSkills: initialData.requiredSkills || '',
    location: initialData.location || 'Remote',
    employmentType: initialData.employmentType || 'Full-time'
  });
  
  const [analysisData, setAnalysisData] = useState(null);
  const [generatedJD, setGeneratedJD] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  
  // Industry options
  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 
    'Manufacturing', 'Retail', 'Marketing', 'Consulting',
    'Non-profit', 'Government', 'Hospitality', 'Other'
  ];
  
  // Seniority levels
  const seniorityLevels = [
    'entry-level', 'junior', 'mid-level', 'senior', 'lead', 'manager', 'director', 'executive'
  ];
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Reset analysis when key fields change
    if (['jobTitle', 'seniorityLevel', 'responsibilities', 'requiredSkills'].includes(name)) {
      setAnalysisData(null);
    }
  };
  
  // Analyze job requirements
  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      setError(null);
      
      const { jobTitle, responsibilities, requiredSkills, seniorityLevel, department, industry } = formData;
      
      // Validate required fields
      if (!jobTitle) {
        setError('Job title is required');
        return;
      }
      
      const skills = requiredSkills.split(',').map(skill => skill.trim()).filter(Boolean);
      
      // Call API to analyze job requirements
      const analysis = await analyzeJobRequirements({
        jobTitle,
        responsibilities,
        requiredSkills: skills,
        seniorityLevel,
        department,
        industry
      });
      
      setAnalysisData(analysis);
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };
  
  // Generate complete job description
  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { jobTitle, responsibilities, requiredSkills, seniorityLevel, department, industry, location, employmentType } = formData;
      
      // Validate required fields
      if (!jobTitle) {
        setError('Job title is required');
        return;
      }
      
      const skills = requiredSkills.split(',').map(skill => skill.trim()).filter(Boolean);
      
      // Company info (would come from user profile in a real implementation)
      const companyInfo = {
        name: 'VFied',
        mission: 'Revolutionizing credential verification and job matching',
        values: ['Transparency', 'Innovation', 'Integrity', 'Diversity'],
        benefits: [
          'Competitive salary',
          'Remote work options',
          'Professional development budget',
          'Health insurance'
        ]
      };
      
      // Call API to generate job description
      const jobDescription = await generateJobDescription({
        jobTitle,
        responsibilities,
        requiredSkills: skills,
        seniorityLevel,
        department,
        industry,
        location,
        employmentType,
        companyInfo
      });
      
      setGeneratedJD(jobDescription);
      
      // If no analysis yet, use the one from the job description
      if (!analysisData && jobDescription.analysis) {
        setAnalysisData(jobDescription.analysis);
      }
      
      // Switch to result tab
      setActiveTab('result');
    } catch (err) {
      setError(`Generation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle saving the job description
  const handleSaveJobDescription = () => {
    if (generatedJD && onSave) {
      // Format the data for saving to requisition
      const formattedData = {
        title: generatedJD.title,
        description: generatedJD.summary,
        responsibilities: generatedJD.responsibilities,
        requiredQualifications: generatedJD.requiredQualifications,
        preferredQualifications: generatedJD.preferredQualifications,
        skills: generatedJD.skillsRequired,
        experienceRequired: generatedJD.yearsOfExperience,
        educationRequired: generatedJD.educationRequirement,
        benefits: generatedJD.benefits,
        location: formData.location,
        employmentType: formData.employmentType,
        department: formData.department,
        industry: formData.industry
      };
      
      onSave(formattedData);
    }
  };
  
  // Render health score indicator
  const renderHealthScore = (score) => {
    let color = 'bg-green-500';
    if (score < 50) color = 'bg-red-500';
    else if (score < 75) color = 'bg-yellow-500';
    
    return (
      <div className="flex items-center">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
          <div className={`${color} h-2.5 rounded-full`} style={{ width: `${score}%` }}></div>
        </div>
        <span className="text-sm font-medium">{score}/100</span>
      </div>
    );
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button
            className={`mr-8 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'create'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('create')}
          >
            Create Job Description
          </button>
          <button
            className={`mr-8 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'result'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('result')}
            disabled={!generatedJD}
          >
            Results
          </button>
          <button
            className={`mr-8 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'templates'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('templates')}
          >
            Templates
          </button>
        </nav>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'create' && (
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Job Information</h2>
            <p className="text-sm text-gray-500">Enter information about the position to generate a complete job description with appropriate experience requirements.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title*</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="e.g., Software Engineer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="e.g., Engineering"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select Industry</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seniority Level</label>
              <select
                name="seniorityLevel"
                value={formData.seniorityLevel}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                {seniorityLevels.map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="e.g., Remote, New York, NY"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Key Responsibilities</label>
            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Describe the main responsibilities for this role..."
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills (comma separated)</label>
            <textarea
              name="requiredSkills"
              value={formData.requiredSkills}
              onChange={handleChange}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="e.g., JavaScript, React, Node.js"
            />
          </div>
          
          {analysisData && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Requirements Analysis</h3>
                {analysisData.healthScore && (
                  <div className="flex items-center">
                    <span className="text-sm mr-2">Health Score:</span>
                    {renderHealthScore(analysisData.healthScore)}
                  </div>
                )}
              </div>
              
              <div className="mb-3">
                <span className="font-medium">Suggested Experience:</span> <span className="text-indigo-600">{analysisData.yearsOfExperience}</span>
              </div>
              
              {!analysisData.isReasonable && analysisData.unrealisticRequirements && (
                <div className="mb-3">
                  <span className="font-medium text-amber-700">Potential Issues:</span>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    {analysisData.unrealisticRequirements.map((issue, index) => (
                      <li key={index} className="text-sm text-amber-700">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {analysisData.suggestions && (
                <div>
                  <span className="font-medium text-green-700">Suggestions:</span>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    {analysisData.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-green-700">{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-between">
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !formData.jobTitle}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              {analyzing ? 'Analyzing...' : 'Analyze Requirements'}
            </button>
            
            <button
              onClick={handleGenerate}
              disabled={loading || !formData.jobTitle}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Complete Job Description'}
            </button>
          </div>
        </div>
      )}
      
      {activeTab === 'result' && generatedJD && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">{generatedJD.title}</h2>
            {analysisData && analysisData.healthScore && (
              <div className="flex items-center mt-2">
                <span className="text-sm mr-2">Requirements Health Score:</span>
                {renderHealthScore(analysisData.healthScore)}
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Overview</h3>
            <p className="text-gray-700">{generatedJD.summary}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Responsibilities</h3>
            <ul className="list-disc pl-5 space-y-1">
              {generatedJD.responsibilities.map((item, index) => (
                <li key={index} className="text-gray-700">{item}</li>
              ))}
            </ul>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Required Qualifications</h3>
              <ul className="list-disc pl-5 space-y-1">
                {generatedJD.requiredQualifications.map((item, index) => (
                  <li key={index} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Preferred Qualifications</h3>
              <ul className="list-disc pl-5 space-y-1">
                {generatedJD.preferredQualifications.map((item, index) => (
                  <li key={index} className="text-gray-700">{item}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Skills Required</h3>
            <div className="flex flex-wrap gap-2">
              {generatedJD.skillsRequired.map((skill, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          {generatedJD.benefits && generatedJD.benefits.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Benefits</h3>
              <ul className="list-disc pl-5 space-y-1">
                {generatedJD.benefits.map((benefit, index) => (
                  <li key={index} className="text-gray-700">{benefit}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => setActiveTab('create')}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
            >
              Edit
            </button>
            
            <div className="space-x-3">
              <button
                onClick={() => {
                  // Functionality to save as a template
                  console.log('Save as template');
                }}
                className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
              >
                Save as Template
              </button>
              
              <button
                onClick={handleSaveJobDescription}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Use This Job Description
              </button>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'templates' && (
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Job Description Templates</h2>
            <p className="text-sm text-gray-500">
              Select a template to get started quickly. These templates have well-balanced experience requirements.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Template placeholders - would be populated from API in real implementation */}
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium">Software Engineer</h3>
              <p className="text-sm text-gray-500">Engineering Department</p>
              <p className="text-xs text-indigo-600 mt-2">Experience: 2-4 years</p>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium">Product Manager</h3>
              <p className="text-sm text-gray-500">Product Department</p>
              <p className="text-xs text-indigo-600 mt-2">Experience: 3-5 years</p>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium">UX Designer</h3>
              <p className="text-sm text-gray-500">Design Department</p>
              <p className="text-xs text-indigo-600 mt-2">Experience: 2-4 years</p>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium">Marketing Specialist</h3>
              <p className="text-sm text-gray-500">Marketing Department</p>
              <p className="text-xs text-indigo-600 mt-2">Experience: 1-3 years</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIJobDescriptionGenerator;