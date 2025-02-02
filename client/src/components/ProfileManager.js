import React, { useEffect, useState } from 'react';
import { navigateTo } from '../utils/navigation';
import { auth } from "../firebase-config";
import Avatar from 'avataaars';

const ProfileManager = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all profiles for viewing
  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = auth.currentUser;
      const token = await user.getIdToken();

      // Fetch profiles
      const response = await fetch(
        'https://us-central1-my-apps-a1d3c.cloudfunctions.net/getProfiles',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Check if data contains profiles
      if (!data.profiles || data.profiles.length === 0) {
        setProfiles([]); // No profiles found
      } else {
        setProfiles(data.profiles); // Set profiles
      }
    } catch (err) {
      console.error("Failed to fetch profiles:", err.message);
      setError(err.message); // Set error message
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetchProfiles on component load
  useEffect(() => {
    fetchProfiles();
  }, []);

  return (
    <div className="min-h-screen bg-teal-300 flex flex-col items-center p-5">
      <div className="bg-green-50 p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-700">Profile Manager</h2>

        {loading ? (
          <div className="text-center text-lg text-gray-700">Loading profiles...</div>
        ) : error ? (
          <div className="text-center text-red-500 text-lg">
            Error: {error}
          </div>
        ) : profiles.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <p className="text-gray-700 text-lg">No profiles found. Please create one.</p>
            <button 
              onClick={() => navigateTo('/profile-setup')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create Profile
            </button>
          </div>
        ) : (
          profiles.map((profile) => (
            <div 
              key={profile.id}
              className="bg-white shadow-md rounded-lg p-6 mb-4"
            >
              <p className="text-gray-800 font-bold">Name: <span className="font-normal">{profile.name}</span></p>
              <div className="mb-6 text-center">
                  <div class="flex justify-center">
                      <Avatar
                          style={{ width: '150px', height: '150px' }}
                          avatarStyle={JSON.parse(profile.avatar_url).avatarStyle}
                          topType={JSON.parse(profile.avatar_url).topType}
                          accessoriesType={JSON.parse(profile.avatar_url).accessoriesType}
                          hairColor={JSON.parse(profile.avatar_url).hairColor}
                          facialHairType={JSON.parse(profile.avatar_url).facialHairType}
                          clotheType={JSON.parse(profile.avatar_url).clotheType}
                          clotheColor={JSON.parse(profile.avatar_url).clotheColor}
                          eyeType={JSON.parse(profile.avatar_url).eyeType}
                          eyebrowType={JSON.parse(profile.avatar_url).eyebrowType}
                          mouthType={JSON.parse(profile.avatar_url).mouthType}
                          skinColor={JSON.parse(profile.avatar_url).skinColor}
                      />
                  </div>
              </div>
              <p className="text-gray-800 font-bold">Bio: <span className="font-normal">{profile.bio}</span></p>
              <p className="text-gray-800 font-bold">Joined Date: <span className="font-normal">{new Date(profile.joined_date).toLocaleDateString()}</span></p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProfileManager;
