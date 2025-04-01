// src/services/credentialService.js
// This service handles all API calls related to credential management

const API_URL = process.env.REACT_APP_API_URL || 'https://api.vfied.com';

/**
 * Fetch all credentials for the current user
 * @returns {Promise} Promise resolving to an array of credential objects
 */
export const fetchUserCredentials = async () => {
  try {
    const token = localStorage.getItem('vfied_token');
    
    const response = await fetch(`${API_URL}/credentials`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching credentials: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch credentials:', error);
    throw error;
  }
};

/**
 * Upload a new credential
 * @param {Object} credentialData - The credential data including title, type, and file
 * @returns {Promise} Promise resolving to the created credential object
 */
export const uploadCredential = async (credentialData) => {
  try {
    const token = localStorage.getItem('vfied_token');
    const formData = new FormData();
    
    // Add text fields
    formData.append('title', credentialData.title);
    formData.append('type', credentialData.type);
    formData.append('description', credentialData.description || '');
    
    // Add file
    formData.append('file', credentialData.file);
    
    const response = await fetch(`${API_URL}/credentials`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type here, it will be set automatically with the boundary
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Error uploading credential: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to upload credential:', error);
    throw error;
  }
};

/**
 * Get a specific credential by ID
 * @param {string} credentialId - The ID of the credential to fetch
 * @returns {Promise} Promise resolving to the credential object
 */
export const getCredentialById = async (credentialId) => {
  try {
    const token = localStorage.getItem('vfied_token');
    
    const response = await fetch(`${API_URL}/credentials/${credentialId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching credential: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch credential ${credentialId}:`, error);
    throw error;
  }
};

/**
 * Update a credential's information
 * @param {string} credentialId - The ID of the credential to update
 * @param {Object} updateData - The data to update (title, description, etc)
 * @returns {Promise} Promise resolving to the updated credential object
 */
export const updateCredential = async (credentialId, updateData) => {
  try {
    const token = localStorage.getItem('vfied_token');
    
    const response = await fetch(`${API_URL}/credentials/${credentialId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      throw new Error(`Error updating credential: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to update credential ${credentialId}:`, error);
    throw error;
  }
};

/**
 * Delete a credential
 * @param {string} credentialId - The ID of the credential to delete
 * @returns {Promise} Promise resolving to the response data
 */
export const deleteCredential = async (credentialId) => {
  try {
    const token = localStorage.getItem('vfied_token');
    
    const response = await fetch(`${API_URL}/credentials/${credentialId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting credential: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to delete credential ${credentialId}:`, error);
    throw error;
  }
};

/**
 * Request verification for a credential
 * @param {string} credentialId - The ID of the credential to verify
 * @returns {Promise} Promise resolving to the updated credential object
 */
export const requestVerification = async (credentialId) => {
  try {
    const token = localStorage.getItem('vfied_token');
    
    const response = await fetch(`${API_URL}/credentials/${credentialId}/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error requesting verification: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to request verification for credential ${credentialId}:`, error);
    throw error;
  }
};