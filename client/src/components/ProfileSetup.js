import React, { useState, useEffect } from "react";
import { app } from "../firebase-config";
import { getAuth } from "firebase/auth";
import { navigateTo } from "../utils/navigation";
import Avatar from 'avataaars';

const auth = getAuth(app);

const ProfileSetup = ({ internalData, saveInternalData }) => {
  const [username, setUsername] = useState("");
  const defaultAvatar = JSON.stringify({"avatarStyle":"Circle","topType":"LongHairMiaWallace","accessoriesType":"Prescription02","hairColor":"BrownDark","facialHairType":"Blank","clotheType":"Hoodie","clotheColor":"PastelBlue","eyeType":"Happy","eyebrowType":"Default","mouthType":"Smile","skinColor":"Tanned"});
  const [avatarUrl, setAvatarUrl] = useState(
    internalData?.profile?.avatar_url || defaultAvatar
  );
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [profileId, setProfileId] = useState(internalData.profile?.id);

  const userId = auth.currentUser.uid;

  // Fetch existing profile data if editing
  useEffect(() => {
    const fetchProfile = async () => {
      // Only fetch one per page load
      if (!fetched) {
        try {
          // Load profile if user already has one
          if (profileId) {
            setLoading(true);
            const currentUser = auth.currentUser;
            const token = await currentUser.getIdToken();

            const response = await fetch(
              "https://us-central1-my-apps-a1d3c.cloudfunctions.net/getProfileByUserId",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userId: userId }),
              }
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const profile = await response.json();

            setUsername(profile.name || "");
            setAvatarUrl(profile.avatar_url || "");
            setBio(profile.bio || "");

            await saveInternalData(internalData.user, profile);
          // Otherwise create a profile record wuth generic values
          // We need have to have a profile record immediately for things to work
          } else {
            const payload = {
              userId: userId,
              name: "",
              bio: bio || "No bio provided.",
              avatar_url: avatarUrl,
            };

            const currentUser = auth.currentUser;
            const token = await currentUser.getIdToken();

            const createResponse = await fetch(
              "https://us-central1-my-apps-a1d3c.cloudfunctions.net/createProfile",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
              }
            );

            if (!createResponse.ok) {
              throw new Error(`HTTP error! status: ${createResponse.status}`);
            }
    
            const createdProfile = await createResponse.json();

            console.log(createdProfile);
          
            setProfileId(createdProfile.id);
            setUsername(createdProfile.name || "");
            setAvatarUrl(createdProfile.avatar_url || "");
            setBio(createdProfile.bio || "");

            await saveInternalData(internalData.user, createdProfile);
          }
        } catch (err) {
          // Log and throw alert for errors
          console.error("Error fetching profile:", err.message);
          alert("Failed to load profile, please refresh page or contact support.");
        } finally {
          // Done loading
          setLoading(false);
          setFetched(true);
        }
      }
    };

    fetchProfile();
  }, []);

  // Handle the save button
  const handleSubmit = async (e, navTo) => {
    e.preventDefault();

    // Altert is missing required fields
    if (!username || !avatarUrl) {
      window.alert("Please fill in a username!");
      return;
    }

    const payload = {
      name: username,
      avatar_url: avatarUrl,
      bio: bio || "No bio provided.",
    };

    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      const token = await currentUser.getIdToken();

      // Update profile
      const response = await fetch(
        "https://us-central1-my-apps-a1d3c.cloudfunctions.net/updateProfile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: profileId, ...payload }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Merge new data with current internal data and save
      const newProfile = {
        ...internalData.profile,
        ...payload,
      };
      await saveInternalData(internalData.user, newProfile);
      
      // Navigate
      if (navTo === 1) {
        navigateTo('/')
      } else {
        navigateTo('/avatar-page')
      }
    } catch (err) {
      console.error("Error saving profile:", err.message);
      alert("Failed to save profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Loading screen
  if (loading) {
    return <div className="bg-loading min-h-screen flex flex-col justify-between">
      <div className="text-center mt-8">
                <h1 className="text-6xl font-bold text-white neon-text">Loading...</h1>
            </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-teal-300 flex flex-col items-center p-5">
        {/* Home Button */}
        <button
            onClick={() => navigateTo('/')}
            className="fixed top-4 left-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 z-50"
        >
            🏠
        </button>

        {/* Move the Edit Avatar Button OUTSIDE the form */}
        <div className="bg-green-50 p-8 mt-12 rounded-lg shadow-lg w-full max-w-4xl">
            <h2 className="text-2xl font-bold text-center mb-6">
                {profileId ? "Edit Your Profile" : "Set Up Your Profile"}
            </h2>

            {/* Edit Avatar Button Outside of Form */}
            <div className="flex justify-center mb-4">
                <button
                    onClick={(e) => handleSubmit(e, 2)}
                    className="px-6 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600"
                >
                    Edit Avatar
                </button>
            </div>

            <form onSubmit={(e) => handleSubmit(e, 1)} className="flex flex-col gap-6">
                <div>
                    <label className="block text-gray-700 font-medium mb-2">Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="Enter your username"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                {/* Avatar Section (No Button Inside Here) */}
                <div>
                    <label className="block text-gray-700 font-medium mb-2">Avatar:</label>
                    <div className="mb-6 text-center">
                        <div className="flex justify-center">
                            <Avatar
                                style={{ width: '200px', height: '200px' }}
                                {...JSON.parse(avatarUrl)}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-2">Bio (optional):</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us a little about yourself!"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                {/* Save Button */}
                <button
                    type="submit"
                    className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600"
                >
                    {profileId ? "Save Changes" : "Save Profile"}
                </button>
            </form>
        </div>
    </div>
  );
};

export default ProfileSetup;
