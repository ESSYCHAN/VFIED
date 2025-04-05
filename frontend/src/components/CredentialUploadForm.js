// src/components/CredentialUploadForm.js
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const CredentialUploadForm = ({ onClose, onUploadSuccess }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('education');
  const [issuer, setIssuer] = useState('');
  const [dateIssued, setDateIssued] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [analysisStep, setAnalysisStep] = useState('upload');
  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title) {
      setError('Please enter a title');
      return;
    }
    
    if (!file) {
      setError('Please upload a document');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onUploadSuccess) {
        onUploadSuccess({
          id: Date.now().toString(),
          title,
          type,
          issuer,
          dateIssued,
          description,
          skills,
          createdAt: new Date().toISOString(),
          status: 'draft',
          fileName: file.name
        });
      }
      
      onClose();
    } catch (err) {
      console.error("Error uploading credential:", err);
      setError("Failed to upload credential: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const analyzeWithAI = async () => {
    if (!file) {
      setError('Please upload a document first');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setAnalysisStep('processing');
      
      // Simulate document preprocessing step
      await new Promise(resolve => setTimeout(resolve, 800));
      setAnalysisStep('analyzing');
      
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate skill extraction step
      setAnalysisStep('extracting');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Simulate AI analysis result
      const analysisResult = {
        title: 'Bachelor of Computer Science',
        issuer: 'University of Technology',
        dateIssued: '2021-05-15',
        description: 'Undergraduate degree in Computer Science with focus on artificial intelligence and machine learning.',
        skills: ['Python', 'Machine Learning', 'Data Analysis', 'Algorithms']
      };
      
      setAnalysisStep('complete');
      
      // Pre-fill form with AI extracted data
      setTitle(analysisResult.title || '');
      setIssuer(analysisResult.issuer || '');
      setDateIssued(analysisResult.dateIssued || '');
      setDescription(analysisResult.description || '');
      setSkills(analysisResult.skills || []);
    } catch (err) {
      console.error("AI analysis failed:", err);
      setError("AI analysis failed: " + err.message);
      setAnalysisStep('upload');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Reset analysis state when a new file is selected
      setAnalysisStep('upload');
    }
  };

  const handleAddSkill = () => {
    if (currentSkill.trim()) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="bg-white shadow-lg rounded-lg mb-6 overflow-hidden">
      <div className="px-6 py-4 bg-indigo-600 text-white">
        <h2 className="text-xl font-semibold">Upload New Credential</h2>
      </div>
      
      <div className="p-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Credential Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="education">Education</option>
              <option value="work">Work Experience</option>
              <option value="certificate">Certificate</option>
              <option value="skill">Skill</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Document
            </label>
            <div
              className={`border-2 border-dashed ${file ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300'} rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50`}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              
              <div className="text-3xl mb-3">
                {file ? '📄' : '⬆️'}
              </div>
              
              <p className="mb-2 text-sm font-medium text-gray-900">
                {file ? file.name : 'Drag and drop your file here, or click to browse'}
              </p>
              
              <p className="text-xs text-gray-500">
                Accepts PDF, Images, or Word documents up to 10MB
              </p>
            </div>
            
            {file && analysisStep === 'upload' && (
              <button
                type="button"
                onClick={analyzeWithAI}
                className="mt-3 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Analyzing...' : 'Analyze with AI'}
              </button>
            )}
            
            {analysisStep === 'processing' && (
              <div className="mt-3 bg-blue-50 p-4 rounded-md text-center">
                <div className="text-3xl mb-2">📄</div>
                <p className="font-medium mb-1">Processing document</p>
                <p className="text-sm text-gray-600">Preparing your document for analysis...</p>
              </div>
            )}
            
            {analysisStep === 'analyzing' && (
              <div className="mt-3 bg-blue-50 p-4 rounded-md text-center">
                <div className="text-3xl mb-2">🔍</div>
                <p className="font-medium mb-1">AI is analyzing your document</p>
                <p className="text-sm text-gray-600">Extracting credential information...</p>
              </div>
            )}
            
            {analysisStep === 'extracting' && (
              <div className="mt-3 bg-blue-50 p-4 rounded-md text-center">
                <div className="text-3xl mb-2">⚡</div>
                <p className="font-medium mb-1">Identifying skills</p>
                <p className="text-sm text-gray-600">Mapping document content to our skills database...</p>
              </div>
            )}
          </div>
          
          {analysisStep === 'complete' && (
            <div className="mb-6 bg-blue-50 p-4 rounded-md">
              <div className="flex items-center text-blue-800 mb-3">
                <span className="text-lg mr-2">✨</span>
                <h3 className="font-semibold">AI Analysis Results</h3>
              </div>
              
              <p className="text-sm mb-3 text-gray-700">
                The AI has analyzed your document and extracted the following information:
              </p>
              
              <div className="bg-white p-3 rounded border border-gray-200 mb-3">
                <div className="grid gap-y-2">
                  <div>
                    <div className="text-xs text-gray-500">Title</div>
                    <div className="font-medium">{title}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500">Issuer</div>
                    <div className="font-medium">{issuer}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500">Skills</div>
                    <div className="flex flex-wrap gap-1">
                      {skills.map((skill, index) => (
                        <span key={index} className="bg-gray-200 text-gray-800 rounded-full text-xs px-2 py-1">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm italic text-blue-700">
                These details have been pre-filled in the form below. Please verify and edit if needed.
              </p>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Bachelor of Science, Software Engineer"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issuer
            </label>
            <input
              type="text"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., MIT, Google, Coursera"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Issued
            </label>
            <input
              type="date"
              value={dateIssued}
              onChange={(e) => setDateIssued(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
              placeholder="Add details about this credential..."
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills
            </label>
            <div className="flex mb-2">
              <input
                type="text"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Add relevant skills"
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
                className="p-2 border border-l-0 border-gray-300 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
            
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill, index) => (
                  <div 
                    key={index} 
                    className="flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 text-gray-600 hover:text-gray-900"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Uploading...' : 'Upload Credential'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CredentialUploadForm;