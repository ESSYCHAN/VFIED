// server/scripts/setUserRole.js
const { admin } = require('../firebase/admin');

async function setUserRole(email, role) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { role: role });
    console.log(`Set ${role} role for user ${email}`);
  } catch (error) {
    console.error('Error setting role:', error);
  }
}

// Example usage
setUserRole('your-email@example.com', 'employer');