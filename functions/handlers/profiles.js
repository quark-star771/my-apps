const functions = require('firebase-functions');
const {admin, dbAppData} = require('../firebaseConfig');
const cors = require('cors')({origin: true});

// Get all profiles
exports.getProfiles = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const profilesSnapshot = await dbAppData.collection('profiles').get();

      if (profilesSnapshot.empty) {
        return res.status(404).send({error: 'No profiles found.'});
      }

      const profiles = profilesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return res.status(200).send({profiles});
    } catch (err) {
      console.error('Error fetching profiles:', err);
      return res.status(500).send({error: 'Failed to fetch profiles.'});
    }
  });
});

/*
********** Deprecated, keeping here for reference.

// Get a single profile by ID
exports.getProfileById = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const {id} = req.body;

    if (!id) {
      return res.status(400).send({error: 'Profile ID is required.'});
    }

    try {
      const profileDoc = await dbAppData.collection('profiles').doc(id).get();

      if (!profileDoc.exists) {
        return res.status(404).send({error: 'Profile not found.'});
      }

      return res.status(200).send({id: profileDoc.id, ...profileDoc.data()});
    } catch (err) {
      console.error('Error fetching profile:', err);
      return res.status(500).send({error: 'Failed to fetch profile.'});
    }
  });
});
*/

exports.getProfileByUserId = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const {userId} = req.body;

    if (!userId) {
      return res.status(400).send({error: 'User ID is required.'});
    }

    try {
      const profilesRef = dbAppData.collection('profiles');
      const querySnapshot = await profilesRef.where('userId', '==', userId).limit(1).get();

      if (querySnapshot.empty) {
        console.warn(`No profile found for userId: ${userId}`);
        return res.status(200).send({exists: false, message: 'Profile not found.'});
      }

      const profileDoc = querySnapshot.docs[0]; // Get the first matching document
      return res.status(200).send({exists: true, id: profileDoc.id, ...profileDoc.data()});
    } catch (err) {
      console.error('Error fetching profile:', err);
      return res.status(500).send({error: 'Failed to fetch profile.'});
    }
  });
});

// Create a new profile
exports.createProfile = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const {userId, name, bio, avatar_url} = req.body;

    if (!avatar_url || !userId) {
      return res.status(400).send({error: 'Missing required fields: avatar_url or userId.'});
    }

    try {
      const profileData = {
        userId,
        name,
        bio,
        avatar_url,
        joined_date: admin.firestore.FieldValue.serverTimestamp(),
      };

      const profileRef = await dbAppData.collection('profiles').add(profileData);

      return res.status(201).send({id: profileRef.id, ...profileData});
    } catch (err) {
      console.error('Error creating profile:', err);
      return res.status(500).send({error: 'Failed to create profile.'});
    }
  });
});

// Update a profile by ID
exports.updateProfile = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const {id, name, bio, avatar_url, can_start_quest} = req.body;

    if (!id) {
      return res.status(400).send({error: 'Profile ID is required.'});
    }

    try {
      const profileRef = dbAppData.collection('profiles').doc(id);

      const profileDoc = await profileRef.get();
      if (!profileDoc.exists) {
        return res.status(404).send({error: 'Profile not found.'});
      }

      const updatedData = {};
      if (name) updatedData.name = name;
      if (bio) updatedData.bio = bio;
      if (avatar_url) updatedData.avatar_url = avatar_url;
      if (can_start_quest !== undefined) updatedData.can_start_quest = can_start_quest;

      await profileRef.update(updatedData);

      return res.status(200).send({id, ...updatedData, joined_date: profileDoc.data().joined_date});
    } catch (err) {
      console.error('Error updating profile:', err);
      return res.status(500).send({error: 'Failed to update profile.'});
    }
  });
});

// Delete a profile by ID
exports.deleteProfile = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const {id} = req.body;

    if (!id) {
      return res.status(400).send({error: 'Profile ID is required.'});
    }

    try {
      const profileRef = dbAppData.collection('profiles').doc(id);

      const profileDoc = await profileRef.get();
      if (!profileDoc.exists) {
        return res.status(404).send({error: 'Profile not found.'});
      }

      await profileRef.delete();

      return res.status(200).send({success: true, message: `Profile with ID ${id} successfully deleted.`});
    } catch (err) {
      console.error('Error deleting profile:', err);
      return res.status(500).send({error: 'Failed to delete profile.'});
    }
  });
});
