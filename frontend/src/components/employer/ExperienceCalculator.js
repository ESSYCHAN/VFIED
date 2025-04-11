// frontend/src/components/employer/ExperienceCalculator.js
import React, { useState } from 'react';
import { analyzeJobDescription } from '../../services/aiService';

const ExperienceCalculator = ({ jobTitle, responsibilities, requiredSkills, seniorityLevel, onAnalysisComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const calculateExperience = async () => {
    if (!jobTitle) {
      setError('Job title is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await analyzeJobDescription({
        jobTitle,
        responsibilities,
        requiredSkills,
        seniorityLevel
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

  // Render health score indicator
  const renderHealthScore = (score) => {
    let color = 'bg-green-500';
    if (score < 50) color = 'bg-red-500';
    else if (score < 75) color = 'bg-yellow-500';
    
    return (
      <div className="flex items-center mt-2">
        <span className="text-sm mr-2">Health Score:</span>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
          <div className={`${color} h-2.5 rounded-full`} style={{ width: `${score}%` }}></div>
        </div>
        <span className="text-sm font-medium">{score}/100</span>
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
            {loading ? 'Calculating...' : 'Calculate Appropriate Experience'}
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
          
          <button
            type="button"
            onClick={() => setAnalysis(null)}
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