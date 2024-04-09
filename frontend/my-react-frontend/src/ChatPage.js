import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import { BiPlus, BiUser, BiSend, BiSolidUserCircle } from "react-icons/bi";
import { MdOutlineArrowLeft, MdOutlineArrowRight } from "react-icons/md";
import './css/Chat.css';
import { useAuth } from './AuthContext';
import config from './config';
import logo from './images/logo.svg';

function ChatPage() {
  const [text, setText] = useState("");
  const [previousChats, setPreviousChats] = useState([]);
  const [backendChats, setBackendChats] = useState([]);
  const { user, logout } = useAuth();
  const [message, setMessage] = useState(null);
  const [localChats, setLocalChats] = useState([]);
  const [currentTitle, setCurrentTitle] = useState(null);
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isShowSidebar, setIsShowSidebar] = useState(false);
  const scrollToLastItem = useRef(null);

  const createNewChat = () => {
    setMessage(null);
    setText("");
    setCurrentTitle(null);
  };
  const newChat = async () => {

  
    try {
      // Replace `URL` with your actual backend endpoint
      const response = await fetch(`${config.backendURL}/save_chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include other headers as needed, like authorization tokens
        },
        body: JSON.stringify({messages:[],userIs:user.id}),
      });
  
      if (!response.ok) throw new Error('Failed to save chat');
  
      const responseData = await response.json();
      console.log('Chat saved successfully:', responseData);
      // Handle success response
    } catch (error) {
      console.error('Error saving chat:', error);
      // Handle error response
    }
  };
  const saveChat = async (chatMessages,currentTitle) => {
    // Convert the frontend message format to the backend expected format
    const convertedMessages = reverseTransformation(chatMessages,currentTitle);
  
    try {
      // Replace `URL` with your actual backend endpoint
      const response = await fetch(`${config.backendURL}/save_chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include other headers as needed, like authorization tokens
        },
        body: JSON.stringify(convertedMessages),
      });
  
      if (!response.ok) throw new Error('Failed to save chat');
  
      const responseData = await response.json();
      console.log('Chat saved successfully:', responseData);
      // Handle success response
    } catch (error) {
      console.error('Error saving chat:', error);
      // Handle error response
    }
  };
  
  
  
  const fetchChats = useCallback(async () => {
    try {
      // Fetch chats from backend
      const queryParams = new URLSearchParams({ userId: user.id }).toString();
      const response = await fetch(`${config.backendURL}/get_chats?${queryParams}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const chats = await response.json();
  
      // Filter chats based on userId
  
      // Process and set formatted chats
      const formattedChats = chats.reduce((acc, chat) => {
        const chatMessages = chat.messages.map((message, index) => ({
          userId: user.id,
          title: `${user.name}'s Chat ${chat.id}`,
          role: index % 2 === 0 ? 'user' : 'assistant',
          content: message,
        }));
        return [...acc, ...chatMessages];
      }, []);
      setPreviousChats(prevChats => [...prevChats, ...formattedChats]);
      setLocalChats((prevChats) => [...prevChats, ...formattedChats]);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  }, [user.id]);

  const exportChatLogs = () => {
    // Retrieve chat logs from local storage or state
    const chatsToExport = [...backendChats]
      .filter(chat => chat.userId === user.id);
  
    if (chatsToExport.length > 0) {
      // Create a Blob from the chats
      const blob = new Blob([JSON.stringify(chatsToExport)], { type: 'application/json' });
      // Create an anchor element and trigger download
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = "chat_logs.json"; // or "chat_logs.txt"
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    } else {
      alert("No chat logs to export.");
    }
  };
  const reverseTransformation = (formattedChats, currentTitle) => {
    // Directly prepare the object for the specific session
    const chatSession = {
      userId: null,
      chat_log_id: null,
      messages: [],
    };
  
    // Extract the chat session ID from the title, assuming there's only one currentTitle
    const sessionId = currentTitle.split(' ')[2]; // Assumes title format is "username's Chat X"
  
    formattedChats.filter(chat => chat.title === currentTitle).forEach(({userId, content}) => {
      chatSession.userId = user.id; // Assuming userId is the same for all messages in the session
      chatSession.chat_log_id = parseInt(sessionId, 10); // Convert session ID to a number
      chatSession.messages.push(content);
    });
  
    // Since we're now dealing with a single chat session, return the object directly
    return chatSession;
  };
  
  

  // Use useEffect to fetch chats when the component mounts
  useEffect(() => {
    fetchChats();
  }, [fetchChats]); // Empty dependency array means this effect runs only once after the initial render

  // Function to handle click on a chat item

  const backToHistoryPrompt = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle);
    setMessage(null);
    setText("");
  };

  const toggleSidebar = useCallback(() => {
    setIsShowSidebar((prev) => !prev);
  }, []);

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
        body: JSON.stringify({ message: text })
        //body: JSON.stringify(localStorage.getItem("previousChats")),
      });

      if (!response.ok) throw new Error('Message processing failed');

      const data = await response.json();
      setErrorText(false);
      setErrorText("");
      setMessage(data); // Adapt based on your backend response
        setTimeout(() => {
          scrollToLastItem.current?.lastElementChild?.scrollIntoView({
            behavior: "smooth",
          });
        }, 1);
        setTimeout(() => {
          setText("");
        }, 2);
    } catch (error) {
      setErrorText(error.toString());
      console.error('Submit error:', error);
    } finally {
      setIsResponseLoading(false);
    }
  };

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
    if (!currentTitle && text && message) {    
      setCurrentTitle(`${user.name}'s Chat ${getUniqueChatTitles(previousChats,localChats).length + 1}`);
      newChat();
    }

    if (currentTitle && text && message) {
      const newChat = {
        userId: user.id,
        title: currentTitle,
        role: "user",
        content: text,
      };

      const responseMessage = {
        userId: user.id,
        title: currentTitle,
        role: message.role,
        content: message.content,
      };

      setPreviousChats(prevChats => [...prevChats, newChat, responseMessage]);
      setLocalChats((prevChats) => [...prevChats, newChat, responseMessage]);

      const updatedChats = [...localChats, newChat, responseMessage];
      saveChat(updatedChats,currentTitle);
      //localStorage.setItem("previousChats", JSON.stringify(updatedChats));
    }
  }, [message, currentTitle]);

  const currentChat = (localChats || previousChats).filter(
    (prevChat) => prevChat.title === currentTitle
  );

  function getUniqueChatTitles(previousChats, localChats) {
    const allChats = [...previousChats, ...localChats, ...backendChats];
    const uniqueTitles = [];
    const seenTitles = new Set();
  
    allChats.filter(chat => chat.userId === user.id).forEach(chat => {
      if (!seenTitles.has(chat.title)) {
        uniqueTitles.push(chat);
        seenTitles.add(chat.title);
      }
    });
  
    return uniqueTitles;
  }
  
  return(
  <div className="ChatPage">
      <div className="container">
      <section className={`sidebar ${isShowSidebar ? "open" : ""}`}>
          <div className="sidebar-header" onClick={createNewChat} role="button">
            <BiPlus size={20} />
            <button>New Chat</button>
          </div>
          <div className="sidebar-history">
            {/* Ongoing chats - populated from backend */}
            
            {/* Example for locally stored chats */}
            <p>Chats</p>
    <ul>
      {getUniqueChatTitles(previousChats, localChats).filter(chat => chat.userId === user.id)
        .map((chat, idx) => (
          <li key={idx} onClick={() => backToHistoryPrompt(chat.title)}>
            {chat.title}
          </li>
        ))}
    </ul>
          </div>
          <div className="sidebar-info">
            <div className="sidebar-info-upgrade" onClick={logout}>
              <BiUser size={20} />
              <p>Logout</p>
            </div>
            <div className="sidebar-info-user">
              <BiSolidUserCircle size={20} />
              <p>Welcome {user.name}</p>
            </div>
          </div>
        </section>

        <section className="main">
          {!currentTitle && (
            <div className="empty-chat-container">
              <img
                src={logo}
                width={45}
                height={45}
                alt={config.projectName}
              />
              <h1>{config.projectName}</h1>
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
                      <img src={logo} alt={config.projectName} />
                    )}
                    {isUser ? (
                      <div>
                        <p className="role-title">You</p>
                        <p>{chatMsg.content}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="role-title">{config.projectName}</p>
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
              Have fun with {config.projectName}.
            </p>
            <button onClick={exportChatLogs}>Export Chat</button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ChatPage;
