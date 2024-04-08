import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Style.css'; // Ensure this points to your CSS file's correct path
import { Link } from 'react-router-dom';
import config from './config'; // Assuming this exists for project configuration

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [messages, setMessages] = useState([]);
    const [messageType, setMessageType] = useState(''); // Add this to track message type
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessages([]); // Clear previous messages
        setMessageType(''); // Clear previous message type

        const registrationInfo = { username, email, password };

        try {
            const response = await fetch(`${config.backendURL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationInfo),
            });

            const data = await response.json();

            if (response.ok) {
                setMessages(['Registration successful']);
                setMessageType('success'); // Indicate success message
                setTimeout(() => {
                    navigate('/login'); // Redirect to login after 1 second
                }, 1000);
            } else {
                throw new Error(data.message || "An error occurred during registration");
            }
        } catch (error) {
            setMessages([error.message]);
            setMessageType('error'); // Indicate error message
        }
    };
    const clearFrom = () =>{
        setUsername('');
        setPassword('');
        setEmail('');
        setMessages([]); // Clear previous messages
        setMessageType('');
    }
    // Navigate to the Home page
    const handleNavigateHome = () => {
        clearFrom();
        navigate('/'); // Use navigate to go to the home page
    };

    // Navigate to the About Us page

    return (
        <div className="page-container">
            <header>
                <nav>
                    {/* Make project name clickable without looking like a button */}
                    <span onClick={handleNavigateHome} className="nav-text">{config.projectName}</span>
                    <Link to="/about-us" className="nav-link">About Us</Link>
                </nav>
            </header>
            <main className="form-container">
            <form onSubmit={handleSubmit}>
                    <h2>Register</h2> {/* Form title for consistency */}
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        required
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <div className="form-actions">
                    <button type="button" className="back-btn" onClick={handleNavigateHome}>Back</button>
                        <input type="submit" value="Register" className="submit-btn" />
                    </div>
                    
                    {messages.length > 0 && (
                        <div className={`messages ${messageType}`}>
                            {messages.map((message, index) => (
                                <p key={index}>{message}</p>
                            ))}
                        </div>
                    )}
                </form>
            </main>
        </div>
    );
};

export default RegisterPage;
