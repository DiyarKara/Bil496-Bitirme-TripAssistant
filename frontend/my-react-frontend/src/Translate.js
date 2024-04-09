import React, { useState } from 'react';
import './css/translate.css'; // Make sure to adapt your CSS for React
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import config from './config';


function Translate() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('tr');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'it', name: 'Italian' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ru', name: 'Russian' },
    { code: 'tr', name: 'Turkish' }
    // Add other languages here
  ];
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleTranslate = () => {
    fetch('http://localhost:5000/translate_text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: sourceText,
        sourceLang: sourceLanguage,
        targetLang: targetLanguage
      })
    })
    .then(response => response.json())
    .then(data => {
      setTranslatedText(data.translation);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };
  const handleBack = () => {
    navigate('/'); // Navigates the user to the previous page
  };

  return (
    
  <body className="translate-container">
        <textarea className = "null" id="null" disabled/>
    <header>
                <nav>
                    <span onClick={handleBack} className="nav-text">{config.projectName}</span>
                    <Link to="/home" className="nav-link">Main Page</Link>
                </nav>
            </header>
    <div className="translate-container1">
     <div className ="select-container-top"> 
      <div classname="select-container">
        <select id="sourceLanguage" value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value)}>
        {languages.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
      </div>
      <div classname="select-container">
        <select id="targetLanguage" value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
      </div>
     </div>
     <div className='text-container-top'>
      <div className='text-container'>
      <textarea id="sourceText" placeholder="Enter text to translate..." value={sourceText} onChange={(e) => {
                                                                                                                setSourceText(e.target.value) 
                                                                                                                handleTranslate()}}/>
      </div>
      <div className='text-container'>
      <textarea id="translatedText" placeholder="Translation" value={translatedText} disabled readOnly/>
      </div>
      </div>
    </div>
</body >
  );
}

export default Translate;
