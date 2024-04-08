import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './Style.css'; // Adjust the path according to your project structure
import config from './config';
import { useAuth } from './AuthContext';
import { useDispatch } from 'react-redux';
import { setUserInfo } from './userActions';

const LoginPage = () => {
    const dispatch = useDispatch();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [messages, setMessages] = useState([]);
    const [messageType, setMessageType] = useState(''); // new state to track the type of message
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessages([]);
        const loginInfo = { username, password };

        try {
            const response = await fetch(`${config.backendURL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginInfo),
            });

            const data = await response.json();

            if (response.ok) {
                clearLoginForm();
                setMessageType('messages-success');
                setMessages(['Login successful']); // Set message type to success
                login(data);
                dispatch(setUserInfo(data));
                setTimeout(() => {
                    navigate('/home'); // Replace '/home' with your home route
                }, 1000);
            } else {
                throw new Error(data.message || "An error occurred");
            }
        } catch (error) {
            setMessages([error.message]);
            setMessageType('messages-error');
        }
    };

    const clearLoginForm = () => {
        setUsername('');
        setPassword('');
        setMessages([]);
    };
    const handleBack = () => {
        clearLoginForm();
        navigate('/'); // Navigates the user to the previous page
    };
    return (
        <div className="page-container">
            <header>
                <nav>
                    <span onClick={handleBack} className="nav-text">{config.projectName}</span>
                    <Link to="/about-us" className="nav-link">About Us</Link>
                </nav>
            </header>
            <main className="form-container">
                <form method="post" id="loginForm" onSubmit={handleSubmit}>
                    <h2>Login</h2> {/* Form title */}
                    <input type="text" name="username" placeholder="Username" required value={username} onChange={e => setUsername(e.target.value)} />
                    <input type="password" name="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
                    <div className="form-actions">
                        <button type="button" className="back-btn" onClick={handleBack}>Back</button>
                        <input type="submit" value="Login" className="submit-btn" />
                    </div>
                    {messages.length > 0 && (
                        <div className={`${messageType}`}>
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

export default LoginPage;
