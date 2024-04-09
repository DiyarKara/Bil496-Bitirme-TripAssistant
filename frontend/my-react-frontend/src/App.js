import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext'; // Ensure AuthContext is implemented as suggested
import ProtectedRoute from './ProtectedRoute'; // Ensure ProtectedRoute is implemented as suggested

import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage'; 
import WelcomePage from './WelcomePage';
import HomePage from './HomePage';
import Translate from './Translate';
import ChatPage from './ChatPage';
import MapPage from './MapPage';
import LoginRoute from './LoginRoute';


function AppWrapper() {
    // Use AuthProvider at the top level to provide authentication context throughout the app
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
}

function App() {
  const { login } = useAuth();

  useEffect(() => {
    // Restore user authentication state from localStorage or other persistence mechanism
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      login(user); // Assuming your login function in AuthContext also sets local storage
    }
  }, [login]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginRoute><LoginPage /></LoginRoute>} />
        <Route path="/register" element={<LoginRoute><RegisterPage /></LoginRoute>} />
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/translate" element={<ProtectedRoute><Translate /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
        {/* Add more routes and wrap them with ProtectedRoute as needed for protection */}
      </Routes>
    </Router>
  );
}

export default AppWrapper;
