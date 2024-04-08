import React from 'react';
import { Link } from 'react-router-dom';
import './Style.css';
import { useNavigate } from 'react-router-dom';
import config from './config';

const HandleNavigateHome = () => {
    const navigate = useNavigate();
    navigate('/'); // Navigate function to go to the Home page
};
const WelcomePage = () => {
    return (
        <div className="page-container">
            <header>
                <nav>
                    <span onClick={HandleNavigateHome} className="nav-text">{config.projectName}</span>
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
