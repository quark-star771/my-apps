import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { navigateTo } from "../utils/navigation";
import Avatar from "avataaars";

const ForumPage = ({ internalData }) => {
  const [threads, setThreads] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://us-central1-my-apps-a1d3c.cloudfunctions.net/getThreads"
      );
      const data = await response.json();
      setThreads(data);
    } catch (error) {
      console.error("Error fetching threads:", error);
    } finally {
      setLoading(false);
    }
  };

  const createThread = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      const response = await fetch(
        "https://us-central1-my-apps-a1d3c.cloudfunctions.net/createThread",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.uid,
            title: newTitle,
            content: newContent,
            name: internalData.profile.name,
            avatar_url: internalData.profile.avatar_url,
          }),
        }
      );

      const newThread = await response.json();
      setNewTitle("");
      setNewContent("");
      fetchThreads(); // Refresh thread list
      navigateTo(`/thread/${newThread.id}`); // Navigate to the newly created thread
    } catch (error) {
      console.error("Error creating thread:", error);
    }
  };

  return (
    <div className="min-h-screen bg-blue-700 text-gray-900 flex flex-col items-center p-5 relative">
      {/* Home Button (spaced correctly) */}
      <button
        onClick={() => navigateTo("/")}
        className="fixed top-4 left-4 p-2 bg-lime-200 text-white rounded hover:bg-lime-300 z-50"
      >
        🏠
      </button>

      <div className="bg-neutral-100 p-6 rounded-lg shadow-lg w-full max-w-2xl mt-12">
        <h1 className="text-3xl font-bold mb-6 text-center">Forum</h1>

        {/* Thread List - Now comes first */}
        <h2 className="text-xl font-semibold mb-2">Recent Threads</h2>
        {loading ? (
          <p>Loading threads...</p>
        ) : (
          <ul className="space-y-4">
            {threads.map((thread) => (
              <li
                key={thread.id}
                className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer flex items-center space-x-4"
                onClick={() => navigateTo(`/thread/${thread.id}`)}
              >
                {/* Profile Picture */}
                <div className="w-12 h-12 flex-shrink-0">
                  <Avatar
                    style={{ width: "48px", height: "48px" }}
                    {...JSON.parse(thread.avatar_url)}
                  />
                </div>

                {/* Thread Content */}
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-blue-700">
                    {thread.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Created by: {thread.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(thread.createdAt._seconds * 1000).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* "Create New Thread" Button */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setShowNewThreadForm(!showNewThreadForm)}
            className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 text-2xl"
            title="Create New Thread"
          >
            ➕
          </button>
        </div>

        {/* New Thread Form (Hidden by Default) */}
        {showNewThreadForm && (
          <div className="mt-6 p-4 bg-gray-200 rounded-lg shadow-inner">
            <h2 className="text-xl font-semibold">Create a New Thread</h2>
            <input
              type="text"
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-2 border rounded mt-2"
            />
            <textarea
              placeholder="Enter thread content..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full p-2 border rounded mt-2"
            ></textarea>
            <button
              onClick={createThread}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
            >
              Post Thread
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumPage;
