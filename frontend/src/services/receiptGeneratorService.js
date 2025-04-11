// services/receiptGeneratorService.js
import { addDoc, collection, serverTimestamp, getDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { createCanvas, loadImage, registerFont } from 'canvas';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { formatCurrency } from '../utils/formatters';

/**
 * Receipt Generator Service
 * 
 * This service handles generation of digital receipts for transactions
 * Features:
 * - PDF receipt generation
 * - QR code for receipt verification
 * - Email receipt delivery
 * - Receipt storage and retrieval
 * - Receipt templates by transaction type
 */

// Receipt verification URL base
const RECEIPT_VERIFICATION_BASE_URL = 'https://vfied.com/verify/receipt/';

// Transaction type display names
const TRANSACTION_TYPE_NAMES = {
  job_posting_fee: 'Job Posting Fee',
  verification_fee: 'Credential Verification Fee',
  hire_success_fee: 'Hire Success Fee',
  subscription: 'Subscription Payment',
  default: 'Transaction'
};

/**
 * Generate a receipt for a transaction
 * 
 * @param {Object} receiptData - Transaction and user data
 * @param {string} receiptData.id - Transaction ID
 * @param {string} receiptData.type - Transaction type
 * @param {number} receiptData.amount - Transaction amount in cents
 * @param {number} receiptData.fee - Transaction fee amount in cents
 * @param {number} receiptData.netAmount - Net amount after fees in cents
 * @param {string} receiptData.currency - Currency code (default: USD)
 * @param {Date} receiptData.timestamp - Transaction timestamp
 * @param {Object} receiptData.user - User data
 * @param {string} receiptData.user.name - User name
 * @param {string} receiptData.user.email - User email
 * @returns {Promise<string>} - URL to the generated receipt
 */
export async function generateReceipt(receiptData) {
  try {
    // Validate input data
    if (!receiptData || !receiptData.id || !receiptData.type || !receiptData.amount) {
      throw new Error('Invalid receipt data');
    }

    // Create a receipt record in Firestore
    const receiptRef = await addDoc(collection(db, 'receipts'), {
      transactionId: receiptData.id,
      userId: receiptData.user.id || 'unknown',
      type: receiptData.type,
      amount: receiptData.amount,
      fee: receiptData.fee || 0,
      netAmount: receiptData.netAmount || receiptData.amount,
      currency: receiptData.currency || 'USD',
      timestamp: receiptData.timestamp || serverTimestamp(),
      userName: receiptData.user.name || 'VFied User',
      userEmail: receiptData.user.email || '',
      created: serverTimestamp(),
      verified: false
    });

    // Generate verification code (use Firestore document ID)
    const verificationCode = receiptRef.id;
    
    // Generate QR code for verification
    const verificationUrl = `${RECEIPT_VERIFICATION_BASE_URL}${verificationCode}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 150,
      margin: 1,
      color: {
        dark: '#4f46e5', // Indigo color matching VFied branding
        light: '#ffffff'
      }
    });

    // Generate PDF receipt
    const pdfContent = await generatePdfReceipt(receiptData, qrCodeDataUrl, verificationCode);
    
    // Upload PDF to Firebase Storage
    const storageRef = ref(storage, `receipts/${receiptData.id}_${verificationCode}.pdf`);
    await uploadString(storageRef, pdfContent, 'data_url');
    
    // Get the download URL
    const downloadUrl = await getDownloadURL(storageRef);
    
    // Update the receipt record with the URL and verification code
    await updateDoc(doc(db, 'receipts', receiptRef.id), {
      pdfUrl: downloadUrl,
      verificationCode
    });
    
    // Return the download URL
    return downloadUrl;
  } catch (error) {
    console.error('Error generating receipt:', error);
    throw new Error(`Failed to generate receipt: ${error.message}`);
  }
}

/**
 * Generate a PDF receipt
 * 
 * @param {Object} receiptData - Transaction and user data
 * @param {string} qrCodeDataUrl - QR code data URL
 * @param {string} verificationCode - Receipt verification code
 * @returns {Promise<string>} - PDF as data URL
 */
async function generatePdfReceipt(receiptData, qrCodeDataUrl, verificationCode) {
  try {
    // Create new PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Set font
    pdf.setFont('helvetica', 'normal');
    
    // Add VFied logo (would be an image in real implementation)
    // pdf.addImage(logoDataUrl, 'PNG', 20, 10, 40, 20);
    
    // Add receipt header
    pdf.setFontSize(22);
    pdf.setTextColor(79, 70, 229); // Indigo color
    pdf.text('VFied', 20, 20);
    
    pdf.setFontSize(18);
    pdf.setTextColor(0, 0, 0);
    const typeName = TRANSACTION_TYPE_NAMES[receiptData.type] || TRANSACTION_TYPE_NAMES.default;
    pdf.text(`Receipt: ${typeName}`, 20, 30);
    
    // Add receipt details
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('VFied, Inc.', 20, 40);
    pdf.text('123 Verification Street', 20, 45);
    pdf.text('San Francisco, CA 94107', 20, 50);
    pdf.text('support@vfied.com', 20, 55);
    
    // Add receipt date and ID
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    const date = receiptData.timestamp 
      ? new Date(receiptData.timestamp).toLocaleDateString() 
      : new Date().toLocaleDateString();
    const time = receiptData.timestamp 
      ? new Date(receiptData.timestamp).toLocaleTimeString() 
      : new Date().toLocaleTimeString();
    
    pdf.text(`Date: ${date}`, 120, 40);
    pdf.text(`Time: ${time}`, 120, 45);
    pdf.text(`Receipt ID: ${verificationCode}`, 120, 50);
    pdf.text(`Transaction ID: ${receiptData.id}`, 120, 55);
    
    // Add customer details
    pdf.setFontSize(12);
    pdf.setTextColor(79, 70, 229);
    pdf.text('Bill To:', 20, 70);
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(receiptData.user.name || 'VFied User', 20, 77);
    if (receiptData.user.email) {
      pdf.text(receiptData.user.email, 20, 82);
    }
    
    // Add transaction details
    pdf.setFontSize(12);
    pdf.setTextColor(79, 70, 229);
    pdf.text('Payment Details:', 20, 95);
    
    // Add transaction table
    pdf.setDrawColor(230, 230, 230);
    pdf.setLineWidth(0.1);
    
    // Table header
    pdf.setFillColor(249, 250, 251);
    pdf.rect(20, 100, 170, 10, 'F');
    
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Description', 25, 106);
    pdf.text('Amount', 155, 106);
    
    // Table rows
    pdf.setTextColor(0, 0, 0);
    
    // Main transaction
    pdf.line(20, 110, 190, 110);
    pdf.text(TRANSACTION_TYPE_NAMES[receiptData.type] || 'Transaction', 25, 116);
    
    const formattedAmount = formatCurrency(receiptData.amount / 100, receiptData.currency || 'USD');
    pdf.text(formattedAmount, 155, 116);
    
    // Service fee if applicable
    if (receiptData.fee && receiptData.fee > 0) {
      pdf.line(20, 120, 190, 120);
      pdf.text('Service Fee', 25, 126);
      
      const formattedFee = formatCurrency(receiptData.fee / 100, receiptData.currency || 'USD');
      pdf.text(`- ${formattedFee}`, 155, 126);
      
      // Net amount
      pdf.line(20, 130, 190, 130);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Net Amount', 25, 136);
      
      const formattedNet = formatCurrency(receiptData.netAmount / 100, receiptData.currency || 'USD');
      pdf.text(formattedNet, 155, 136);
    }
    
    // Bottom border
    pdf.line(20, receiptData.fee ? 140 : 120, 190, receiptData.fee ? 140 : 120);
    
    // Add payment status
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(39, 174, 96); // Green color
    pdf.text('PAID', 155, receiptData.fee ? 150 : 130);
    
    // Add QR code for verification
    pdf.addImage(qrCodeDataUrl, 'PNG', 20, 150, 40, 40);
    
    // Add verification instructions
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Verify this receipt:', 65, 160);
    pdf.text(`1. Scan QR code or visit ${RECEIPT_VERIFICATION_BASE_URL}`, 65, 165);
    pdf.text(`2. Enter verification code: ${verificationCode}`, 65, 170);
    
    // Add footer
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text('This is an electronic receipt. No signature is required.', 20, 200);
    pdf.text('For questions about this receipt, contact support@vfied.com', 20, 205);
    pdf.text(`© ${new Date().getFullYear()} VFied, Inc. All rights reserved.`, 20, 210);
    
    // Convert to data URL
    return pdf.output('datauristring');
  } catch (error) {
    console.error('Error generating PDF receipt:', error);
    throw error;
  }
}

/**
 * Verify a receipt
 * 
 * @param {string} verificationCode - Receipt verification code
 * @returns {Promise<Object>} - Verification result
 */
export async function verifyReceipt(verificationCode) {
  try {
    // Get receipt from Firestore
    const receiptQuery = collection(db, 'receipts');
    const snapshot = await getDocs(
      query(receiptQuery, where('verificationCode', '==', verificationCode), limit(1))
    );
    
    if (snapshot.empty) {
      return {
        verified: false,
        error: 'Receipt not found'
      };
    }
    
    const receiptDoc = snapshot.docs[0];
    const receipt = receiptDoc.data();
    
    // Mark receipt as verified
    await updateDoc(doc(db, 'receipts', receiptDoc.id), {
      verified: true,
      lastVerified: serverTimestamp()
    });
    
    // Return verification result with receipt details
    return {
      verified: true,
      transactionId: receipt.transactionId,
      amount: receipt.amount,
      timestamp: receipt.timestamp?.toDate() || null,
      type: receipt.type
    };
  } catch (error) {
    console.error('Error verifying receipt:', error);
    return {
      verified: false,
      error: 'Verification failed'
    };
  }
}

/**
 * Get receipt history for a user
 * 
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of receipts to return
 * @returns {Promise<Array>} - Array of receipt data
 */
export async function getUserReceiptHistory(userId, limit = 20) {
  try {
    if (!userId) {
      return [];
    }
    
    const receiptsRef = collection(db, 'receipts');
    const q = query(
      receiptsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limit)
    );
    
    const snapshot = await getDocs(q);
    
    const receipts = [];
    snapshot.forEach(doc => {
      const receipt = doc.data();
      receipts.push({
        id: doc.id,
        transactionId: receipt.transactionId,
        amount: receipt.amount,
        fee: receipt.fee,
        netAmount: receipt.netAmount,
        type: receipt.type,
        timestamp: receipt.timestamp?.toDate() || null,
        pdfUrl: receipt.pdfUrl,
        verificationCode: receipt.verificationCode
      });
    });
    
    return receipts;
  } catch (error) {
    console.error('Error fetching user receipt history:', error);
    return [];
  }
}

/**
 * Send a receipt by email
 * 
 * @param {string} receiptId - Receipt ID
 * @param {string} email - Email address to send to
 * @returns {Promise<boolean>} - Success status
 */
export async function emailReceipt(receiptId, email) {
  try {
    if (!receiptId || !email) {
      return false;
    }
    
    // Get receipt from Firestore
    const receiptRef = doc(db, 'receipts', receiptId);
    const receiptDoc = await getDoc(receiptRef);
    
    if (!receiptDoc.exists()) {
      throw new Error('Receipt not found');
    }
    
    const receipt = receiptDoc.data();
    
    // Check if receipt has PDF URL
    if (!receipt.pdfUrl) {
      throw new Error('Receipt PDF not found');
    }
    
    // This would normally call an email service with the receipt PDF
    // For demonstration, we'll just log it
    console.log(`Sending receipt ${receiptId} to ${email}`);
    
    // Update receipt record with email history
    await updateDoc(receiptRef, {
      emailHistory: arrayUnion({
        email,
        sentAt: serverTimestamp()
      })
    });
    
    return true;
  } catch (error) {
    console.error('Error emailing receipt:', error);
    return false;
  }
}

/**
 * Format currency amount
 * 
 * @param {number} amount - Amount
 * @param {string} currency - Currency code
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}