// frontend/src/utils/requisitionHelpers.js
import { db } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';

// Status constants for requisitions
export const REQUISITION_STATUS = {
  DRAFT: 'draft',
  PENDING_PAYMENT: 'pending_payment',
  ACTIVE: 'active', 
  FILLED: 'filled',
  CLOSED: 'closed',
  EXPIRED: 'expired'
};

// Create a new requisition
export async function createRequisition(data, userId) {
  try {
    const requisitionRef = doc(collection(db, 'requisitions'));
    
    const requisitionData = {
      ...data,
      employerId: userId,
      status: REQUISITION_STATUS.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(requisitionRef, requisitionData);
    return { id: requisitionRef.id, ...requisitionData };
  } catch (error) {
    console.error("Error creating requisition:", error);
    throw error;
  }
}

// Update requisition status after payment
export async function updateRequisitionAfterPayment(requisitionId, paymentInfo) {
  try {
    const requisitionRef = doc(db, 'requisitions', requisitionId);
    
    await updateDoc(requisitionRef, {
      status: REQUISITION_STATUS.ACTIVE,
      paymentId: paymentInfo.id,
      paymentAmount: paymentInfo.amount,
      paymentDate: new Date(),
      updatedAt: new Date()
    });
    
    return { success: true, requisitionId };
  } catch (error) {
    console.error("Error updating requisition after payment:", error);
    throw error;
  }
}

// Get requisition with candidate matches
export async function getRequisitionWithCandidates(requisitionId) {
  try {
    const requisitionRef = doc(db, 'requisitions', requisitionId);
    const requisitionDoc = await getDoc(requisitionRef);
    
    if (!requisitionDoc.exists()) {
      throw new Error("Requisition not found");
    }
    
    const requisitionData = requisitionDoc.data();
    
    // Get candidate matches (simplified - you would implement actual matching logic)
    // This would connect to your candidate matching service
    
    return {
      id: requisitionId,
      ...requisitionData,
      // Add candidate data here
    };
  } catch (error) {
    console.error("Error getting requisition with candidates:", error);
    throw error;
  }
}