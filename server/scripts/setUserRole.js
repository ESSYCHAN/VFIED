// server/scripts/setUserRole.js
const { admin } = require('../firebase/admin');

async function setUserRole(uid, role) {
  try {
    // Set the custom claim
    await admin.auth().setCustomUserClaims(uid, { role: role });
    console.log(`Successfully set ${role} role for user: ${uid}`);
    
    // Update the user's document in Firestore
    await admin.firestore().collection('users').doc(uid).update({
      role: role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('User document updated in Firestore');
    return true;
  } catch (error) {
    console.error('Error setting user role:', error);
    return false;
  }
}

// Get the UID from command line arguments
const uid = process.argv[2];
const role = process.argv[3] || 'employer'; // Default to employer if no role specified

if (!uid) {
  console.error('Please provide a user UID as a command line argument');
  process.exit(1);
}

// Execute the function
setUserRole(uid, role)
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
  });