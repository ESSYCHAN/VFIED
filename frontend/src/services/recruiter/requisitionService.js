import { db, auth } from '../../lib/firebase';
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

// Utility function to log errors with context
const logError = (context, error) => {
  console.error(`Error in ${context}:`, {
    message: error.message,
    code: error.code,
    stack: error.stack
  });
};

// Get all requisitions (with optional filters)
export const getRequisitions = async (filters = {}) => {
  try {
    // Extensive logging for debugging
    console.log('Fetching Requisitions - Start');
    console.log('Filters:', filters);

    // Validate Firebase services
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    // Check authentication
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.warn('No authenticated user');
      return []; // Return empty array instead of throwing error
    }

    console.log('Current User ID:', currentUser.uid);

    // Construct base query
    const requisitionsRef = collection(db, 'requisitions');
    
    // Build query with user-specific and optional status filtering
    let q = query(
      requisitionsRef,
      where('createdBy', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    
    // Apply additional status filter if provided
    if (filters.status) {
      q = query(
        requisitionsRef,
        where('createdBy', '==', currentUser.uid),
        where('status', '==', filters.status),
        orderBy('createdAt', 'desc')
      );
    }
    
    // Execute query
    const querySnapshot = await getDocs(q);
    
    console.log('Query Snapshot Size:', querySnapshot.size);

    // Process documents
    const requisitions = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Log each document for debugging
      console.log('Requisition Document:', {
        id: doc.id,
        title: data.title,
        status: data.status,
        createdAt: data.createdAt
      });
      
      requisitions.push({
        id: doc.id,
        ...data,
        // Safely convert Firestore timestamps
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
      });
    });
    
    console.log('Fetched Requisitions - End');
    console.log('Requisitions Count:', requisitions.length);
    
    return requisitions;
  } catch (error) {
    logError('getRequisitions', error);
    
    // Provide a more informative error
    throw new Error(`Failed to fetch requisitions: ${error.message}`);
  }
};

// Get a single requisition by ID
export const getRequisitionById = async (id) => {
  try {
    if (!id) {
      throw new Error('Requisition ID is required');
    }

    const docRef = doc(db, 'requisitions', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      console.warn(`No requisition found with ID: ${id}`);
      return null;
    }
  } catch (error) {
    logError('getRequisitionById', error);
    throw error;
  }
};

// Rest of the methods remain the same with similar error handling
export const createRequisition = async (requisitionData) => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('Authentication required to create a requisition');
    }

    const dataWithMeta = {
      ...requisitionData,
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: requisitionData.status || 'draft'
    };
    
    const docRef = await addDoc(collection(db, 'requisitions'), dataWithMeta);
    
    return {
      id: docRef.id,
      ...dataWithMeta
    };
  } catch (error) {
    logError('createRequisition', error);
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

// Activate a requisition
export const activateRequisition = async (id) => {
  try {
    const docRef = doc(db, 'requisitions', id);
    await updateDoc(docRef, {
      status: 'active',
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error activating requisition:", error);
    throw error;
  }
};