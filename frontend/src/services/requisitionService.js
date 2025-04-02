// src/services/requisitionService.js
import { auth } from '../lib/firebase';

/**
 * Create a new job requisition
 * @param {Object} requisitionData - The job requisition data
 * @returns {Promise<Object>} The created requisition
 */
export const createRequisition = async (requisitionData) => {
  try {
    const token = await auth.currentUser.getIdToken();
    
    const response = await fetch('/api/requisitions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requisitionData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create job requisition');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error activating job requisition ${requisitionId}:`, error);
    throw error;
  }
};

/**
 * Delete a job requisition
 * @param {string} requisitionId - The requisition ID to delete
 * @returns {Promise<Object>} Response confirming deletion
 */
export const deleteRequisition = async (requisitionId) => {
  try {
    const token = await auth.currentUser.getIdToken();
    
    const response = await fetch(`/api/requisitions/${requisitionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete job requisition');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error deleting job requisition ${requisitionId}:`, error);
    throw error;
  }
};

/**
 * Search for job requisitions
 * @param {Object} searchParams - Search parameters
 * @returns {Promise<Object>} Object containing requisitions array and pagination info
 */
export const searchRequisitions = async (searchParams = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add search parameters to query string
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const response = await fetch(`/api/requisitions/search?${queryParams.toString()}`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to search job requisitions');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching job requisitions:', error);
    throw error;
  }
};

/**
 * Get matching candidates for a job requisition
 * @param {string} requisitionId - The requisition ID
 * @param {Object} options - Optional parameters
 * @returns {Promise<Object>} Object containing matching candidates
 */
export const getMatchingCandidates = async (requisitionId, options = {}) => {
  try {
    const token = await auth.currentUser.getIdToken();
    
    const queryParams = new URLSearchParams();
    if (options.limit) queryParams.append('limit', options.limit);
    if (options.startAfter) queryParams.append('startAfter', options.startAfter);
    
    const response = await fetch(`/api/requisitions/${requisitionId}/matches?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get matching candidates');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error getting matches for requisition ${requisitionId}:`, error);
    throw error;
  }
}; 

/**
 * Get all requisitions for the current user
 * @param {Object} options - Optional parameters (status, limit)
 * @returns {Promise<Object>} Object containing requisitions array and pagination info
 */
export const getRequisitions = async (options = {}) => {
  try {
    const token = await auth.currentUser.getIdToken();
    
    const queryParams = new URLSearchParams();
    if (options.status) queryParams.append('status', options.status);
    if (options.limit) queryParams.append('limit', options.limit);
    if (options.startAfter) queryParams.append('startAfter', options.startAfter);
    
    const response = await fetch(`/api/requisitions?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch job requisitions');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching job requisitions:', error);
    throw error;
  }
};

/**
 * Get a specific job requisition by ID
 * @param {string} requisitionId - The requisition ID to fetch
 * @returns {Promise<Object>} The requisition object
 */
export const getRequisitionById = async (requisitionId) => {
  try {
    const token = await auth.currentUser.getIdToken();
    
    const response = await fetch(`/api/requisitions/${requisitionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch job requisition');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching job requisition ${requisitionId}:`, error);
    throw error;
  }
};

/**
 * Update a job requisition
 * @param {string} requisitionId - The requisition ID to update
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object>} The updated requisition
 */
export const updateRequisition = async (requisitionId, updateData) => {
  try {
    const token = await auth.currentUser.getIdToken();
    
    const response = await fetch(`/api/requisitions/${requisitionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update job requisition');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating job requisition ${requisitionId}:`, error);
    throw error;
  }
};

/**
 * Activate a job requisition (change status to active)
 * @param {string} requisitionId - The requisition ID to activate
 * @returns {Promise<Object>} Response with status information
 */
export const activateRequisition = async (requisitionId) => {
  try {
    const token = await auth.currentUser.getIdToken();
    
    const response = await fetch(`/api/requisitions/${requisitionId}/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to activate job requisition');
    }
    
    return await response.json();
  } catch(error) {
    console.error(`Error activating job requisition ${requisitionId}:`, error);
    throw error;
  }
};
// Add ONLY IF these don't exist in your current file
export const fetchRequisitionCandidates = async (requisitionId, limit = 10) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(
        `/api/requisitions/${requisitionId}/candidates?limit=${limit}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch candidates');
      return await response.json();
    } catch (err) {
      console.error(`[VFied] Candidate fetch error:`, err);
      throw err;
    }
  };
  
  export const updateRequisitionStatus = async (requisitionId, status) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(
        `/api/requisitions/${requisitionId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }
      );
      if (!response.ok) throw new Error('Status update failed');
      return await response.json();
    } catch (err) {
      console.error(`[VFied] Status update error:`, err);
      throw err;
    }
  };