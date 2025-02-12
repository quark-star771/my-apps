import React, { useState, useEffect } from "react";
import { unstable_HistoryRouter as HistoryRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase-config";

import HomePage from './pages/HomePage';
import ProfileSetup from './components/ProfileSetup';
// import ProfileManager from './components/ProfileManager';
import LoginPage from './pages/LoginPage';
import AvatarPage from './pages/AvatarPage';
import WelcomePage from './pages/WelcomePage';
import Calculator from './pages/Calculator';
import WeatherDashboard from './components/WeatherDashboard';
import NotesPage from './pages/NotesPage';
import ForumPage from './pages/ForumPage';
import ThreadPage from './pages/ThreadPage';
import { history } from './utils/history';
import { navigateTo } from './utils/navigation';

// Reusable ProtectedRoute Component
const ProtectedRoute = ({ user, authLoading, children }) => {
  // Show a loading screen until everything initializes
  if (authLoading) {
    return <div className="bg-loading min-h-screen flex flex-col justify-between">
      <div className="text-center mt-8">
                <h1 className="text-6xl font-bold text-white neon-text">Loading...</h1>
            </div>
    </div>;
  }

  // Check if user is authenticated, if not navigate to welcome page
  if (!user) {
    return <Navigate to="/welcome" />;
  }

  // Otherwise, allow access to the route
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(() =>
    JSON.parse(localStorage.getItem("stayLoggedIn")) || false
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [waitTime, setWaitTime] = useState(0);
  
  // An  attempt at a wait function, due to useEffect caching it acts as a pause if getMs > 0.
  // I am, however, still using this pause functionality to my advantage.
  const wait = async (getMs) => {
    let remainingTime = getMs();
    while (remainingTime > 0) {
      const step = Math.min(remainingTime, 100);
      await new Promise((resolve) => setTimeout(resolve, step));
      remainingTime = getMs();
    }
  };

  // Our internal data which we'll pass around between pages
  const [internalData, setInternalData] = useState({
    user: null,
    profile: null,
  });

  // Save internal data based on persistence option (session, local)
  const saveInternalData = async (userData, profileData) => {
    setInternalData({
      user: userData,
      profile: profileData,
    });

    const storage = stayLoggedIn ? localStorage : sessionStorage;
    storage.setItem("userData", JSON.stringify(userData));
    storage.setItem("profileData", JSON.stringify(profileData));

    return Promise.resolve();
  };

  // Primary app init, load user and profile data
  const initializeAppData = async (currentUser) => {
    try {
      // Set loading and wait if needed
      setAuthLoading(true);
      await wait(() => waitTime);
  
      const token = await currentUser.getIdToken();
      const uid = currentUser.uid;
  
      // Fetch user document
      const userResponse = await fetch(
        'https://us-central1-my-apps-a1d3c.cloudfunctions.net/getUserDocument',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ uid }),
        }
      );
  
      if (!userResponse.ok) {
        throw new Error(`HTTP error! status: ${userResponse.status}`);
      }
  
      const userData = await userResponse.json();

      // If we're authenticated but don't have a user document we have an issue
      if (!userData || !userData.exists) {
        setErrorMessage("Error getting user data, please contact support.");
        await logout();
        return;
      }

      // Set user, allowing access to protected routes
      setUser(currentUser);

      // Update Last Login time
      const updateUserDocument = await fetch(
        "https://us-central1-my-apps-a1d3c.cloudfunctions.net/updateLastLogin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!updateUserDocument.ok) {
        throw new Error(`HTTP error! status: ${updateUserDocument.status}`);
      }

      // Fetch profile data
      const profileResponse = await fetch(
        'https://us-central1-my-apps-a1d3c.cloudfunctions.net/getProfileByUserId',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: userData.data.userId }),
        }
      );

      if (!profileResponse.ok) {
        throw new Error(`HTTP error! status: ${profileResponse.status}`);
      }

      const profileData = await profileResponse.json();

      // If we're missing required profile fields or it doesn't exist then route to setup
      if (!profileData.id || !profileData.name || !profileData.exists) {
        setErrorMessage("Please create a new profile!");
        // Update internal state first, stop loading then route
        await saveInternalData(userData.data, null );
        setIsInitialized(true);
        navigateTo('/profile-setup');
      }

      // Save the loaded data and stop loading
      await saveInternalData(userData.data, profileData);
      setIsInitialized(true);
    } catch (err) {
      // If error then log to console, show error box to user and perform a logout
      setErrorMessage("Error initializing app data, please contact support.");
      console.error("Error initializing app data:", err.message);
      await logout();
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle logout
  const logout = async () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    setStayLoggedIn(false);
    setIsInitialized(false);
    await signOut(auth);
  }

  // Combined useEffect for Authentication State Changes and Persistence
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Initialize only if not already done
        if (!isInitialized) {
          await initializeAppData(currentUser);
        }
      } else {
        // Reset variables just in case
        setUser(null);
        setAuthLoading(false);
        // Navigate to welcome.
        // Using wait here as there is a needed delay on sign-up between firebase to db,
        // which caused it to route to welcome for a few seconds before continuing.
        // This prevents that.
        if (waitTime === 0)
            navigateTo('/welcome');
      }
    });
  
    return () => unsubscribe();
  }, [auth, waitTime]);

  // Set persistence mode immediately upon toggle
  useEffect(() => {
    const persistenceMode = stayLoggedIn
        ? browserLocalPersistence
        : browserSessionPersistence;

      setPersistence(auth, persistenceMode);
      localStorage.setItem("stayLoggedIn", JSON.stringify(stayLoggedIn));
  }, [stayLoggedIn]);

  return (
    <div className="relative min-h-screen">
      {/* Error Modal */}
      {errorMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold text-red-600">Notification</h2>
            <p className="text-gray-700 mt-4">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage("")}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
  
      {/* Routing */}
      <HistoryRouter history={history}>
        <Routes>
          {/* Public Routes */}
          <Route
            exact
            path="/welcome"
            element={
                <WelcomePage />
            }
          />
          <Route
            exact
            path="/login-page"
            element={
                <LoginPage
                  setStayLoggedIn={setStayLoggedIn}
                  stayLoggedIn={stayLoggedIn}
                  setInternalData={setInternalData}
                  setUser={setUser}
                  setWaitTime={setWaitTime}
                  setIsInitialized={setIsInitialized}
                />
            }
          />
          {/* Protected Routes */}
          <Route
            exact
            path="/"
            element={
              <ProtectedRoute user={user} authLoading={authLoading}>
                <HomePage
                  internalData={internalData}
                />
              </ProtectedRoute>
            }
          />
          <Route
            exact
            path="/avatar-page"
            element={
              <ProtectedRoute user={user} authLoading={authLoading}>
                <AvatarPage
                  internalData={internalData}
                  saveInternalData={saveInternalData}
                />
              </ProtectedRoute>
            }
          />
          <Route
            exact
            path="/profile-setup"
            element={
              <ProtectedRoute user={user} authLoading={authLoading}>
                <ProfileSetup
                  internalData={internalData}
                  saveInternalData={saveInternalData}
                />
              </ProtectedRoute>
            }
          />
          {/*
              ** Removing route for now, will add admin functionality later.
          <Route
            exact
            path="/profile-manager"
            element={
              <ProtectedRoute user={user} authLoading={authLoading}>
                <ProfileManager />
              </ProtectedRoute>
            }
          />
          */}
          <Route
            exact
            path="/calc"
            element={
              <ProtectedRoute user={user} authLoading={authLoading}>
                <Calculator />
              </ProtectedRoute>
            }
          />
          <Route
            exact
            path="/weather"
            element={
              <ProtectedRoute user={user} authLoading={authLoading}>
                <WeatherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            exact
            path="/notes"
            element={
              <ProtectedRoute user={user} authLoading={authLoading}>
                <NotesPage />
              </ProtectedRoute>
            }
          />
          <Route
            exact
            path="/forum"
            element={
              <ProtectedRoute user={user} authLoading={authLoading}>
                <ForumPage
                  internalData={internalData}
                />
              </ProtectedRoute>
            }
          />
          <Route
            exact
            path="/thread/:threadId"
            element={
              <ProtectedRoute user={user} authLoading={authLoading}>
                <ThreadPage
                  internalData={internalData}
                />
              </ProtectedRoute>
            }
          />
        </Routes>
      </HistoryRouter>
    </div>
  );
}

export default App;
