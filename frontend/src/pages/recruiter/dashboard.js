// src/pages/recruiter/dashboard.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import Head from 'next/head';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function RecruiterDashboard() {
  const { currentUser, userRole } = useAuth();
  const [requisitions, setRequisitions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [error, setError] = useState(null);
  const [jobRequirements, setJobRequirements] = useState({
    title: '',
    skills: [],
    description: ''
  });
  const [skillsAssessment, setSkillsAssessment] = useState(null);
  
  // Redirect if not a recruiter
  useEffect(() => {
    if (!loading && userRole !== 'recruiter') {
      window.location.href = '/dashboard';
    }
  }, [userRole, loading]);

  // Fetch recruiter's requisitions
  useEffect(() => {
    if (!currentUser) return;

    const fetchRequisitions = async () => {
      try {
        setLoading(true);
        
        // Query requisitions where recruiter is assigned
        const q = query(
          collection(db, 'requisitions'),
          where('recruiterId', '==', currentUser.uid),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        
        const querySnapshot = await getDocs(q);
        const requisitionList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setRequisitions(requisitionList);
        
        // If we have requisitions, set the first one as selected
        if (requisitionList.length > 0) {
          setSelectedRequisition(requisitionList[0]);
          setJobRequirements({
            title: requisitionList[0].title || '',
            skills: requisitionList[0].requiredSkills || [],
            description: requisitionList[0].description || ''
          });
        }
      } catch (error) {
        console.error("Error fetching requisitions:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequisitions();
  }, [currentUser]);

  // Fetch candidates when a requisition is selected
  useEffect(() => {
    if (!selectedRequisition) return;
    
    const fetchCandidates = async () => {
      try {
        setAssessmentLoading(true);
        
        // In a real implementation, you would query candidates based on the requisition
        // For now, we'll use mock data
        const mockCandidates = [
          {
            id: 'candidate1',
            name: 'Jane Smith',
            matchScore: 92,
            skills: ['JavaScript', 'React', 'Node.js'],
            education: 'BS Computer Science',
            experience: '5 years',
            verified: true
          },
          {
            id: 'candidate2',
            name: 'John Doe',
            matchScore: 85,
            skills: ['Python', 'Django', 'SQL'],
            education: 'MS Data Science',
            experience: '3 years',
            verified: true
          },
          {
            id: 'candidate3',
            name: 'Emily Johnson',
            matchScore: 78,
            skills: ['Java', 'Spring', 'Hibernate'],
            education: 'BS Information Systems',
            experience: '4 years',
            verified: false
          }
        ];
        
        setCandidates(mockCandidates);
      } catch (error) {
        console.error("Error fetching candidates:", error);
        setError("Failed to retrieve matching candidates");
      } finally {
        setAssessmentLoading(false);
      }
    };

    fetchCandidates();
  }, [selectedRequisition]);

  // Handle candidate selection
  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate);
    
    // In a real implementation, you would fetch the full assessment
    // For now, we'll use mock data
    setSkillsAssessment({
      overallMatchPercentage: candidate.matchScore,
      skillMatchRatings: candidate.skills.map(skill => ({
        skill,
        matchPercentage: Math.floor(Math.random() * 20) + 80 // 80-99%
      })),
      strengths: [
        `Strong background in ${candidate.skills[0]}`,
        "Verified education credentials",
        `${candidate.experience} of relevant experience`
      ],
      skillGaps: [
        `Limited experience with ${selectedRequisition.requiredSkills?.[0] || 'required skills'}`,
        "Needs more certifications",
        "Consider additional technical assessment"
      ],
      verificationAssessment: "Candidate's credentials have been verified through our platform.",
      recommendations: [
        "Schedule technical interview",
        "Request code samples",
        "Consider for immediate interview"
      ],
      suggestedInterviewQuestions: [
        `Describe your experience with ${candidate.skills[0]}.`,
        `How have you used ${candidate.skills[1] || 'your skills'} in your previous projects?`,
        "Tell me about a challenging problem you solved recently.",
        `What interests you about the ${selectedRequisition.title} position?`,
        "How do you stay updated with industry trends?"
      ]
    });
  };

  // Handle requisition selection
  const handleRequisitionSelect = (requisition) => {
    setSelectedRequisition(requisition);
    setSelectedCandidate(null);
    setSkillsAssessment(null);
    setJobRequirements({
      title: requisition.title || '',
      skills: requisition.requiredSkills || [],
      description: requisition.description || ''
    });
  };

  return (
    <DashboardLayout title="Recruiter Dashboard">
      <Head>
        <title>Recruiter Dashboard - VFied</title>
      </Head>
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Recruiter Dashboard</h1>
          <p className="text-gray-600">
            Use AI-powered tools to find and evaluate candidates with verified credentials
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="ml-2 text-red-700 hover:text-red-900"
            >
              Dismiss
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Requisitions Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Job Requisitions</h2>
              </div>
              <div className="p-4 border-b border-gray-200">
                <Link 
                  href="/requisitions/new"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  + New Requisition
                </Link>
              </div>
              
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading requisitions...</p>
                </div>
              ) : requisitions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No requisitions found.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {requisitions.map(req => (
                    <li 
                      key={req.id}
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                        selectedRequisition?.id === req.id ? 'bg-indigo-50' : ''
                      }`}
                      onClick={() => handleRequisitionSelect(req)}
                    >
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">{req.title}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          req.status === 'active' ? 'bg-green-100 text-green-800' :
                          req.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {req.status || 'Draft'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 truncate">
                        {req.requiredSkills?.slice(0, 3).join(', ')}
                        {req.requiredSkills?.length > 3 ? '...' : ''}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {/* Candidates Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Matching Candidates</h2>
              </div>
              
              {!selectedRequisition ? (
                <div className="p-6 text-center text-gray-500">
                  Select a requisition to view matching candidates
                </div>
              ) : assessmentLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Finding matches...</p>
                </div>
              ) : candidates.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No matching candidates found
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {candidates.map(candidate => (
                    <li 
                      key={candidate.id}
                      className={`px-4 py-4 cursor-pointer hover:bg-gray-50 ${
                        selectedCandidate?.id === candidate.id ? 'bg-indigo-50' : ''
                      }`}
                      onClick={() => handleCandidateSelect(candidate)}
                    >
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-700 font-medium">
                              {candidate.name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                            <p className="text-xs text-gray-500">{candidate.education}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {candidate.matchScore}% Match
                          </span>
                          {candidate.verified && (
                            <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {candidate.skills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {/* Assessment Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">AI Skills Assessment</h2>
              </div>
              
              {!selectedCandidate ? (
                <div className="p-6 text-center text-gray-500">
                  Select a candidate to view AI skills assessment
                </div>
              ) : !skillsAssessment ? (
                <div className="p-6 text-center">
                  <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Generating assessment...</p>
                </div>
              ) : (
                <div className="p-6">
                  {/* Match Score */}
                  <div className="flex justify-center mb-6">
                    <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center relative">
                      <svg viewBox="0 0 36 36" className="absolute w-full h-full">
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={skillsAssessment.overallMatchPercentage >= 90 ? '#10B981' : 
                                 skillsAssessment.overallMatchPercentage >= 75 ? '#6366F1' : 
                                 skillsAssessment.overallMatchPercentage >= 60 ? '#F59E0B' : '#6B7280'}
                          strokeWidth="3"
                          strokeDasharray={`${skillsAssessment.overallMatchPercentage} 100`}
                        />
                      </svg>
                      <div className="text-center">
                        <div className="text-3xl font-bold" style={{
                          color: skillsAssessment.overallMatchPercentage >= 90 ? '#10B981' : 
                                 skillsAssessment.overallMatchPercentage >= 75 ? '#6366F1' : 
                                 skillsAssessment.overallMatchPercentage >= 60 ? '#F59E0B' : '#6B7280'
                        }}>
                          {skillsAssessment.overallMatchPercentage}%
                        </div>
                        <div className="text-sm text-gray-500">Match</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Assessment Tabs */}
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      <button className="border-indigo-500 text-indigo-600 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm">
                        Overview
                      </button>
                      <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm">
                        Skill Details
                      </button>
                      <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm">
                        Interview Questions
                      </button>
                    </nav>
                  </div>
                  
                  {/* Overview Content */}
                  <div className="pt-6">
                    {/* Strengths */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Key Strengths</h3>
                      <ul className="space-y-2">
                        {skillsAssessment.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start">
                            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-2">
                              <span className="text-green-600 text-xs">✓</span>
                            </div>
                            <p className="text-sm text-gray-700">{strength}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Skill Gaps */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Skill Gaps</h3>
                      <ul className="space-y-2">
                        {skillsAssessment.skillGaps.map((gap, index) => (
                          <li key={index} className="flex items-start">
                            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-red-100 flex items-center justify-center mr-2">
                              <span className="text-red-600 text-xs">!</span>
                            </div>
                            <p className="text-sm text-gray-700">{gap}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Recommendations */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Recommendations</h3>
                      <ul className="space-y-2">
                        {skillsAssessment.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start">
                            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                              <span className="text-indigo-600 text-xs">→</span>
                            </div>
                            <p className="text-sm text-gray-700">{recommendation}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Actions */}
                    <div className="mt-8 flex justify-end space-x-3">
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        Save Assessment
                      </button>
                      <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                        Contact Candidate
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}