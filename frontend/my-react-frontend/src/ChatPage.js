import React, { useState, useEffect, useRef } from 'react';
import './Chat.css'; // Make sure the CSS path is correct

const ChatPage = () => {
    const [inputMessage, setInputMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [savedChats, setSavedChats] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const chatBoxRef = useRef(null);
    const [chatLogs, setChatLogs] = useState([]); // To store chat logs fetched from the server

    // Fetch saved chats on component mount
    useEffect(() => {
        fetch('/get_chats')
            .then(response => response.json())
            .then(data => {
                setSavedChats(data);
                // Optionally set a current chat here
            })
            .catch(error => console.error('Fetch chats error:', error));
    }, []);

    const displayChatLog = (chatLogId) => {
        // Logic to display the chat log based on the provided chatLogId
        // This might involve setting the current chat log in your state and fetching the messages for this log
        console.log(`Displaying chat log with ID: ${chatLogId}`);
        // For example, you could filter the `chatLogs` state to find the log with `chatLogId` and then set your messages state accordingly
    };
    
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;
        
        // Add user message immediately to UI
        addMessageToChat('user-message', inputMessage);
        setInputMessage('');

        // Simulate a delay and send the message to the backend
        setTimeout(() => {
            fetch('/process_message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: inputMessage })
            })
            .then(response => response.json())
            .then(data => {
                if (data.response) {
                    addMessageToChat('chatbot-message', data.response);
                }
            })
            .catch(error => console.error('Error:', error));
        }, 1000);
    };

    const addMessageToChat = (className, message) => {
        const newMessage = { type: className, content: message };
        setMessages(prevMessages => [...prevMessages, newMessage]);
        // Ensure chatBox scrolls to bottom
        if (chatBoxRef.current) {
            setTimeout(() => {
                chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
            }, 0);
        }
    };

    const handleSaveChat = () => {
        const payload = {
            chat_log_id: currentChatId,
            messages: messages.map(msg => msg.content) // Assuming backend expects an array of message strings
        };

        fetch('/save_chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.chat_log_id) {
                console.log('Chat saved with ID:', data.chat_log_id);
                // Update saved chats state if necessary
            } else {
                console.error('Error saving chat:', data.error);
            }
        })
        .catch(error => console.error('Failed to save chat:', error));
    };

    // Render chat interface, message input form, and saved chats list
    return (
        <div>
            <header className="navigation-bar">
                {/* Conditionally render Logout based on user session state */}
                <div id="logout-button" onClick={() => window.location.href = '/logout'}>Logout</div>
            </header>
            <div className="chat-interface">
                <aside className="chat-sidebar">
                    {/* New Chat Button and Chat Logs Here */}
                    <button id="newChatButton">New Chat</button>
                    <div className="chat-log-list">
                        {/* Chat logs listing */}
                    </div>
                </aside>
                <div className="chat-container">
                    <div className="chat-box" ref={chatBoxRef}>
                        {/* Messages displayed here */}
                    </div>
                    {/* Message input form */}
                    <form id="chatForm" onSubmit={handleSendMessage}>
                        <input type="text" id="chatInput" placeholder="Type a message..." autoComplete="off"
                            value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} />
                        <button type="submit">Send</button>
                    </form>
                </div>
            </div>
            <button id="deleteChatButton" className="delete-chat-btn">Delete Chat</button> {/* Implement delete functionality */}
            <div id="back-button" onClick={() => window.location.href = '/dashboard'}>Back to Dashboard</div>
        </div>
    );
};

export default ChatPage;
