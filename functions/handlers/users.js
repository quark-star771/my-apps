const functions = require('firebase-functions');
const {admin, dbAppData} = require('../firebaseConfig');
const cors = require('cors')({origin: true});

// Update last login for a user
exports.updateLastLogin = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({error: 'User is not authenticated.'});
      }

      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;

      const userDocRef = dbAppData.collection('users').doc(uid);
      await userDocRef.set(
        {lastLogin: admin.firestore.FieldValue.serverTimestamp()},
        {merge: true},
      );

      return res.status(200).send({success: true});
    } catch (error) {
      console.error('Error updating last login:', error);
      return res.status(500).send({error: 'Failed to update last login.'});
    }
  });
});

exports.getUserDocument = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      console.log('Request headers:', req.headers);
      console.log('Request body:', req.body);

      // Verify authentication token from headers
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('Authorization header missing or invalid');
        return res.status(401).send({error: 'User is not authenticated.'});
      }

      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log('Decoded token:', decodedToken);

      const uidFromAuth = decodedToken.uid;
      const {uid} = req.body;

      if (!uid || uidFromAuth !== uid) {
        console.error('Permission denied. Provided UID does not match authenticated UID.');
        return res.status(403).send({error: 'You are not authorized to access this document.'});
      }

      const userDocRef = dbAppData.collection('users').doc(uid);

      const docSnapshot = await userDocRef.get();
      if (!docSnapshot.exists) {
        console.warn('User document does not exist.');
        return res.status(404).send({exists: false, message: 'User document does not exist.'});
      }

      console.log('Document successfully retrieved:', docSnapshot.data());
      return res.status(200).send({exists: true, data: docSnapshot.data()});
    } catch (error) {
      console.error('Error fetching user document:', error);
      return res.status(500).send({error: 'Failed to fetch user document.'});
    }
  });
});

exports.createUserDocument = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const {uid, createdAt, profileId = null, email} = req.body;

    if (!uid || !createdAt) {
      return res.status(400).send({error: 'Missing required fields.'});
    }

    try {
      const userDocRef = dbAppData.collection('users').doc(uid);

      const docSnapshot = await userDocRef.get();
      if (docSnapshot.exists) {
        return res.status(409).send({success: false, message: 'User document already exists.'});
      }

      await userDocRef.set({
        createdAt: admin.firestore.Timestamp.fromDate(new Date(createdAt)),
        lastLogin: admin.firestore.Timestamp.now(),
        profileId: profileId,
        userId: uid,
        email: email,
      });

      return res.status(201).send({success: true, message: 'User document created successfully.'});
    } catch (error) {
      console.error('Error creating user document:', error);
      return res.status(500).send({error: 'Failed to create user document.'});
    }
  });
});
