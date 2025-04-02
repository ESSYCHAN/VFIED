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
    // Validate status update
    const validStatuses = ['draft', 'active', 'paused', 'archived'];
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update status
    await db.collection('requisitions').doc(requisitionId).update({
      status: req.body.status,
      updatedAt: new Date()
    });

    res.status(200).json({ success: true });

  } catch (err) {
    console.error('[VFied] Status update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}