import React, { useState, useEffect, useRef, useCallback, useLayoutEffect} from 'react';
import { BiPlus, BiUser, BiSend, BiSolidUserCircle } from 'react-icons/bi';
import { MdOutlineArrowLeft, MdOutlineArrowRight } from 'react-icons/md';
import './chatgpt.css';
import config from './config';
import { useAuth } from './AuthContext';

function ChatGpt() {
  const [text, setText] = useState('');
  const [message, setMessage] = useState(null);
  const [previousChats, setPreviousChats] = useState([]);
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [isShowSidebar, setIsShowSidebar] = useState(false);
  const scrollToLastItem = useRef(null);
  const [localChats, setLocalChats] = useState([]);
  const [currentTitle, setCurrentTitle] = useState(null);
  const { user } = useAuth();
  
  const createNewChat = () => {
    setMessage(null);
    setText("");
    setCurrentTitle(null);
  };

  const backToHistoryPrompt = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle);
    setMessage(null);
    setText("");
  };

  const toggleSidebar = useCallback(() => {
    setIsShowSidebar((prev) => !prev);
  }, []);
  // API Base URL - Adjust to match your Flask backend URL

  const fetchChatHistory = useCallback(async () => {
    if (!user || !user.id) {
      console.log("User info not available yet.");
      return; // Exit if user or user.id is not available
    }
    const queryParams = new URLSearchParams({ userId: user.id }).toString();
    try {
      const response = await fetch(`${config.backendURL}/get_chats?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) throw new Error('Failed to fetch chats');
      const chats = await response.json();
      setPreviousChats(chats); // Adjust according to your backend response structure
    } catch (error) {
      console.error('Fetch chat history error:', error);
      setErrorText('Failed to load chat history.');
    }
  }, [user?.id]); // Dependency array updated to react on changes to user.id
  

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!text) return;

    setIsResponseLoading(true);
    setErrorText('');

    try {
      const response = await fetch(`${config.backendURL}/process_message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) throw new Error('Message processing failed');

      const data = await response.json();
      setMessage(data.response); // Adapt based on your backend response

      const userMessage = {
        title: currentTitle || text, // Fallback to text if no title is set
        role: "user",
        content: text,
      };
  
      // Construct the server response message for UI display
      const responseMessage = {
        title: currentTitle || text, // Fallback to text if no title is set
        role: "gpt", // Adjust according to your role naming convention
        content: data.response,
      };
  
      // Update chat history state to include the new messages
      setPreviousChats((prevChats) => [...prevChats, userMessage, responseMessage]);
      setLocalChats((prevChats) => [...prevChats, userMessage, responseMessage]);
  
      // Optionally, update local storage or any persistent state as needed
      const updatedChats = [...localChats, userMessage, responseMessage];
      localStorage.setItem("previousChats", JSON.stringify(updatedChats));
  
      setText(""); // Clear input after message is sent
    } catch (error) {
      setErrorText(error.toString());
      console.error('Submit error:', error);
    } finally {
      setIsResponseLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchChatHistory();
    }
  }, [fetchChatHistory, user?.id]);

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

  useEffect(() => {
    const storedChats = localStorage.getItem("previousChats");
    console.log(storedChats);
    if (storedChats) {
      setLocalChats(JSON.parse(storedChats));
    }
  }, []);

  useEffect(() => {
    if (!currentTitle && text && message) {
      setCurrentTitle(text);
    }

    if (currentTitle && text && message) {
      const newChat = {
        title: currentTitle,
        role: "user",
        content: text,
      };

      const responseMessage = {
        title: currentTitle,
        role: message.role,
        content: message.content,
      };

      setPreviousChats((prevChats) => [...prevChats, newChat, responseMessage]);
      setLocalChats((prevChats) => [...prevChats, newChat, responseMessage]);

      const updatedChats = [...localChats, newChat, responseMessage];
      localStorage.setItem("previousChats", JSON.stringify(updatedChats));
    }
  }, [message, currentTitle]);

  const currentChat = (localChats || previousChats).filter(
    (prevChat) => prevChat.title === currentTitle
  );


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