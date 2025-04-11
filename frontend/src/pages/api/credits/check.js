// frontend/src/pages/api/credits/check.js
import { checkUserCredits } from '../../../lib/creditService';
import { adminDb, adminAuth } from '../../../lib/firebase/firebaseAdmin';



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
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    const { creditType } = req.body;
    
    if (!creditType) {
      return res.status(400).json({ error: 'Credit type is required' });
    }
    
    const creditCheck = await checkUserCredits(decodedToken.uid, creditType);
    
    return res.status(200).json(creditCheck);
  } catch (error) {
    console.error('Error checking credits:', error);
    return res.status(500).json({ error: 'Failed to check credits' });
  }
}