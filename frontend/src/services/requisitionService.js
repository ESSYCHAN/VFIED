// src/services/requisitionService.js
import { db, auth } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp
} from "firebase/firestore";

// Get all requisitions (with optional filters)
export const getRequisitions = async (filters = {}) => {
  try {
    const requisitionsRef = collection(db, 'requisitions');
    
    let q = requisitionsRef;
    
    // Apply filters
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    if (filters.companyId) {
      q = query(q, where('companyId', '==', filters.companyId));
    }
    
    if (filters.createdBy) {
      q = query(q, where('createdBy', '==', filters.createdBy));
    }
    
    // Always order by createdAt in descending order (newest first)
    q = query(q, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    
    const requisitions = [];
    querySnapshot.forEach((doc) => {
      requisitions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return requisitions;
  } catch (error) {
    console.error("Error getting requisitions:", error);
    throw error;
  }
};

// Get a single requisition by ID
export const getRequisitionById = async (id) => {
  try {
    const docRef = doc(db, 'requisitions', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      console.log("No such requisition exists!");
      return null;
    }
  } catch (error) {
    console.error("Error getting requisition:", error);
    throw error;
  }
};

// Create a new requisition
export const createRequisition = async (requisitionData) => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error("You must be logged in to create a requisition");
    }
    
    // Add timestamp and user info
    const dataWithMeta = {
      ...requisitionData,
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: requisitionData.status || 'draft' // Default to draft if not specified
    };
    
    const docRef = await addDoc(collection(db, 'requisitions'), dataWithMeta);
    
    return {
      id: docRef.id,
      ...dataWithMeta
    };
  } catch (error) {
    console.error("Error creating requisition:", error);
    throw error;
  }
};

// Update an existing requisition
export const updateRequisition = async (id, requisitionData) => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error("You must be logged in to update a requisition");
    }
    
    // Add updated timestamp
    const dataWithMeta = {
      ...requisitionData,
      updatedAt: serverTimestamp(),
      updatedBy: currentUser.uid
    };
    
    const docRef = doc(db, 'requisitions', id);
    await updateDoc(docRef, dataWithMeta);
    
    return {
      id,
      ...dataWithMeta
    };
  } catch (error) {
    console.error("Error updating requisition:", error);
    throw error;
  }
};

// Delete a requisition
export const deleteRequisition = async (id) => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error("You must be logged in to delete a requisition");
    }
    
    // Check if the requisition exists and the user has permission to delete it
    const requisition = await getRequisitionById(id);
    
    if (!requisition) {
      throw new Error("Requisition not found");
    }
    
    // Only the creator or an admin can delete the requisition
    // (You would need to implement role-based checks here)
    
    await deleteDoc(doc(db, 'requisitions', id));
    
    return true;
  } catch (error) {
    console.error("Error deleting requisition:", error);
    throw error;
  }
};

// Change requisition status
export const changeRequisitionStatus = async (id, newStatus) => {
  try {
    const docRef = doc(db, 'requisitions', id);
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error changing requisition status:", error);
    throw error;
  }
};

// Get matching candidates for a requisition
export const getMatchingCandidates = async (requisitionId) => {
  try {
    // First, get the requisition details
    const requisition = await getRequisitionById(requisitionId);
    
    if (!requisition) {
      throw new Error("Requisition not found");
    }
    
    // In a real application, you would have a more sophisticated algorithm
    // to match candidates based on skills, experience, etc.
    // For now, we'll just mock some data
    
    // Mock data - in a real app, you'd query candidates from your database
    // and perform matching algorithm
    const mockCandidates = [
      {
        id: "cand1",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        location: "New York, NY",
        matchScore: 95,
        topSkills: ["React", "JavaScript", "Node.js"],
        experience: "5 years",
        verified: true
      },
      {
        id: "cand2",
        name: "John Doe",
        email: "john.doe@example.com",
        location: "San Francisco, CA",
        matchScore: 87,
        topSkills: ["JavaScript", "TypeScript", "React"],
        experience: "3 years",
        verified: true
      },
      {
        id: "cand3",
        name: "Alice Johnson",
        email: "alice.johnson@example.com",
        location: "Chicago, IL",
        matchScore: 82,
        topSkills: ["Node.js", "Express", "MongoDB"],
        experience: "4 years",
        verified: false
      }
    ];
    
    return mockCandidates;
  } catch (error) {
    console.error("Error getting matching candidates:", error);
    throw error;
  }
};

// Get all requisitions for a user
export const getUserRequisitions = async (userId) => {
  try {
    const q = query(
      collection(db, 'requisitions'),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const requisitions = [];
    querySnapshot.forEach((doc) => {
      requisitions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return requisitions;
  } catch (error) {
    console.error("Error getting user requisitions:", error);
    throw error;
  }
};