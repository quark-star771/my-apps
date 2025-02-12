import React, { useState } from "react";
import { navigateTo } from "../utils/navigation";
import Avatar from "avataaars"; // Import Avatar component

const HomePage = ({ internalData }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Toggle menu visibility
  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-teal-300 flex flex-col items-center p-5 relative">
      {/* Profile Menu Button (Top Right) */}
      <div className="absolute right-6">
        <button
          onClick={toggleMenu}
          className="relative p-3 bg-white rounded-full shadow-lg hover:bg-gray-200"
        >
          {internalData?.profile?.avatar_url ? (
            <Avatar
              style={{ width: "40px", height: "40px" }}
              {...JSON.parse(internalData.profile.avatar_url)}
            />
          ) : (
            <span className="text-xl">☰</span>
          )}
        </button>
        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
            <ul className="py-2">
              <li>
                <button
                  onClick={() => navigateTo("/profile-setup")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Profile Setup
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo("/avatar-page")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Avatar Page
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo("/login-page")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Login Page
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="bg-green-50 p-8 rounded-lg shadow-lg w-full max-w-4xl mt-24 flex flex-col items-center justify-center space-y-8">
        <h1 className="text-4xl font-bold text-indigo-700 text-center">
          Welcome to My Apps
        </h1>
        <p className="text-lg text-gray-700 text-center max-w-2xl">
          A place to take some notes, talk with others, and relax a little.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-2 gap-4 w-full max-w-2xl">
  <button
    onClick={() => navigateTo("/forum")}
    className="w-full bg-blue-700 text-white py-3 px-5 rounded-lg hover:bg-blue-900 transition duration-200 text-lg"
  >
    Forums
  </button>
  <button
    onClick={() => navigateTo("/notes")}
    className="w-full bg-fuchsia-600 text-white py-3 px-5 rounded-lg hover:bg-fuchsia-800 transition duration-200 text-lg"
  >
    Notes Page
  </button>
  <button
    onClick={() => navigateTo("/weather")}
    className="w-full bg-cyan-300 text-white py-3 px-5 rounded-lg hover:bg-sky-400 transition duration-200 text-lg"
  >
    Weather Dashboard
  </button>
  <button
    onClick={() => navigateTo("/calc")}
    className="w-full bg-emerald-400 text-white py-3 px-5 rounded-lg hover:bg-teal-500 transition duration-200 text-lg"
  >
    Calculator
  </button>
</div>
      </div>
    </div>
  );
};

export default HomePage;
