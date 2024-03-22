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
    fetch('/get_chats')
    .then(response => response.json())
    .then(data => {
        savedChats = data;
        updateChatLogList();
    });
});

document.getElementById('chatForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    var chatInput = document.getElementById('chatInput');
    var message = chatInput.value.trim();
    
    if (message) {
        addMessageToChat('user-message', message);
        chatInput.value = '';

        

        setTimeout(function() {
            fetch('/process_message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({message: message})
            })
            .then(response => response.json())
            .then(data => {
                console.log('Response:', data); // Debugging line
                // Display the results in your chat interface
                if (data.response) {
                    addMessageToChat('chatbot-message', data.response);
                } else {
                    console.error('No response received');
                }
            })
            .catch(error => {
                console.error('Error:', error); // Error handling
            });
        }, 1000);
    }
});



document.addEventListener('DOMContentLoaded', function() {
    var newChatButton = document.getElementById('newChatButton');
    if (newChatButton) {
        newChatButton.addEventListener('click', function() {
            // Create a new chat log
            createNewChatLog();
        });
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

console.log("chat log list is: ", chatLogList)

saveChatButton.addEventListener('click', function() {
    var chatMessages = document.querySelectorAll('.chat-box .message');
    var chatLogMessages = Array.from(chatMessages).map(function(messageElement) {
        return messageElement.textContent;
    });

    var payload = {
        messages: chatLogMessages
    };

    if (currentChatId) {
        payload.chat_log_id = currentChatId;
    }

    fetch('/save_chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (data.success && data.chat_log_id) {
            var updatedLog = {
                id: data.chat_log_id,
                messages: chatLogMessages
            };

            var existingLogIndex = savedChats.findIndex(log => log.id === data.chat_log_id);
            if (existingLogIndex >= 0) {
                // Update existing log
                savedChats[existingLogIndex] = updatedLog;
            } else {
                // Add new log
                savedChats.push(updatedLog);
            }

            // Update the chat log list in UI
            updateChatLogList();

            console.log('Chat saved with ID:', data.chat_log_id);
        } else {
            console.error('Error saving chat:', data.error);
        }
    })
    .catch(function(error) {
        console.error('Failed to save chat:', error);
    });
});

function updateChatLogList() {
    // Ensure chatLogList is defined
    if (!chatLogList) {
        console.error('Chat log list element not found');
        return;
    }

    // Clear existing logs
    chatLogList.innerHTML = '';

    // Iterate over savedChats and create log items
    savedChats.forEach(function(log) {
        var logItem = document.createElement('div');
        logItem.textContent = 'Chat ' + log.id;
        logItem.className = 'log-item';
        logItem.onclick = function() {
            displayChatLog(log.id);
        };
        chatLogList.appendChild(logItem);
    });
}

function displayChatLog(chatLogId) {
    console.log("Trying to display chat log with ID:", chatLogId);

    console.log("saved chats: ", savedChats)
    currentChatId = chatLogId;
    var selectedLog = savedChats.find(log => log.id === chatLogId);
    if (!selectedLog) {
        console.error("No chat log found with ID:", chatLogId);
        return;
    }

    console.log("Selected chat log:", selectedLog);
    var chatBox = document.getElementById('chatBox');
    chatBox.innerHTML = '';
    selectedLog.messages.forEach(function(message) {
        var messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.textContent = message;
        chatBox.appendChild(messageDiv);
    });
}

function createNewChatLog() {
    // Optionally, send a request to the server to create a new chat log
    fetch('/save_chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({messages: []})  // Sending an empty message array
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.chat_log_id) {
            var newChatLog = {
                id: data.chat_log_id,
                messages: []
            };
            savedChats.push(newChatLog);
            addChatLogToList(newChatLog);

            // Set this new chat as the current chat
            currentChatId = data.chat_log_id;
            
            // Clear the chat box for the new chat
            var chatBox = document.getElementById('chatBox');
            chatBox.innerHTML = '';

            // Focus on the chat input field
            var chatInput = document.getElementById('chatInput');
            chatInput.value = '';
            chatInput.focus();
        } else {
            console.error('Error creating new chat:', data.error);
        }
    })
    .catch(function(error) {
        console.error('Failed to create new chat:', error);
    });
}

function addChatLogToList(chatLog) {
    var chatLogList = document.querySelector('.chat-log-list');
    var logItem = document.createElement('div');
    logItem.textContent = 'Chat ' + chatLog.id;
    logItem.className = 'log-item';
    logItem.onclick = function() {
        displayChatLog(chatLog.id);
    };
    chatLogList.appendChild(logItem);
}

