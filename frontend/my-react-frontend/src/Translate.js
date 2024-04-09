import React, { useState } from 'react';
import './translate.css'; // Make sure to adapt your CSS for React

function Translate() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('en');

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

  const swapLanguages = () => {

  };

  return (
  <body className="translate-container">
    <div className="translate-container1">
      <div classname="select-container">
      <select id="sourceLanguage" value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value)}>
      {languages.map(lang => (
          <option key={lang.code} value={lang.code}>{lang.name}</option>
        ))}
      </select>
      <button id="languageSwapButton" onClick={swapLanguages}>Swap</button>

      <select id="targetLanguage" value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>{lang.name}</option>
        ))}
      </select>
      </div>
      <textarea id="sourceText" placeholder="Enter text to translate..." value={sourceText} onChange={(e) => {
                                                                                                                setSourceText(e.target.value) 
                                                                                                                handleTranslate()}}/>        
      <textarea id="translatedText" placeholder="Translation will appear here..." value={translatedText} readOnly/>
    </div>
</body >
  );
}

export default Translate;
