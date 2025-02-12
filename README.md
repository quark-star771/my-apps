# My Apps

My Apps is a full-stack web application designed to showcase app development skills, featuring a React-based frontend and Firebase-powered backend. It includes essential functionality for user authentication, avatar creation, and user-friendly welcome and home pages. This project highlights versatility and technical proficiency across both frontend and backend development.

---

## Features

### Current Functionality
- **User Authentication**: Secure login and registration using Firebase Authentication.
- **Avatar Creator**: Allows users to customize and save their personal avatars.
- **Welcome and Home Pages**: Intuitive and engaging user interface for navigation.
- **Calculator**: A simple and responsive calculator, supporting basic arithmetic operations.
- **Weather Dashboard**: A dynamic weather dashboard that fetches real-time data, displaying current conditions and a 5-day forecast.
- **Notes Page**: Create, edit, and organize personal notes.
- **Interactive Forum**: A platform for users to ask questions and collaborate.

### Future Aspirations
- **Navigate bar**: Add a navigate bar and additional menus.
- **Profile Viewing**: Add the ability to view profiles for others.
- **QOL Improvements**: There are numerous places for minor improvements.
- **Admin Functionality**: Add admin tools to help manage users and site settings.
- **Enhanced Authentication**: Email verification and other opttions for enhanced auth experience.

---

## Tech Stack

### Frontend
- **React**: A JavaScript library for building user interfaces.
- **Node.js**: Runtime environment for efficient development.
- **Tailwind CSS**: Utility-first CSS framework for styling.

### Backend
- **Firebase Cloud Functions**: Handles backend logic and API endpoints.
- **Firebase Authentication**: Provides secure user authentication.
- **Firestore Database**: Stores user and application data.

---

## Installation

### Prerequisites
- Node.js installed on your machine.
- Firebase CLI installed globally (optional, for deploying functions).
- An OpenWeather API key (you’ll need to set this up locally for the app to function).

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/username/my-apps.git
   ```

2. Navigate to the project directory:
   ```bash
   cd my-apps
   ```

3. Install dependencies for the frontend:
   ```bash
   cd client
   npm install
   ```

4. Install dependencies for the backend:
   ```bash
   cd ../functions
   npm install
   ```

5. Set up your environment variables:
   - Create an `.env` file in the `client` directory.
   - Add your OpenWeather API key like this:
     ```
     REACT_APP_API_KEY=your_openweather_api_key
     ```
   - Optionally, configure any additional environment variables needed for Firebase or other services.

6. Run the frontend:
   ```bash
   cd ../client
   npm start
   ```

7. (Optional) Deploy Firebase Cloud Functions:
   ```bash
   firebase deploy --only functions
   ```

### Note
To run this app locally, you’ll need to configure your own `.env` file with the necessary API keys and environment variables. Without this configuration, the app will not function as expected.

---

## Contributions
Contributions are welcome! Feel free to fork the repository, make improvements, and submit a pull request.

---

## License
This project is licensed under the MIT License. See the LICENSE file for details.
