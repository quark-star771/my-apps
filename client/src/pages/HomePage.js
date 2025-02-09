import React from 'react';
import { navigateTo } from '../utils/navigation';

const HomePage = () => {

  return (
    <div className="min-h-screen bg-teal-300 flex flex-col items-center p-5">
      <div className="bg-green-50 p-8 rounded-lg shadow-lg w-full max-w-4xl flex flex-col items-center justify-center space-y-8">
        <h1 className="text-4xl font-bold text-indigo-700 text-center">
          Welcome to My Apps
        </h1>
        <p className="text-lg text-gray-700 text-center max-w-2xl">
          A place to take some notes, talk with strangers and relax a little.
        </p>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
          <button
            onClick={() => navigateTo('/login-page')}
            className="w-full bg-indigo-600 text-white py-3 px-5 rounded-lg hover:bg-indigo-700 transition duration-200 text-lg"
          >
            Login Page
          </button>
          {/*
          ** Hiding for now, will implement admin approach on next round.
          <button
            onClick={() => navigateTo('/profile-manager')}
            className="w-full bg-green-600 text-white py-3 px-5 rounded-lg hover:bg-green-700 transition duration-200 text-lg"
          >
            Profile Manager
          </button>
          */}
          <button
            onClick={() => navigateTo('/profile-setup')}
            className="w-full bg-purple-600 text-white py-3 px-5 rounded-lg hover:bg-purple-700 transition duration-200 text-lg"
          >
            Profile Setup
          </button>
          <button
            onClick={() => navigateTo('/avatar-page')}
            className="w-full bg-purple-600 text-white py-3 px-5 rounded-lg hover:bg-purple-700 transition duration-200 text-lg"
          >
            Avatar Page
          </button>
          <button
            onClick={() => navigateTo('/calc')}
            className="w-full bg-amber-400 text-white py-3 px-5 rounded-lg hover:bg-amber-600 transition duration-200 text-lg"
          >
            Calculator
          </button>
          <button
            onClick={() => navigateTo('/weather')}
            className="w-full bg-cyan-300 text-white py-3 px-5 rounded-lg hover:bg-sky-400 transition duration-200 text-lg"
          >
            Weather Dashboard
          </button>
          <button
            onClick={() => navigateTo('/notes')}
            className="w-full bg-fuchsia-600 text-white py-3 px-5 rounded-lg hover:bg-fuchsia-800 transition duration-200 text-lg"
          >
            Notes Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
