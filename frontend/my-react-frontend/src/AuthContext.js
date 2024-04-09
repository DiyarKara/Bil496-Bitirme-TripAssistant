import React, { createContext, useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // Log in the user
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    // Log out the user
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        return <Navigate to="/" />;
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
