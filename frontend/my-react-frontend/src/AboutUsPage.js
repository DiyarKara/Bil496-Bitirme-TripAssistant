import React from 'react';
import { Link } from 'react-router-dom';
import './css/Style.css'; // Adjust the path according to your project structure
import config from './config';
var para1 = "Welcome to the adventure of three driven brains setting out to transform the artificial intelligence landscape. We are three (Team Valore)\n committed college students who are brought together by our passion for artificial intelligence (AI) and its enormous potential to influence the future."
const AboutUsPage = () => {
    return (
        <div className='page'>
            <div className="page-container">
                <header>
                    <nav>
                        <span className="nav-text">{config.projectName}</span>
                        <Link to="/" className="nav-link">Back to Home</Link>
                    </nav>
                </header>
                <textarea id="null" disabled/>
                <main className="form-container">
                    <h2>About Us</h2>
                    <p>
                     Welcome to the adventure of three driven brains setting out to transform the artificial intelligence landscape.
                    </p>
                    <p>
                     We are three (Team Valore)\n committed college students who are brought together by our passion for
                    </p>
                    <p>
                     artificial intelligence (AI) and its enormous potential to influence the future.
                    </p>
                    <p>
                     Meet the team:
                    </p>
                    <p>
                        1. Diyar Serhat Kara
                    </p>
                    <p>
                        2. Ahmet Küçükdağ
                    </p>
                    <p>
                        3. Yiğit Necati Yelmenoğlu
                    </p>
                </main>
            </div>
        </div>
    );
};

export default AboutUsPage;
