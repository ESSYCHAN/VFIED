import { getFirestore } from 'firebase-admin/firestore';
import { verifyIdToken } from '../../../../lib/firebase/firebaseAdmin';

export default async function handler(req, res) {
  // Authorization
  let uid;
  try {
    const decoded = await verifyIdToken(req.headers.authorization);
    uid = decoded.uid;
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const db = getFirestore();
  const { requisitionId } = req.query;

  try {
    // Verify requisition ownership
    const reqDoc = await db.collection('requisitions').doc(requisitionId).get();
    if (!reqDoc.exists || reqDoc.data().companyId !== uid) {
      return res.status(404).json({ error: 'Requisition not found' });
    }

    // Get matches (adapt to your Firestore structure)
    const matches = await db.collection('users')
      .where('verified', '==', true)
      .limit(parseInt(req.query.limit) || 10)
      .get();

    res.status(200).json({
      candidates: matches.docs.map(d => ({
        id: d.id,
        ...d.data(),
        matchScore: 75 // Replace with actual scoring
      }))
    });

  } catch (err) {
    console.error('[VFied] Candidates error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}