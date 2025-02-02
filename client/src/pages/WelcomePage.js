import React from 'react';
import { navigateTo } from '../utils/navigation';

const WelcomePage = () => {
    return (
        <div className="bg-custom min-h-screen flex flex-col justify-between">
            <div className="text-center mt-8">
                <h1 className="text-6xl font-bold text-white neon-text">Welcome to My Apps</h1>
            </div>
            <div className="text-center mb-8">
                <p className="text-5xl font-bold text-white neon-text mb-6">Let's make life a little easier.</p>
                <button
                    onClick={() => navigateTo('/login-page')}
                    className="w-full max-w-xs mx-auto bg-cyan-400 text-black py-3 px-5 rounded-lg hover:bg-purple-700 transition duration-200 text-lg"
                >
                    Login Page
                </button>
            </div>
        </div>
    );
};

export default WelcomePage;
