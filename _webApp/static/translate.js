document.addEventListener('DOMContentLoaded', function() {
    var translateButton = document.getElementById('translateButton');
    translateButton.addEventListener('click', function() {
        var sourceText = document.getElementById('sourceText').value;
        var sourceLanguage = document.getElementById('sourceLanguage').value;
        var targetLanguage = document.getElementById('targetLanguage').value;
        
        if (sourceText.trim() === '') {
            alert('Please enter text to translate.');
            return;
        }

        fetch('/translate_text', {
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
            document.getElementById('translatedText').value = data.translation;
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
