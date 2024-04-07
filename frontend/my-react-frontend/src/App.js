import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import Log from './Log';
import RegisterPage from './RegisterPage'; 
import WelcomePage from './WelcomePage';
import HomePage from './HomePage';
import Page1 from './Page1';
import ChatPage from './ChatPage';
import MapPage from './MapPage';
import ChatGpt from './chatgpt';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/page1" element={<Page1 />} />
        <Route path="/chat" element={<ChatGpt />} />
        <Route path="/map" element={<MapPage />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
