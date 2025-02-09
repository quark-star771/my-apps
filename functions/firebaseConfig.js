const admin = require('firebase-admin');
const {getFirestore} = require('firebase-admin/firestore');

// Initialize Firebase only once
const firebaseApp = admin.initializeApp();

// Database References
const dbAppData = getFirestore(firebaseApp, 'appdata');

// Export the Firestore reference
module.exports = {admin, dbAppData};
