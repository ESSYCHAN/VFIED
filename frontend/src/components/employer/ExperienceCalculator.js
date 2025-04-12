// src/components/employer/ExperienceCalculator.js
import React, { useState } from 'react';
import { analyzeJobRequirements, submitAnalysisFeedback } from '../../services/aiJobAnalysisService';

const DEBUG_MODE = process.env.NODE_ENV !== 'production';

const ExperienceCalculator = ({ 
  jobTitle, 
  responsibilities, 
  requiredSkills, 
  seniorityLevel,
  department,
  industry,
  onAnalysisComplete 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [correctExperience, setCorrectExperience] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const calculateExperience = async () => {
    if (!jobTitle) {
      setError('Job title is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (DEBUG_MODE) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const debugResult = {
          yearsOfExperience: "3-5 years",
          isReasonable: true,
          unrealisticRequirements: [],
          suggestions: ["The requirements seem reasonable."],
          reasoning: "Based on the job title and responsibilities, 3-5 years of experience is appropriate.",
          healthScore: 85
        };
        
        setAnalysis(debugResult);
        
        if (onAnalysisComplete) {
          onAnalysisComplete(debugResult);
        }
        
        setLoading(false);
        return;
      }

      const result = await analyzeJobRequirements({
        jobTitle,
        responsibilities,
        requiredSkills,
        seniorityLevel,
        department,
        industry
      });

      setAnalysis(result);
      
      // Call the callback with the results if provided
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  

  // Handle user feedback on the analysis
  const handleFeedback = (isAccurate) => {
    setFeedback(isAccurate ? 'positive' : 'negative');
  };
  
  // Submit detailed feedback when the user disagrees with the analysis
  const submitFeedback = async () => {
    try {
      setSubmittingFeedback(true);
      
      await submitAnalysisFeedback({
        originalAnalysis: analysis,
        isAccurate: false,
        correctExperience,
        feedback: feedbackText
      });
      
      setFeedback('submitted');
    } catch (err) {
      setError(`Failed to submit feedback: ${err.message}`);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Render health score indicator
  const renderHealthScore = (score) => {
    let color = 'bg-green-500';
    let textColor = 'text-green-800';
    
    if (score < 50) {
      color = 'bg-red-500';
      textColor = 'text-red-800';
    } else if (score < 75) {
      color = 'bg-yellow-500';
      textColor = 'text-yellow-800';
    }
    
    return (
      <div className="flex flex-col">
        <div className="flex items-center mb-1">
          <span className="text-sm mr-2">Requirements Health Score:</span>
          <span className={`text-sm font-medium ${textColor}`}>{score}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className={`${color} h-2.5 rounded-full`} style={{ width: `${score}%` }}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4">
      {!analysis ? (
        <div>
          <button
            type="button"
            onClick={calculateExperience}
            disabled={loading || !jobTitle}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating...
              </>
            ) : 'Calculate Appropriate Experience'}
          </button>
          
          {error && (
            <div className="mt-2 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-medium text-lg mb-2">AI Requirements Analysis</h3>
          
          <div className="mb-2">
            <span className="font-medium">Recommended Experience:</span>{' '}
            <span className="text-indigo-600 font-medium">{analysis.yearsOfExperience}</span>
          </div>
          
          {analysis.healthScore && renderHealthScore(analysis.healthScore)}
          
          {!analysis.isReasonable && analysis.unrealisticRequirements && analysis.unrealisticRequirements.length > 0 && (
            <div className="mt-3">
              <span className="font-medium text-amber-700">Potential Issues:</span>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {analysis.unrealisticRequirements.map((issue, index) => (
                  <li key={index} className="text-sm text-amber-700">{issue}</li>
                ))}
              </ul>
            </div>
          )}
          
          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div className="mt-3">
              <span className="font-medium text-green-700">Suggestions:</span>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-green-700">{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-3">
            <span className="font-medium">Reasoning:</span>
            <p className="text-sm text-gray-700 mt-1">{analysis.reasoning}</p>
          </div>
          
          {/* Feedback mechanism */}
          {!feedback && (
            <div className="mt-4 border-t pt-4">
              <span className="text-sm font-medium">Was this analysis helpful?</span>
              <div className="mt-2 flex space-x-2">
                <button 
                  onClick={() => handleFeedback(true)}
                  className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200"
                >
                  Yes, this was accurate
                </button>
                <button 
                  onClick={() => handleFeedback(false)}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200"
                >
                  No, needs improvement
                </button>
              </div>
            </div>
          )}
          
          {feedback === 'positive' && (
            <div className="mt-4 text-sm text-green-700">
              Thank you for your feedback! We'll use it to improve our system.
            </div>
          )}
          
          {feedback === 'negative' && (
            <div className="mt-4 border-t pt-4">
              <span className="text-sm font-medium">Help us improve:</span>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">What would be the correct experience range?</label>
                <input 
                  type="text" 
                  value={correctExperience}
                  onChange={(e) => setCorrectExperience(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., 2-4 years"
                />
                
                <label className="block text-sm font-medium text-gray-700 mt-3">Additional feedback (optional)</label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="What could be improved about this analysis?"
                ></textarea>
                
                <button 
                  onClick={submitFeedback}
                  disabled={submittingFeedback || !correctExperience}
                  className="mt-3 px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </div>
          )}
          
          {feedback === 'submitted' && (
            <div className="mt-4 text-sm text-green-700">
              Thank you for your feedback! We'll use it to improve our analysis.
            </div>
          )}
          
          <button
            type="button"
            onClick={() => {
              setAnalysis(null);
              setFeedback(null);
              setCorrectExperience('');
              setFeedbackText('');
            }}
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-800"
          >
            Recalculate
          </button>
        </div>
      )}
    </div>
  );
};

export default ExperienceCalculator;