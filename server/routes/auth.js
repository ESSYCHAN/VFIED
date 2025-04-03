// server/routes/auth.js or create a new file like server/scripts/setAdminRole.js
const { admin } = require('../firebase/admin');
// setAdminRole();
const uid = '2aojHJy8E9hYDl9Go9qIsaapVFX2';
setUserRole(uid, 'employer');

// Option 1: Create an API endpoint (secured, for use from your app)
router.post('/set-admin-role', authMiddleware, async (req, res) => {
  try {
    // Check if the requesting user is already an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized. Only admins can set roles.' });
    }
    
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Set the custom claim
    await admin.auth().setCustomUserClaims(userId, { role: 'admin' });
    
    // Optionally update your Firestore users collection
    await admin.firestore().collection('users').doc(userId).update({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, message: 'Admin role assigned successfully' });
  } catch (error) {
    console.error('Error setting admin role:', error);
    res.status(500).json({ error: 'Failed to set admin role: ' + error.message });
  }
});

// Option 2: Create a standalone script to run manually
// You'd save this in a script file and run it with Node
async function setAdminRole(uid) {
  try {
    // Set the custom claim
    await admin.auth().setCustomUserClaims(uid, { role: 'admin' });
    console.log(`Successfully set admin role for user: ${uid}`);
    
    // Optionally update the user's document in Firestore
    await admin.firestore().collection('users').doc(uid).update({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('User document updated in Firestore');
  } catch (error) {
    console.error('Error setting admin role:', error);
  }
}

// If using as a script, call the function with the UID
// setAdminRole('2aojHJy8E9hYDl9Go9qIsaapVFX2');

// Example to set a role
async function setUserRole(uid, role) {
  await admin.auth().setCustomUserClaims(uid, { role: role });
  console.log(`Role ${role} set for user ${uid}`);
}

// To check roles
async function getUserRole(uid) {
  const user = await admin.auth().getUser(uid);
  return user.customClaims?.role || 'user';
}