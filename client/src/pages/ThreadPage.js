import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { navigateTo } from "../utils/navigation";
import Avatar from "avataaars"; // Import Avatar component

const ThreadPage = ({ internalData }) => {
  const { threadId } = useParams();
  const [thread, setThread] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);
  const [editingComment, setEditingComment] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState("");
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    fetchThread();
    fetchComments();
  }, []);

  const fetchThread = async () => {
    try {
      const response = await fetch(
        "https://us-central1-my-apps-a1d3c.cloudfunctions.net/getThreads"
      );
      const data = await response.json();
      const currentThread = data.find((t) => t.id === threadId);
      setThread(currentThread);
    } catch (error) {
      console.error("Error fetching thread:", error);
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const response = await fetch(
        "https://us-central1-my-apps-a1d3c.cloudfunctions.net/getComments",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ threadId }),
        }
      );
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      await fetch(
        "https://us-central1-my-apps-a1d3c.cloudfunctions.net/addComment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.uid,
            threadId,
            content: newComment,
            name: internalData.profile.name,
            avatar_url: internalData.profile.avatar_url,
          }),
        }
      );
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const editComment = (comment) => {
    setEditingComment(comment.id);
    setEditedContent(comment.content);
  };

  const saveEditedComment = async (commentId) => {
    try {
      const response = await fetch(
        "https://us-central1-my-apps-a1d3c.cloudfunctions.net/updateComment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            threadId,
            commentId,
            content: editedContent,
            userId: internalData.user.userId,
          }),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Update failed:", errorData);
        return;
      }
  
      setEditingComment(null);
      fetchComments();
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };  

  const deleteComment = async (commentId) => {
    try {
      const response = await fetch(
        "https://us-central1-my-apps-a1d3c.cloudfunctions.net/deleteComment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            threadId,
            commentId,
            userId: internalData.user.userId,
          }),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Delete failed:", errorData);
        return;
      }
  
      fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  if (!thread) return <p>Loading thread...</p>;

  return (
    <div className="min-h-screen bg-blue-700 text-gray-900 flex flex-col items-center p-5">
      {/* Home Button */}
      <button
        onClick={() => navigateTo("/")}
        className="fixed top-4 left-4 p-3 bg-lime-200 text-white rounded hover:bg-lime-300 z-50"
      >
        🏠
      </button>

      {/* Back Button */}
      <button
        onClick={() => navigateTo("/forum")}
        className="fixed top-4 right-4 p-3 bg-yellow-200 text-white rounded hover:bg-yellow-300 z-50"
      >
        🔙
      </button>
  
      <div className="bg-neutral-100 p-6 rounded-lg shadow-lg w-full max-w-2xl mt-12">
        {/* Thread Title */}
        <h1 className="text-2xl font-bold">{thread.title}</h1>
  
        {/* Creation Date */}
        <p className="text-xs text-gray-600 mt-1">
          {new Date(thread.createdAt._seconds * 1000).toLocaleString()}
        </p>
  
        {/* Thread Content */}
        <p className="mt-4 text-gray-800 whitespace-pre-line">{thread.content}</p>
        <p className="pt-2"></p>
  
        {/* Avatar & User Info */}
        <p className="text-left text-black pt-2 border-t">Created by:</p>
        <div className="flex items-center space-x-4 pt-4">
          {/* Profile Picture */}
          <div className="w-14 h-14 flex-shrink-0">
            <Avatar
              style={{ width: "56px", height: "56px" }}
              {...JSON.parse(thread.avatar_url)}
            />
          </div>
  
          {/* User Name */}
          <h2 className="text-lg font-semibold">{thread.name}</h2>
        </div>
  
        {/* Comments Section */}
        <h2 className="text-xl font-semibold border-t mt-6">Comments</h2>
  
        {loadingComments ? (
          <p className="text-center text-gray-500">Loading comments...</p>
        ) : (
          <ul className="space-y-4 mt-2">
            {comments.map((comment) => (
              <li
                key={comment.id}
                className="p-4 border rounded-lg bg-gray-50 flex flex-col space-y-2"
              >
                {/* Comment Content */}
                {editingComment === comment.id ? (
                  <div>
                    <textarea
                      className="w-full p-2 border rounded"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => saveEditedComment(comment.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingComment(null)}
                        className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p 
                    className="text-sm text-gray-700 whitespace-pre-wrap" 
                  >
                    {comment.content}
                  </p>
                )}

                {/* Comment Metadata */}
                <div className="flex items-center space-x-4">
                  {/* Profile Picture */}
                  <div className="w-12 h-12 flex-shrink-0">
                    <Avatar
                      style={{ width: "48px", height: "48px" }}
                      {...JSON.parse(comment.avatar_url)}
                    />
                  </div>
  
                  {/* User Name & Timestamp */}
                  <div className="flex-grow">
                    <p className="text-xs text-gray-600">
                      By: {comment.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(comment.createdAt._seconds * 1000).toLocaleString()}
                    </p>
                  </div>
  
                  {/* Edit/Delete Buttons - Only if the user owns the comment */}
                  {comment.userId === user.uid && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => editComment(comment)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        📝
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(comment.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
  
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded shadow-lg text-center">
              <p>Are you sure you want to delete this comment?</p>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => {
                    deleteComment(showDeleteConfirm);
                    setShowDeleteConfirm(null);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
  
        {/* Add Comment */}
        <textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-2 border rounded mt-4"
        />
        <button 
          onClick={addComment}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full">
          Add Comment
        </button>
      </div>
    </div>
  );  
};

export default ThreadPage;
