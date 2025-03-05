const functions = require('firebase-functions');
const {admin, dbAppData} = require('../firebaseConfig');
const cors = require('cors')({origin: true});

// Create a new notes page
exports.addNotePage = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const {userId, title, content} = req.body;
    if (!userId || !title) {
      return res.status(400).send({error: 'Missing required fields: userId or title.'});
    }

    try {
      const notePageData = {
        userId,
        title,
        content,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const notePageRef = await dbAppData.collection('notes').add(notePageData);
      return res.status(201).send({id: notePageRef.id, ...notePageData});
    } catch (err) {
      console.error('Error creating note page:', err);
      return res.status(500).send({error: 'Failed to create note page.'});
    }
  });
});

// Get all note pages for a user
exports.getNotesPages = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const {userId} = req.body;
    if (!userId) {
      return res.status(400).send({error: 'Missing required field: userId.'});
    }

    try {
      const snapshot = await dbAppData.collection('notes').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
      const notesPages = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
      return res.status(200).send(notesPages);
    } catch (err) {
      console.error('Error fetching note pages:', err);
      return res.status(500).send({error: 'Failed to fetch note pages.'});
    }
  });
});

// Update a note page (add/delete notes)
exports.updateNotePage = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const {notePageId, title, content} = req.body;
    if (!notePageId || !Array.isArray(content)) {
      return res.status(400).send({error: 'Missing required fields: notePageId or content array.'});
    }

    try {
      await dbAppData.collection('notes').doc(notePageId).update({title, content});
      return res.status(200).send({message: 'Note page updated successfully.'});
    } catch (err) {
      console.error('Error updating note page:', err);
      return res.status(500).send({error: 'Failed to update note page.'});
    }
  });
});

// Delete a note page
exports.deleteNotePage = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const {notePageId} = req.body;
    if (!notePageId) {
      return res.status(400).send({error: 'Missing required field: notePageId.'});
    }

    try {
      await dbAppData.collection('notes').doc(notePageId).delete();
      return res.status(200).send({message: 'Note page deleted successfully.'});
    } catch (err) {
      console.error('Error deleting note page:', err);
      return res.status(500).send({error: 'Failed to delete note page.'});
    }
  });
});
