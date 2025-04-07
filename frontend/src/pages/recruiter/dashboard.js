// src/pages/recruiter/dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import Head from 'next/head';
import { getJobCandidates, performSkillsAssessment } from '../../services/recruiter/requisitionService';
import { getRequisitions } from '../../services/recruiter/requisitionService';
import Link from 'next/link';

// Your existing Job Requirements Form component and other components remain unchanged

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

  // Handle requirements submission
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

  // Force token refresh
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

  // Handle candidate assessment
  const handleAssessCandidate = async (candidateId) => {
    try {
      setAssessmentLoading(true);
      const assessment = await performSkillsAssessment(candidateId, jobRequirements);
      setSkillsAssessment(assessment);
    } catch (error) {
      console.error("Failed to assess candidate:", error);
      setError("Assessment failed. Please try again.");
    } finally {
      setAssessmentLoading(false);
    }
  };

  // Fetch requisitions
  useEffect(() => {
    const fetchRequisitions = async () => {
      if (!currentUser) return;
      
      try {
        setRequisitionsLoading(true);
        const filters = { status: 'active' }; 
        const data = await getRequisitions(filters);
        setRequisitions(data.slice(0, 3)); // Get top 3 active requisitions
      } catch (err) {
        console.error('Error fetching requisitions:', err);
        setError(err.message || 'Failed to fetch requisitions');
      } finally {
        setRequisitionsLoading(false);
      }
    };
  
    fetchRequisitions();
  }, [currentUser]);

  return (
    <ProtectedRoute allowedRoles={['recruiter']}>
      <Layout>
        <Head>
          <title>Recruiter Dashboard - VFied</title>
        </Head>
        
        <div className="max-w-7xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Recruiter Dashboard</h1>
          <p className="text-gray-600 mb-6">
            Use AI-powered skills assessment to find the perfect candidate match
          </p>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              {error}
            </div>
          )}
          
          {/* Your existing dashboard content remains unchanged */}
          
          {/* Authentication Troubleshooting Section */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded p-4">
            <h3 className="font-medium text-yellow-800 mb-2">Authentication Troubleshooting</h3>
            <p className="text-sm text-yellow-700 mb-3">
              If you're having issues with recruiter permissions, try refreshing your authentication token:
            </p>
            <button 
              onClick={forceTokenRefresh}
              disabled={isRefreshing}
              className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Auth Token'}
            </button>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}