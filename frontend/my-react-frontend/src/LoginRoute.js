import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Adjust the path as necessary

const LoginRoute = ({ children }) => {
    const { user, logout} = useAuth();

    if (user) {
        logout();
        return <Navigate to="/home" />;
    }

    return children;
};

export default LoginRoute; // Make sure this export matches the file name and component
