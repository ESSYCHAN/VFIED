// server/scripts/set-employer-role.js
const { admin } = require('../firebase/admin');

async function main() {
  const uid = '2aojHJy8E9hYDl9Go9qIsaapVFX2'; // Your user ID
  
  try {
    // Set Firebase Auth custom claims
    await admin.auth().setCustomUserClaims(uid, { role: 'employer' });
    console.log('Custom claims set successfully');
    
    // Update Firestore user document
    const userRef = admin.firestore().collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      await userRef.update({ 
        role: 'employer',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      await userRef.set({
        role: 'employer',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    console.log('User document updated successfully');
  } catch (error) {
    console.error('Error setting role:', error);
  }
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});