// frontend/src/services/recruiter/requisitionService.js
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Fetch all requisitions with optional filters
 * @param {Object} filters - Optional filters to apply
 * @returns {Promise<Array>} - Array of requisition objects
 */
export const getRequisitions = async (filters = {}) => {
  try {
    let q = collection(db, 'requisitions');
    
    // Apply filters if specified
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    if (filters.companyId) {
      q = query(q, where('companyId', '==', filters.companyId));
    }
    
    // Order by creation date (newest first)
    q = query(q, orderBy('createdAt', 'desc'));
    
    // Apply limit if specified
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }
    
    const snapshot = await getDocs(q);
    const requisitions = [];
    
    snapshot.forEach((doc) => {
      requisitions.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      });
    });
    
    return requisitions;
  } catch (error) {
    console.error('Error fetching requisitions:', error);
    throw error;
  }
};

/**
 * Get a single requisition by ID
 * @param {string} id - Requisition ID
 * @returns {Promise<Object>} - Requisition object
 */
export const getRequisition = async (id) => {
  try {
    const docRef = doc(db, 'requisitions', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Requisition not found');
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  } catch (error) {
    console.error(`Error fetching requisition ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new requisition
 * @param {Object} requisitionData - Requisition data
 * @returns {Promise<Object>} - Created requisition object
 */
export const createRequisition = async (requisitionData) => {
  try {
    const docRef = await addDoc(collection(db, 'requisitions'), {
      ...requisitionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      id: docRef.id,
      ...requisitionData
    };
  } catch (error) {
    console.error('Error creating requisition:', error);
    throw error;
  }
};

/**
 * Update an existing requisition
 * @param {string} id - Requisition ID
 * @param {Object} requisitionData - Updated requisition data
 * @returns {Promise<Object>} - Updated requisition object
 */
export const updateRequisition = async (id, requisitionData) => {
  try {
    const docRef = doc(db, 'requisitions', id);
    
    await updateDoc(docRef, {
      ...requisitionData,
      updatedAt: serverTimestamp()
    });
    
    return {
      id,
      ...requisitionData,
      updatedAt: new Date()
    };
  } catch (error) {
    console.error(`Error updating requisition ${id}:`, error);
    throw error;
  }
};

/**
 * Mock implementation of getJobCandidates - Replace with actual implementation
 * @param {Object} requirements - Job requirements to match against
 * @returns {Promise<Array>} - Array of matching candidates
 */
export const getJobCandidates = async (requirements) => {
  // This is a mock implementation
  console.log('Using mock getJobCandidates with requirements:', requirements);
  
  // Return mock data
  return [
    {
      id: 'candidate1',
      name: 'Jane Smith',
      matchScore: 92,
      skills: ['JavaScript', 'React', 'Node.js'],
      credentials: [
        { title: 'BS in Computer Science', issuer: 'MIT', verified: true }
      ]
    },
    {
      id: 'candidate2',
      name: 'John Doe',
      matchScore: 85,
      skills: ['Python', 'Django', 'SQL'],
      credentials: [
        { title: 'MS in Data Science', issuer: 'Stanford', verified: true }
      ]
    }
  ];
};

/**
 * Mock implementation of performSkillsAssessment - Replace with actual implementation
 * @param {string} candidateId - ID of the candidate to assess
 * @param {Object} jobRequirements - Job requirements to assess against
 * @returns {Promise<Object>} - Assessment results
 */
export const performSkillsAssessment = async (candidateId, jobRequirements) => {
  // This is a mock implementation
  console.log('Using mock performSkillsAssessment for candidate:', candidateId);
  
  // Return mock data
  return {
    candidateId,
    overallScore: 88,
    skillScores: {
      technical: 90,
      communication: 85,
      problemSolving: 88
    },
    analysis: 'This candidate has a strong technical background...',
    recommendation: 'Recommended for interview'
  };
};