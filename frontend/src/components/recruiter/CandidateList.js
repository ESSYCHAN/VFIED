// src/components/recruiter/CandidateList.js
import React, { useState, useEffect } from 'react';
import { getMatchingCandidates } from '../../services/recruiter/requisitionService';
import { 
  candidateCard,
  skillTag,
  viewButton
} from '../../styles/sharedStyles';

export default function CandidateList({ requisitionId }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const matches = await getMatchingCandidates(requisitionId);
        setCandidates(matches);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, [requisitionId]);

  if (loading) return <div>Loading candidates...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      {candidates.map(candidate => (
        <div key={candidate.id} className={candidateCard}>
          <h3>{candidate.name}</h3>
          <p>Match Score: {candidate.matchScore}%</p>
          <div>
            {candidate.topSkills.map(skill => (
              <span key={skill} className={skillTag}>{skill}</span>
            ))}
          </div>
          <button className={viewButton}>View Profile</button>
        </div>
      ))}
    </>
  );
}