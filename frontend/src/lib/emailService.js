// frontend/src/lib/emailService.js
import nodemailer from 'nodemailer';
import { formatCurrency } from '../utils/formatters';

// Configure email transport
let transporter;

if (process.env.NODE_ENV === 'production') {
  // Production email setup
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
} else {
  // Development setup with ethereal.email
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.DEV_EMAIL_USER || 'testuser@ethereal.email',
      pass: process.env.DEV_EMAIL_PASS || 'testpass'
    }
  });
}

/**
 * Send payment receipt email
 */
export async function sendPaymentReceipt(user, payment) {
  try {
    const receipt = generateReceiptHTML(user, payment);
    
    const result = await transporter.sendMail({
      from: '"VFied Payments" <payments@vfied.com>',
      to: user.email,
      subject: `Receipt for your ${formatPaymentType(payment.type)}`,
      html: receipt
    });
    
    return result;
  } catch (error) {
    console.error('Failed to send receipt email:', error);
    throw error;
  }
}

/**
 * Generate HTML receipt
 */
function generateReceiptHTML(user, payment) {
  const date = payment.timestamp 
    ? new Date(payment.timestamp).toLocaleDateString() 
    : new Date().toLocaleDateString();
    
  const amount = formatCurrency(payment.amount / 100);
  
  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
        <h1>VFied Payment Receipt</h1>
      </div>
      
      <div style="padding: 20px; border: 1px solid #e5e7eb;">
        <p>Dear ${user.displayName || user.email},</p>
        
        <p>Thank you for your payment. Here's your receipt:</p>
        
        <div style="background-color: #f9fafb; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Transaction ID:</strong> ${payment.id}</p>
          <p><strong>Amount:</strong> ${amount}</p>
          <p><strong>Payment Type:</strong> ${formatPaymentType(payment.type)}</p>
          <p><strong>Status:</strong> Completed</p>
        </div>
        
        <p>
          If you have any questions about this payment, please contact our support team at
          <a href="mailto:support@vfied.com">support@vfied.com</a>.
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
        <p>VFied Inc.</p>
      </div>
    </div>
  `;
}

/**
 * Format payment type for display
 */
function formatPaymentType(type) {
  switch(type) {
    case 'job_posting_fee':
      return 'Job Posting';
    case 'verification_fee':
      return 'Credential Verification';
    case 'hire_success_fee':
      return 'Hire Success Fee';
    case 'subscription':
      return 'Subscription';
    default:
      return 'Payment';
  }
}