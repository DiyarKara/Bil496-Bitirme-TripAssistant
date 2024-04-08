import React from 'react';
import { Link } from 'react-router-dom';
import './Style.css';

const WelcomePage = () => {
    return (
        <div className="page-container">
            <header>
                <nav>
                    <h1>Welcome to TripAssistantAI</h1>
                    <div>
                        <Link to="/about-us" className="nav-link">About Us</Link>
                        <Link to="/register" className="nav-link">Register</Link>
                        <Link to="/login" className="nav-link">Login</Link>
                    </div>
                </nav>
            </header>
            <main style={{ padding: '20px' }}>
                <p>Welcome to your first trip with TripAssistantAI! Get started by registering or logging in.</p>
            </main>
        </div>
    );
}

export default WelcomePage;
