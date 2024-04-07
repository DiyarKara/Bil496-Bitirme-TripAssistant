import React, { useState } from 'react';
import './Style.css'; // Ensure this points to your CSS file's correct path
import config from './config'; // Assuming this exists for project configuration

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [messages, setMessages] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();

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
                setMessages([...messages, data.message]);
                // Optionally, redirect the user to the login page or clear form
            } else {
                // Handle server-side validation errors, for example
                throw new Error(data.message || "An error occurred during registration");
            }
        } catch (error) {
            setMessages([...messages, error.message]);
        }
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
                        <button type="button" className="back-btn">Back</button>
                        <input type="submit" value="Register" className="submit-btn" />
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

export default RegisterPage;
