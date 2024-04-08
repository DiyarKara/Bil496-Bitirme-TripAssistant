import React, { useState, useEffect, useRef, useCallback, useLayoutEffect} from 'react';
import { BiPlus, BiUser, BiSend, BiSolidUserCircle } from 'react-icons/bi';
import { MdOutlineArrowLeft, MdOutlineArrowRight } from 'react-icons/md';
import './chatgpt.css';
import config from './config';
import { useAuth } from './AuthContext';

function ChatGpt() {
  const [previousChats, setPreviousChats] = useState([]);
  const [localChats, setLocalChats] = useState([]);
  const [isShowSidebar, setIsShowSidebar] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(null);
  const [currentChat, setCurrentChat] = useState([]);
  const [text, setText] = useState('');
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const scrollRef = useRef(null);
  const [message, setMessage] = useState(null);
  const scrollToLastItem = useRef(null);
  const { user } = useAuth();

  // Fetch chats on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams({ userId: user.id }).toString();
    fetch(`${config.backendURL}/get_chats?${queryParams}`)
      .then((response) => response.json())
      .then((data) => {
        setPreviousChats(data.response);
        // setLocalChats or any other state you might want to set
      });
  }, []);
  const backToHistoryPrompt = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle);
    setMessage(null);
    setText("");
  };
  const toggleSidebar = useCallback(() => {
    setIsShowSidebar((prev) => !prev);
  }, []);

  const submitHandler = (event) => {
    event.preventDefault();
    
    if (!text.trim()) return;
    const message = text.trim();

    setIsResponseLoading(true);
    fetch(`${config.backendURL}/process_message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.response) {
          setCurrentChat((prevChat) => [...prevChat, { role: 'user', content: message }, { role: 'chatbot', content: data.response }]);
          setText('');
        } else {
          setErrorText('No response received');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        setErrorText('An error occurred while sending the message.');
      })
      .finally(() => setIsResponseLoading(false));
  };

  const createNewChat = () => {
    setIsResponseLoading(true); // Assuming you want to show loading state
  
    fetch('/save_chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages: [] }) // Sending an empty message array or any initial data required by your backend
    })
    .then(response => response.json())
    .then(data => {
      if (data.success && data.chat_log_id) {
        const newChatLog = {
          id: data.chat_log_id,
          messages: []
        };
        setPreviousChats(prevChats => [...prevChats, newChatLog]);
        setCurrentChat(newChatLog.messages); // Set the newly created chat as the current chat
        setCurrentTitle(`Chat ${data.chat_log_id}`); // Optional: set a title for the chat
        console.log('New chat created with ID:', data.chat_log_id);
      } else {
        console.error('Error creating new chat:', data.error);
        setErrorText('Failed to create new chat.');
      }
    })
    .catch(error => {
      console.error('Failed to create new chat:', error);
      setErrorText('An error occurred while creating the chat.');
    })
    .finally(() => setIsResponseLoading(false));
  };
  
  // Automatically scroll to the last message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentChat]);

  // Define other functionalities such as saveChat, createNewChat, deleteChat here similar to the JS implementation
  useLayoutEffect(() => {
    const handleResize = () => {
      setIsShowSidebar(window.innerWidth <= 640);
    };
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  // Your JSX goes here, mostly unchanged but with added React structure and logic

  return (
    <div className="ChatGpt">
      <div className="container">
      <section className={`sidebar ${isShowSidebar ? "open" : ""}`}>
          <div className="sidebar-header" onClick={createNewChat} role="button">
            <BiPlus size={20} />
            <button>New Chat</button>
          </div>
          <div className="sidebar-history">
            {/* Ongoing chats - populated from backend */}
            {previousChats.length > 0 && (
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
            )}
            {/* Example for locally stored chats */}
          </div>
          <div className="sidebar-info">
            <div className="sidebar-info-upgrade">
              <BiUser size={20} />
              <p>Upgrade plan</p>
            </div>
            <div className="sidebar-info-user">
              <BiSolidUserCircle size={20} />
              <p>Welcome ${user.username}</p>
            </div>
          </div>
        </section>

        <section className="main">
          {!currentTitle && (
            <div className="empty-chat-container">
              <img
                src="images/chatgpt-logo.svg"
                width={45}
                height={45}
                alt="ChatGPT"
              />
              <h1>Chat GPT Clone</h1>
              <h3>How can I help you today?</h3>
            </div>
          )}

          {isShowSidebar ? (
            <MdOutlineArrowRight
              className="burger"
              size={28.8}
              onClick={toggleSidebar}
            />
          ) : (
            <MdOutlineArrowLeft
              className="burger"
              size={28.8}
              onClick={toggleSidebar}
            />
          )}
          <div className="main-header">
            <ul>
              {currentChat?.map((chatMsg, idx) => {
                const isUser = chatMsg.role === "user";

                return (
                  <li key={idx} ref={scrollToLastItem}>
                    {isUser ? (
                      <div>
                        <BiSolidUserCircle size={28.8} />
                      </div>
                    ) : (
                      <img src="images/chatgpt-logo.svg" alt="ChatGPT" />
                    )}
                    {isUser ? (
                      <div>
                        <p className="role-title">You</p>
                        <p>{chatMsg.content}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="role-title">ChatGPT</p>
                        <p>{chatMsg.content}</p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="main-bottom">
            {errorText && <p className="errorText">{errorText}</p>}
            <form className="form-container" onSubmit={submitHandler}>
              <input
                type="text"
                placeholder="Send a message."
                spellCheck="false"
                value={isResponseLoading ? "Processing..." : text}
                onChange={(e) => setText(e.target.value)}
                readOnly={isResponseLoading}
              />
              {!isResponseLoading && (
                <button type="submit">
                  <BiSend size={20} />
                </button>
              )}
            </form>
            <p>
              ChatGPT can make mistakes. Consider checking important
              information.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ChatGpt;
