import React, { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";
import { navigateTo } from '../utils/navigation';

const NotesPage = () => {
  const [notesPages, setNotesPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [pageTitle, setPageTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const menuRef = useRef(null);

  const auth = getAuth();
  const user = auth.currentUser;

  // Load all notes for user upon load
  useEffect(() => {
    if (user) {
      fetchNotesPages();
    }
  }, [user]);

  // Handle menu closing when clicking out of scope
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false); // Close the menu if clicked outside
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  // Prompt to save on browser exit
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Make sure you save changes! Are you sure you want to leave?";
    };
  
    window.addEventListener("beforeunload", handleBeforeUnload);
  
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Search instantly based on user text input into search bar
  useEffect(() => {
    handleSearch();
  }, [searchTerm]);

  // Fetch all notes for a user
  const fetchNotesPages = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://us-central1-my-apps-a1d3c.cloudfunctions.net/getNotesPages",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.uid }),
        }
      );
      const data = await response.json();
      setNotesPages(data);
      if (data.length > 0) {
        setSelectedPage(data[0]);
        setPageTitle(data[0].title);
        setContent(data[0].content.join("\n"));
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Save notes for existing page or crate new page
  const saveNotePage = async () => {
    if (!selectedPage) {
      const response = await fetch(
        "https://us-central1-my-apps-a1d3c.cloudfunctions.net/addNotePage",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.uid,
            title: pageTitle,
            content: content.split("\n"),
          }),
        }
      );
      const newPage = await response.json();
      setNotesPages([...notesPages, newPage]);
      setSelectedPage(newPage);
    } else {
      await fetch(
        "https://us-central1-my-apps-a1d3c.cloudfunctions.net/updateNotePage",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notePageId: selectedPage.id,
            content: content.split("\n"),
          }),
        }
      );
      const updatedPages = notesPages.map((page) =>
        page.id === selectedPage.id
          ? { ...page, content: content.split("\n") }
          : page
      );
      setNotesPages(updatedPages);
    }
  };

  // Delete page
  const deleteNotePage = async () => {
    if (selectedPage) {
      try {
        await fetch(
          "https://us-central1-my-apps-a1d3c.cloudfunctions.net/deleteNotePage",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notePageId: selectedPage.id }),
          }
        );
        const updatedPages = notesPages.filter((page) => page.id !== selectedPage.id);
        setNotesPages(updatedPages);
        setSelectedPage(updatedPages.length > 0 ? updatedPages[0] : null);
        setPageTitle(updatedPages.length > 0 ? updatedPages[0]?.title || "" : "");
        setContent(updatedPages.length > 0 ? updatedPages[0]?.content.join("\n") || "" : "");
        setShowDeleteSuccess(true); // Show delete success confirmation
      } catch (error) {
        console.error("Error deleting note page:", error);
      }
    }
  };

  // Handle page switch from menu
  const handlePageSwitch = (page) => {
    if (selectedPage) saveNotePage();
    setSelectedPage(page);
    setPageTitle(page.title);
    setContent(page.content.join("\n"));
    setMenuOpen(false);
  };

  // Perform search operation through all note pages
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
  
    const results = notesPages.filter((page) =>
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.content.some((line) => line.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  
    setSearchResults(results);
  };

  return (
    <div className="min-h-screen bg-fuchsia-600 text-gray-800 flex flex-col items-center justify-center p-5 animate-fadeIn">
    {/* Home Button */}
    <button
      onClick={async () => {
        if (selectedPage && (pageTitle !== selectedPage.title || content !== selectedPage.content.join("\n"))) {
          await saveNotePage();
        }
        navigateTo('/');
      }}
      className="fixed top-4 left-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 z-50"
    >
      🏠
    </button>
      <div
        className="flex flex-col items-center bg-yellow-100 p-4 rounded-lg shadow-lg w-full max-w-lg relative"
        style={{ height: "80vh" }}
      >
        <h1 className="text-3xl font-bold mb-6">Notes</h1>

        {/* Menu Button */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="absolute top-4 left-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ☰
        </button>

        {/* Delete Button */}
        <button
          onClick={() => setShowDeleteConfirm(true)} // Show Yes/No dialog
          className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          🗑️
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute top-12 left-4 w-40 bg-white shadow-lg rounded-lg z-10"
          >
            <ul className="p-2 space-y-2">
              {notesPages.map((page) => (
                <li key={page.id}>
                  <button
                    className="w-full text-left p-2 hover:bg-gray-200 rounded"
                    onClick={() => handlePageSwitch(page)}
                  >
                    {page.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {loading ? (
          <p>Loading notes...</p>
        ) : (
          <>
            {/* Title Section */}
          <div className="mb-4 w-full">
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Title
            </label>
            <div className="flex items-center font-bold gap-2">
              <input
                type="text"
                placeholder="Enter page title"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                className="p-2 border border-gray-300 rounded flex-grow"
                disabled={!selectedPage?.editable}
              />
              <button
                onClick={() =>
                  setSelectedPage((prev) =>
                    prev
                      ? { ...prev, editable: !prev.editable }
                      : prev
                  )
                }
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                ✏️
              </button>
            </div>
          </div>

          {/* Content Textarea */}
          <textarea
            className="w-full p-2 border border-gray-300 rounded mb-4 resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your notes here..."
            style={{
              flexGrow: 1,
              minHeight: "150px",
              maxHeight: "100%",
              overflowY: "auto",
            }}
          ></textarea>

          {/* Save and Create Buttons */}
          <div className="flex gap-2 w-full mb-6">
            <button
              onClick={saveNotePage}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex-1"
            >
              Save
            </button>
            <button
              onClick={() => {
                setSelectedPage(null);
                setPageTitle("");
                setContent("");
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex-1"
            >
              Create New
            </button>
          </div>

          {/* Search Section */}
          <div className="w-full mb-4">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border border-gray-300 rounded w-full"
            />
          </div>
          </>
        )}

        {searchResults.length > 0 && (
          <div
            className="w-full mt-4 bg-white p-4 rounded shadow-lg"
            style={{
              maxHeight: "200px", // Set a maximum height for the container
              overflowY: "auto", // Enable vertical scrolling if content exceeds max height
            }}
          >
            <h2 className="text-xl font-semibold mb-2">Search Results</h2>
            <ul className="space-y-2">
              {searchResults.map((page) => (
                <li key={page.id} className="p-2 bg-gray-100 rounded hover:bg-gray-200">
                  <button
                    onClick={() => {
                      setSelectedPage(page);
                      setPageTitle(page.title);
                      setContent(page.content.join("\n"));
                    }}
                    className="text-blue-500 underline"
                  >
                    {page.title}
                  </button>
                  <p className="text-sm text-gray-500">
                    Match found in:{" "}
                    {page.content.find((line) =>
                      line.toLowerCase().includes(searchTerm.toLowerCase())
                    ) || "Title"}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded shadow-lg text-center">
              <p>Are you sure you want to delete this note page?</p>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => {
                    deleteNotePage();
                    setShowDeleteConfirm(false);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Success Modal */}
        {showDeleteSuccess && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded shadow-lg text-center">
              <p>Note page deleted successfully!</p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setShowDeleteSuccess(false)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPage;
