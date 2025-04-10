// frontend/src/pages/api/credits/use.js
import { useCredit } from '../../../lib/creditService';
import { auth } from '../../../lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    const { creditType, resourceId } = req.body;
    
    if (!creditType || !resourceId) {
      return res.status(400).json({ error: 'Credit type and resource ID are required' });
    }
    
    const success = await useCredit(decodedToken.uid, creditType, resourceId);
    
    if (!success) {
      return res.status(400).json({ error: 'No credits available' });
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error using credit:', error);
    return res.status(500).json({ error: 'Failed to use credit' });
  }
}