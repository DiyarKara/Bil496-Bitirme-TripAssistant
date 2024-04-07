import React, { useState } from 'react';
import './Style.css'; // Adjust the path according to your project structure
import config from './config';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [messages, setMessages] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                setMessages([...messages, data.message]);
                clearLoginForm();
            } else {
                throw new Error(data.message || "An error occurred");
            }
        } catch (error) {
            setMessages([...messages, error.message]);
        }
    };

    const clearLoginForm = () => {
        setUsername('');
        setPassword('');
        setMessages([]);
    };
    return (
        <div className="page-container">
            <header>
                <nav>
                    <h1>{config.projectName || "PROJECT NAME"}</h1>
                    <a href="/about-us">About Us</a>
                </nav>
            </header>
            <main className="form-container">
                <form method="post" id="loginForm" onSubmit={handleSubmit}>
                    <h2>Login</h2> {/* Form title */}
                    <input type="text" name="username" placeholder="Username" required value={username} onChange={e => setUsername(e.target.value)} />
                    <input type="password" name="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
                    <div className="form-actions">
                        <button type="button" className="back-btn">Back</button>
                        <input type="submit" value="Login" className="submit-btn" />
                    </div>
                    {messages.length > 0 && (
                        <div className="messages">
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
