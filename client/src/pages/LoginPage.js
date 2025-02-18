import React, { useState } from "react";
import { navigateTo } from "../utils/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase-config";

const LoginPage = ({ setStayLoggedIn, stayLoggedIn, setInternalData, setUser, setWaitTime, setIsInitialized }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle auth sign-in and navigate to home
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigateTo("/");
    } catch (err) {
      setError("Invalid email or password");
      console.error(err.message);
    }
  };

  // Sign up, add user to db, and navigate to profile setup
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      setWaitTime(1);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Navigate immediately to profile setup
      navigateTo("/profile-setup");

      const user = userCredential.user;
      const token = await user.getIdToken();

      // Create user document
      const userResponse = await fetch(
        "https://us-central1-my-apps-a1d3c.cloudfunctions.net/createUserDocument",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            uid: user.uid,
            createdAt: new Date().toISOString(),
            profileId: "",
            email: email,
          }),
        }
      );

      if (!userResponse.ok) {
        throw new Error(`HTTP error! status: ${userResponse.status}`);
      }

      setWaitTime(0);
    } catch (err) {
      console.error("Error during sign-up:", err.message);
      setError("Error during sign-up: " + err.message);
      setWaitTime(0);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      setInternalData(null, null);
      setStayLoggedIn(false);
      setIsInitialized(false);
      await signOut(auth);
    } catch (err) {
      console.error("Failed to logout:", err.message);
    }
  };

  return (
    <div className="min-h-screen bg-teal-300 flex flex-col items-center p-5">
      {/* Home Button */}
      <button
        onClick={() => navigateTo("/")}
        className="fixed top-4 left-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 z-50"
      >
        🏠
      </button>

      {auth.currentUser ? (
        <div className="bg-green-50 p-8 mt-12 rounded-lg shadow-lg w-full max-w-4xl">
          <h1 className="text-2xl font-bold text-center mb-6">Welcome Back!</h1>
          <p className="text-center text-gray-700 mb-6">
            You are logged in as {auth.currentUser.email}
          </p>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="bg-green-50 p-8 mt-12 rounded-lg shadow-lg w-full max-w-4xl">
          <h1 className="text-2xl font-bold text-center mb-6">
            {isSignUp ? "Sign Up" : "Login"}
          </h1>
          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field with Toggle */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-600"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {/* Confirm Password Field (Only for Sign Up) */}
            {isSignUp && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-600"
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            )}

            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={stayLoggedIn}
                  onChange={(e) => setStayLoggedIn(e.target.checked)}
                  className="form-checkbox"
                />
                <span className="ml-2 text-sm text-gray-700">Stay logged in</span>
              </label>
            </div>
            
            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
            >
              {isSignUp ? "Sign Up" : "Login"}
            </button>
          </form>
          
          <p className="text-sm text-center mt-4">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-500 hover:underline"
            >
              {isSignUp ? "Login here" : "Sign up here"}
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
