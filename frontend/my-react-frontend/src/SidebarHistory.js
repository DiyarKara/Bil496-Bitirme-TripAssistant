import React, { useState, useEffect, useCallback} from 'react';
import config from './config';
import { useAuth } from './AuthContext';

const SidebarHistory = () => {
  // State to store the fetched chats
  const [previousChats, setPreviousChats] = useState([]);
  const { user } = useAuth();

  // Function to fetch chats from the backend
  const fetchChats = useCallback(async () => {
    const queryParams = new URLSearchParams({ userId: user.id }).toString();
    try {
      const response = await fetch(`${config.backendURL}/get_chats?${queryParams}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const chats = await response.json();
      // Assuming the backend returns chats in the required format
      setPreviousChats(chats.map(chat => ({ title: `Chat ${chat.id}`, id: chat.id })));
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  },[user?.id]);

  // Use useEffect to fetch chats when the component mounts
  useEffect(() => {
    fetchChats();
  }, [fetchChats]); // Empty dependency array means this effect runs only once after the initial render

  // Function to handle click on a chat item
  const backToHistoryPrompt = (title) => {
    console.log(`Back to chat: ${title}`); // Implement your navigation logic here
  };

  return (
    <div className="sidebar-history">
      {previousChats.length > 0 ? (
        <>
          <p>Ongoing</p>
          <ul>
            {previousChats.map((chat, idx) => (
              <li key={idx} onClick={() => backToHistoryPrompt(chat.title)}>
                {chat.title}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>No ongoing chats</p>
      )}
    </div>
  );
};

export default SidebarHistory;
