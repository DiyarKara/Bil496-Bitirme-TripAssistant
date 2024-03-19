document.addEventListener('DOMContentLoaded', function() {
    // Your code here
    var saveChatButton = document.getElementById('saveChat');
    if (saveChatButton) {
        saveChatButton.addEventListener('click', function() {
            // Event handler code
        });
    } else {
        console.error('Save chat button not found');
    }
});

document.getElementById('chatForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    var chatInput = document.getElementById('chatInput');
    var message = chatInput.value.trim();
    
    if (message) {
        addMessageToChat('user-message', message);
        chatInput.value = '';

        // Here you can integrate an actual chatbot response.
        setTimeout(function() {
            addMessageToChat('chatbot-message', "This is a static response. Integrate with a chatbot API for dynamic replies.");
        }, 1000);
    }
});

function addMessageToChat(className, message) {
    var chatBox = document.getElementById('chatBox');
    var messageElement = document.createElement('div');
    messageElement.className = 'message ' + className;

    // Prepend "User:" or "System:" based on the message class
    var senderPrefix = className.includes('user-message') ? 'User: ' : 'System: ';
    messageElement.textContent = senderPrefix + message;

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
}

var chatLogList = document.querySelector('.chat-log-list');
var saveChatButton = document.getElementById('saveChat');
var savedChats = [];
var chatIdCounter = 1;
var currentChatId = null; 

saveChatButton.addEventListener('click', function() {
    var chatMessages = document.querySelectorAll('.chat-box .message');
    var chatLogMessages = Array.from(chatMessages).map(message => message.textContent);

    fetch('/save_chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({messages: chatLogMessages})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.chat_log_id) {
            // Add new chat log to the list
            var chatLogList = document.querySelector('.chat-log-list');
            var logItem = document.createElement('div');
            logItem.textContent = 'Chat ' + data.chat_log_id;
            logItem.className = 'log-item';
            logItem.onclick = function() {
                displayChatLog(data.chat_log_id);
            };
            chatLogList.appendChild(logItem);
        }
    });
});

function updateChatLogList() {
    // Get the chat controls container to preserve it
    var chatControls = document.getElementById('chatControls');

    // Clear existing logs, but preserve the chat controls
    chatLogList.innerHTML = '';
    chatLogList.appendChild(chatControls);

    savedChats.forEach(function(log, index) {
        var logItem = document.createElement('div');
        logItem.textContent = 'Chat ' + log.id;
        logItem.className = 'log-item';
        logItem.onclick = function() {
            displayChatLog(index);
        };
        chatLogList.appendChild(logItem);
    });
}

function displayChatLog(chatLogId) {
    // Find the chat log by ID
    var selectedLog = savedChats.find(log => log.id === chatLogId);
    if (selectedLog) {
        // Display the messages from the selected log
        var chatBox = document.getElementById('chatBox');
        chatBox.innerHTML = ''; // Clear current chat
        selectedLog.messages.forEach(function(message) {
            var messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            messageDiv.textContent = message;
            chatBox.appendChild(messageDiv);
        });
    }
}

document.getElementById('newChat').addEventListener('click', function() {
    document.getElementById('chatBox').innerHTML = '';
    currentChatId = null; // Reset currentChatId for a new chat session
});

