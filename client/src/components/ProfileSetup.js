import React, { useState, useEffect } from "react";
import { app } from "../firebase-config";
import { getAuth } from "firebase/auth";
import { navigateTo } from "../utils/navigation";
import Avatar from 'avataaars';

const auth = getAuth(app);

const ProfileSetup = ({ internalData, saveInternalData }) => {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false); // Prevent multiple fetches

  const avatarData = internalData.profile?.avatar_url
    ? JSON.parse(internalData.profile.avatar_url)
    : {};
  
  // State for each avatar property
  const [avatarStyle, setAvatarStyle] = useState(avatarData.avatarStyle || 'Circle');
  const [topType, setTopType] = useState(avatarData.topType || 'LongHairMiaWallace');
  const [accessoriesType, setAccessoriesType] = useState(avatarData.accessoriesType || 'Prescription02');
  const [hairColor, setHairColor] = useState(avatarData.hairColor || 'BrownDark');
  const [facialHairType, setFacialHairType] = useState(avatarData.facialHairType || 'Blank');
  const [clotheType, setClotheType] = useState(avatarData.clotheType || 'Hoodie');
  const [clotheColor, setClotheColor] = useState(avatarData.clotheColor || 'PastelBlue');
  const [eyeType, setEyeType] = useState(avatarData.eyeType || 'Happy');
  const [eyebrowType, setEyebrowType] = useState(avatarData.eyebrowType || 'Default');
  const [mouthType, setMouthType] = useState(avatarData.mouthType || 'Smile');
  const [skinColor, setSkinColor] = useState(avatarData.skinColor || 'Tanned');
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

            if (profile) {
              const newAvatarData = profile.avatar_url
              ? JSON.parse(internalData.profile.avatar_url)
              : {};

              setUsername(profile.name || "");
              setAvatarUrl(profile.avatar_url || "");
              setBio(profile.bio || "");
              setAvatarStyle(newAvatarData.avatarStyle || 'Circle');
              setTopType(newAvatarData.topType || 'LongHairMiaWallace');
              setAccessoriesType(newAvatarData.accessoriesType || 'Prescription02');
              setHairColor(newAvatarData.hairColor || 'BrownDark');
              setFacialHairType(newAvatarData.facialHairType || 'Blank');
              setClotheType(newAvatarData.clotheType || 'Hoodie');
              setClotheColor(newAvatarData.clotheColor || 'PastelBlue');
              setEyeType(newAvatarData.eyeType || 'Happy');
              setEyebrowType(newAvatarData.eyebrowType || 'Default');
              setMouthType(newAvatarData.mouthType || 'Smile');
              setSkinColor(newAvatarData.skinColor || 'Tanned');

              await saveInternalData(internalData.user, profile);
            }
          // Otherwise create a profile record wuth generic values
          // We need have to have a profile record immediately for things to work
          } else {
            const payload = {
              userId: userId,
              name: username,
              bio: bio || "No bio provided.",
              avatar_url: JSON.stringify({
                  avatarStyle,
                  topType,
                  accessoriesType,
                  hairColor,
                  facialHairType,
                  clotheType,
                  clotheColor,
                  eyeType,
                  eyebrowType,
                  mouthType,
                  skinColor,
              }),
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

            await saveInternalData(internalData.user, createdProfile);
            setProfileId(createdProfile.id);
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
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Altert is missing required fields
    if (!username || !avatarUrl) {
      alert("Please fill in a username!");
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
      //Alert user and navigate to home
      navigateTo('/');
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
      <div className="bg-green-50 p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-center mb-6">
          {profileId ? "Edit Your Profile" : "Set Up Your Profile"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
          <div>
            <label className="block text-gray-700 font-medium mb-2">Avatar:</label>
              <div className="mb-6 text-center">
                <div class="flex justify-center">
                    <Avatar
                        style={{ width: '200px', height: '200px' }}
                        avatarStyle={avatarStyle}
                        topType={topType}
                        accessoriesType={accessoriesType}
                        hairColor={hairColor}
                        facialHairType={facialHairType}
                        clotheType={clotheType}
                        clotheColor={clotheColor}
                        eyeType={eyeType}
                        eyebrowType={eyebrowType}
                        mouthType={mouthType}
                        skinColor={skinColor}
                    />
                </div>
            </div>
          </div>
          <button
            onClick={() => navigateTo('/avatar-page')}
            className="w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600"
          >
            Edit Avatar
          </button>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Bio (optional):</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a little about yourself!"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
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
