const functions = require('firebase-functions');
const {admin, dbAppData} = require('../firebaseConfig');
const cors = require('cors')({origin: true});

// Create a new thread
exports.createThread = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const {userId, title, content, name, avatar_url} = req.body;
    if (!userId || !title || !content) {
      return res.status(400).send({error: 'Missing required fields: userId, title, or content.'});
    }

    try {
      const threadData = {
        userId,
        title,
        content,
        name,
        avatar_url,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const threadRef = await dbAppData.collection('threads').add(threadData);
      return res.status(201).send({id: threadRef.id, ...threadData});
    } catch (err) {
      console.error('Error creating thread:', err);
      return res.status(500).send({error: 'Failed to create thread.'});
    }
  });
});

// Fetch all threads
exports.getThreads = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const snapshot = await dbAppData.collection('threads').orderBy('createdAt', 'desc').get();
      const threads = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return res.status(200).send(threads);
    } catch (err) {
      console.error('Error fetching threads:', err);
      return res.status(500).send({error: 'Failed to fetch threads.'});
    }
  });
});

// Add a comment to a thread
exports.addComment = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const {userId, threadId, content, name, avatar_url} = req.body;
    if (!userId || !threadId || !content) {
      return res.status(400).send({error: 'Missing required fields: userId, threadId, or content.'});
    }

    try {
      const commentData = {
        userId,
        content,
        name,
        avatar_url,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await dbAppData.collection('threads').doc(threadId).collection('comments').add(commentData);
      return res.status(201).send({message: 'Comment added successfully.'});
    } catch (err) {
      console.error('Error adding comment:', err);
      return res.status(500).send({error: 'Failed to add comment.'});
    }
  });
});

exports.getComments = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const {threadId} = req.body;
    if (!threadId) {
      return res.status(400).send({error: 'Missing required field: threadId.'});
    }

    try {
      const commentsRef = dbAppData
        .collection('threads')
        .doc(threadId)
        .collection('comments');

      const snapshot = await commentsRef.get();

      if (snapshot.empty) {
        return res.status(200).send([]); // No comments found
      }

      const comments = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((comment) => !comment.deleted); // Exclude deleted comments

      return res.status(200).send(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).send({error: 'Failed to retrieve comments.'});
    }
  });
});

exports.updateComment = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    console.log('Incoming request body:', req.body); // Debugging log

    const {threadId, commentId, content, userId} = req.body; // Ensure correct field names

    if (!threadId || !commentId || !content || !userId) {
      console.error('Missing required fields.');
      return res.status(400).send({error: 'Missing required fields.'});
    }

    try {
      // 🔥 Get the reference directly using the full path inside the thread
      const commentRef = dbAppData
        .collection('threads')
        .doc(threadId)
        .collection('comments')
        .doc(commentId);

      const commentDoc = await commentRef.get();

      if (!commentDoc.exists) {
        console.error('Comment not found:', commentId);
        return res.status(404).send({error: 'Comment not found.'});
      }

      // Ensure the user owns the comment before updating
      if (commentDoc.data().userId !== userId) {
        console.error('Unauthorized edit attempt:', userId);
        return res.status(403).send({error: 'Unauthorized to edit this comment.'});
      }

      // Update the comment
      await commentRef.update({
        content: content, // Match the frontend request
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log('Comment updated successfully:', commentId);
      return res.status(200).send({success: 'Comment updated successfully.'});
    } catch (error) {
      console.error('Error updating comment:', error);
      return res.status(500).send({error: 'Failed to update comment.'});
    }
  });
});

exports.deleteComment = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const {commentId, userId} = req.body;

    if (!commentId || !userId) {
      return res.status(400).send({error: 'Missing required fields.'});
    }

    try {
      const commentRef = dbAppData.collectionGroup('comments').where('id', '==', commentId);
      const snapshot = await commentRef.get();

      if (snapshot.empty) {
        return res.status(404).send({error: 'Comment not found.'});
      }

      const commentDoc = snapshot.docs[0];

      if (commentDoc.data().userId !== userId) {
        return res.status(403).send({error: 'Unauthorized to delete this comment.'});
      }

      // Instead of deleting, we mark it as deleted
      await commentDoc.ref.update({
        deleted: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).send({success: 'Comment marked as deleted.'});
    } catch (error) {
      console.error('Error marking comment as deleted:', error);
      return res.status(500).send({error: 'Failed to delete comment.'});
    }
  });
});
