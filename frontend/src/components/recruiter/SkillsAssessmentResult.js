// src/components/recruiter/SkillsAssessmentResult.js
import React, { useState } from 'react';
import { generateAssessmentReport } from '../../services/recruitmentService';

const SkillsAssessmentResult = ({ assessment, onClose }) => {
  const [activeTabs, setActiveTabs] = useState('overview');
  const [exportLoading, setExportLoading] = useState(false);
  
  if (!assessment) return null;
  
  // Helper function to get color based on match percentage
  const getMatchColor = (percentage) => {
    if (percentage >= 90) return '#15803d'; // green
    if (percentage >= 75) return '#5a45f8'; // purple
    if (percentage >= 60) return '#c2410c'; // orange
    return '#6b7280'; // gray
  };
  
  // Handle export to PDF
  const handleExport = async () => {
    try {
      setExportLoading(true);
      
      if (!assessment.id) {
        alert('Assessment ID not found. Cannot export.');
        return;
      }
      
      const reportUrl = await generateAssessmentReport(assessment.id);
      
      // Open the report in a new tab
      window.open(reportUrl, '_blank');
    } catch (error) {
      console.error('Failed to export assessment:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Skills Assessment Results</h2>
        <div style={styles.actions}>
          <button
            onClick={handleExport}
            style={styles.exportButton}
            disabled={exportLoading}
          >
            {exportLoading ? 'Generating...' : 'Export PDF'}
          </button>
          <button
            onClick={onClose}
            style={styles.closeButton}
          >
            ×
          </button>
        </div>
      </div>
      
      <div style={styles.overallScore}>
        <div style={styles.scoreCircle}>
          <div 
            style={{
              ...styles.scoreValue,
              color: getMatchColor(assessment.overallMatchPercentage)
            }}
          >
            {assessment.overallMatchPercentage}%
          </div>
          <div style={styles.scoreLabel}>Match</div>
        </div>
      </div>
      
      <div style={styles.tabs}>
        <button 
          style={{
            ...styles.tab,
            ...(activeTabs === 'overview' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTabs('overview')}
        >
          Overview
        </button>
        <button 
          style={{
            ...styles.tab,
            ...(activeTabs === 'skills' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTabs('skills')}
        >
          Skills Detail
        </button>
        <button 
          style={{
            ...styles.tab,
            ...(activeTabs === 'interview' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTabs('interview')}
        >
          Interview Questions
        </button>
      </div>
      
      <div style={styles.tabContent}>
        {activeTabs === 'overview' && (
          <div>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Key Strengths</h3>
              <ul style={styles.list}>
                {assessment.strengths.map((strength, index) => (
                  <li key={index} style={styles.listItem}>
                    <div style={{ ...styles.indicator, backgroundColor: '#15803d' }}></div>
                    <div>{strength}</div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Skill Gaps</h3>
              <ul style={styles.list}>
                {assessment.skillGaps.map((gap, index) => (
                  <li key={index} style={styles.listItem}>
                    <div style={{ ...styles.indicator, backgroundColor: '#ef4444' }}></div>
                    <div>{gap}</div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Verification Assessment</h3>
              <p style={styles.paragraph}>{assessment.verificationAssessment}</p>
            </div>
            
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Recommendations</h3>
              <ul style={styles.list}>
                {assessment.recommendations.map((recommendation, index) => (
                  <li key={index} style={styles.listItem}>
                    <div style={{ ...styles.indicator, backgroundColor: '#5a45f8' }}></div>
                    <div>{recommendation}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {activeTabs === 'skills' && (
          <div>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Skill Match Details</h3>
              
              {assessment.skillMatchRatings.map((skill, index) => (
                <div key={index} style={styles.skillBar}>
                  <div style={styles.skillHeader}>
                    <div style={styles.skillName}>{skill.skill}</div>
                    <div 
                      style={{
                        ...styles.skillPercentage,
                        color: getMatchColor(skill.matchPercentage)
                      }}
                    >
                      {skill.matchPercentage}%
                    </div>
                  </div>
                  
                  <div style={styles.progressBar}>
                    <div 
                      style={{
                        ...styles.progressFill,
                        width: `${skill.matchPercentage}%`,
                        backgroundColor: getMatchColor(skill.matchPercentage)
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTabs === 'interview' && (
          <div>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Suggested Interview Questions</h3>
              
              {assessment.suggestedInterviewQuestions && assessment.suggestedInterviewQuestions.map((question, index) => (
                <div key={index} style={styles.questionCard}>
                  <div style={styles.questionNumber}>{index + 1}</div>
                  <div style={styles.questionText}>{question}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    padding: '24px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  exportButton: {
    padding: '8px 16px',
    backgroundColor: '#5a45f8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallScore: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  scoreCircle: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  scoreLabel: {
    fontSize: '14px',
    color: '#6b7280',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '24px',
  },
  tab: {
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500',
    position: 'relative',
  },
  activeTab: {
    color: '#5a45f8',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: '-1px',
      left: 0,
      right: 0,
      height: '2px',
      backgroundColor: '#5a45f8',
    },
  },
  tabContent: {
    marginBottom: '24px',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  indicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginRight: '12px',
    marginTop: '6px',
    flexShrink: 0,
  },
  paragraph: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#374151',
  },
  skillBar: {
    marginBottom: '16px',
  },
  skillHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  skillName: {
    fontSize: '14px',
    fontWeight: '500',
  },
  skillPercentage: {
    fontSize: '14px',
    fontWeight: '600',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
  },
  questionCard: {
    display: 'flex',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  questionNumber: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#5a45f8',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    marginRight: '12px',
    flexShrink: 0,
  },
  questionText: {
    fontSize: '14px',
    lineHeight: '1.5',
  },
};

export default SkillsAssessmentResult;