import React, { useState } from 'react';
import Avatar from 'avataaars';
import { auth } from "../firebase-config";
import { navigateTo } from "../utils/navigation";

const AvatarPage = ({ internalData, saveInternalData }) => {
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

    // Dropdown options
    const avatarStyles = ['Circle', 'Transparent'];
    const topTypes = [
        'Eyepatch', 'HairColor', 'Hat', 'Hijab', 'LongHairBigHair', 'LongHairBob',
        'LongHairBun', 'LongHairCurly', 'LongHairCurvy', 'LongHairDreads', 'LongHairFrida', 'LongHairFro',
        'LongHairFroBand', 'LongHairMiaWallace', 'LongHairNotTooLong', 'LongHairShavedSides', 'LongHairStraight',
        'LongHairStraight2', 'LongHairStraightStrand', 'NoHair', 'ShortHairDreads01', 'ShortHairDreads02',
        'ShortHairFrizzle', 'ShortHairShaggy', 'ShortHairShaggyMullet', 'ShortHairShortCurly', 'ShortHairShortFlat',
        'ShortHairShortRound', 'ShortHairShortWaved', 'ShortHairSides', 'ShortHairTheCaesar', 'ShortHairTheCaesarSidePart',
        'Turban', 'WinterHat1', 'WinterHat2', 'WinterHat3', 'WinterHat4'
    ];
    const accessoriesTypes = ['Blank', 'Kurt', 'Prescription01', 'Prescription02', 'Round', 'Sunglasses', 'Wayfarers'];
    const hairColors = ['Auburn', 'Black', 'Blonde', 'Blue', 'BlondeGolden', 'Brown', 'BrownDark', 'PastelPink', 'Platinum', 'Red', 'SilverGray'];
    const facialHairTypes = ['BeardLight', 'BeardMajestic', 'BeardMedium', 'Blank', 'MoustacheFancy', 'MoustacheMagnum'];
    const clotheTypes = [
        'BlazerShirt', 'BlazerSweater', 'CollarSweater', 'Graphics', 'GraphicShirt', 'Hoodie', 'Overall', 'ShirtCrewNeck', 'ShirtScoopNeck', 'ShirtVNeck'
    ];
    const clotheColors = [
        'Black', 'Blue01', 'Blue02', 'Blue03', 'Gray01', 'Gray02', 'Heather', 'PastelBlue', 'PastelGreen',
        'PastelOrange', 'PastelRed', 'PastelYellow', 'Pink', 'Red', 'White'
    ];
    const eyeTypes = ['Close', 'Cry', 'Default', 'Dizzy', 'EyeRoll', 'Happy', 'Hearts', 'Side', 'Squint', 'Surprised', 'Wink', 'WinkWacky'];
    const eyebrowTypes = [
        'Angry', 'AngryNatural', 'Default', 'DefaultNatural', 'FlatNatural', 'FrownNatural', 'RaisedExcited', 'RaisedExcitedNatural',
        'SadConcerned', 'SadConcernedNatural', 'UnibrowNatural', 'UpDown', 'UpDownNatural'];
    const mouthTypes = [
        'Concerned', 'Default', 'Disbelief', 'Eating', 'Grimace', 'index', 'Sad', 'ScreamOpen', 'Serious', 'Smile', 'Tongue', 'Twinkle', 'Vomit'
    ];
    const skinColors = ['Tanned', 'Yellow', 'Pale', 'Light', 'Brown', 'DarkBrown', 'Black'];

    // Save avatar string/url to profile
    const handleSave = async () => {
        const currentUser = auth.currentUser;
        try {
            const token = await currentUser.getIdToken();
            const payload = {
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
    
            const response = await fetch(
                "https://us-central1-my-apps-a1d3c.cloudfunctions.net/updateProfile",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ id: internalData.profile.id, ...payload }),
                }
            );
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Integrate the new url into internal data
            const newProfile = {
                ...internalData.profile,
                ...payload,
            };

            saveInternalData(internalData.user, newProfile);

            // Redirect to homepage
            navigateTo('/profile-setup');
        } catch (error) {
            console.error('Failed to save avatar:', error);
            alert('An error occurred while saving your avatar. Please try again.');
        }
    };

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
                <h2 className="text-center text-2xl font-bold mb-6">Customize Your Avatar</h2>
                
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

                {/*Scrollable Container*/}
                <div
                    className="overflow-y-auto max-h-[400px] bg-white p-4 rounded-lg shadow-inner"
                    style={{ border: '1px solid #e5e7eb' }}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Avatar Style */}
                        <div>
                            <label className="block text-gray-700 mb-2">Avatar Style</label>
                            <select
                                className="w-full px-4 py-2 border rounded"
                                value={avatarStyle}
                                onChange={(e) => setAvatarStyle(e.target.value)}
                            >
                                {avatarStyles.map((style) => (
                                    <option key={style} value={style}>
                                        {style}
                                    </option>
                                ))}
                            </select>
                        </div>

                         {/* Top Type */}
                        <div>
                            <label className="block text-gray-700 mb-2">Top Type</label>
                            <select
                                className="w-full px-4 py-2 border rounded"
                                value={topType}
                                onChange={(e) => setTopType(e.target.value)}
                            >
                                {topTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Accessories */}
                        <div>
                            <label className="block text-gray-700 mb-2">Accessories</label>
                            <select
                                className="w-full px-4 py-2 border rounded"
                                value={accessoriesType}
                                onChange={(e) => setAccessoriesType(e.target.value)}
                            >
                                {accessoriesTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Hair Color */}
                        <div>
                            <label className="block text-gray-700 mb-2">Hair Color</label>
                            <select
                                className="w-full px-4 py-2 border rounded"
                                value={hairColor}
                                onChange={(e) => setHairColor(e.target.value)}
                            >
                                {hairColors.map((color) => (
                                    <option key={color} value={color}>
                                        {color}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Facial Hair Types */}
                        <div>
                            <label className="block text-gray-700 mb-2">Facial Hair</label>
                            <select
                                className="w-full px-4 py-2 border rounded"
                                value={facialHairType}
                                onChange={(e) => setFacialHairType(e.target.value)}
                            >
                                {facialHairTypes.map((color) => (
                                    <option key={color} value={color}>
                                        {color}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Clothing Type */}
                        <div>
                            <label className="block text-gray-700 mb-2">Clothing</label>
                            <select
                                className="w-full px-4 py-2 border rounded"
                                value={clotheType}
                                onChange={(e) => setClotheType(e.target.value)}
                            >
                                {clotheTypes.map((color) => (
                                    <option key={color} value={color}>
                                        {color}
                                    </option>
                                ))}
                            </select>
                        </div>


                        {/* Clothing Color */}
                        <div>
                            <label className="block text-gray-700 mb-2">Clothing Color</label>
                            <select
                                className="w-full px-4 py-2 border rounded"
                                value={clotheColor}
                                onChange={(e) => setClotheColor(e.target.value)}
                            >
                                {clotheColors.map((color) => (
                                    <option key={color} value={color}>
                                        {color}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Eye Type */}
                        <div>
                            <label className="block text-gray-700 mb-2">Eye Type</label>
                            <select
                                className="w-full px-4 py-2 border rounded"
                                value={eyeType}
                                onChange={(e) => setEyeType(e.target.value)}
                            >
                                {eyeTypes.map((color) => (
                                    <option key={color} value={color}>
                                        {color}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Eyebrow Type */}
                        <div>
                            <label className="block text-gray-700 mb-2">Eyebrow Type</label>
                            <select
                                className="w-full px-4 py-2 border rounded"
                                value={eyebrowType}
                                onChange={(e) => setEyebrowType(e.target.value)}
                            >
                                {eyebrowTypes.map((color) => (
                                    <option key={color} value={color}>
                                        {color}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Mouth Types */}
                        <div>
                            <label className="block text-gray-700 mb-2">Mouth Types</label>
                            <select
                                className="w-full px-4 py-2 border rounded"
                                value={mouthType}
                                onChange={(e) => setMouthType(e.target.value)}
                            >
                                {mouthTypes.map((color) => (
                                    <option key={color} value={color}>
                                        {color}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Skin Color */}
                        <div>
                            <label className="block text-gray-700 mb-2">Skin Color</label>
                            <select
                                className="w-full px-4 py-2 border rounded"
                                value={skinColor}
                                onChange={(e) => setSkinColor(e.target.value)}
                            >
                                {skinColors.map((color) => (
                                    <option key={color} value={color}>
                                        {color}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-center">
                    <button
                        className="bg-blue-500 text-white w-full max-w-4xl px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-200"
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvatarPage;
