import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import { BiPlus, BiUser, BiSend, BiSolidUserCircle } from "react-icons/bi";
import { MdOutlineArrowLeft, MdOutlineArrowRight } from "react-icons/md";
import './chatgpt.css';
import { useAuth } from './AuthContext';
import config from './config';

function ChatGpt() {
  const [text, setText] = useState("");
  const [previousChats, setPreviousChats] = useState([]);
  const { user } = useAuth();
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
      const filteredChats = chats.filter(chat => chat.userId === user.id);
  
      // Process and set formatted chats
      const formattedChats = filteredChats.reduce((acc, chat) => {
        const chatMessages = chat.messages.map((message, index) => ({
          id: chat.id,
          title: `Chat ${chat.id}`,
          role: index % 2 === 0 ? 'user' : 'assistant',
          content: message,
        }));
        return [...acc, ...chatMessages];
      }, []);
  
      setPreviousChats(formattedChats);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  }, [user.id]);

  const exportChatLogs = () => {
    // Retrieve chat logs from local storage or state
    const chatsToExport = [...previousChats, ...localChats]
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
    const storedChats = localStorage.getItem("previousChats");

    if (storedChats) {
      setLocalChats(JSON.parse(storedChats));
    }
  }, []);

  useEffect(() => {
    if (!currentTitle && text && message) {    
      setCurrentTitle(`${user.username}'s Chat ${getUniqueChatTitles(previousChats,localChats).length + 1}`);
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

      setPreviousChats((prevChats) => {
        // Check if the chat log already exists
        const existingChatIndex = prevChats.findIndex(chat => chat.title === currentTitle);
      
        // If the chat log exists, update it; otherwise, append the new chat log
        if (existingChatIndex !== -1) {
          console.log("chatlog exist")
          const updatedChats = [...prevChats];
          updatedChats[existingChatIndex].content = text; // Update the content
          return updatedChats;
        } else {
          console.log("chat log doesnt exist")
          // Append the new chat log
          return [...prevChats, newChat, responseMessage];
        }
      });
      setLocalChats((prevChats) => [...prevChats, newChat, responseMessage]);

      const updatedChats = [...localChats, newChat, responseMessage];
      localStorage.setItem("previousChats", JSON.stringify(updatedChats));
    }
  }, [message, currentTitle]);

  const currentChat = (localChats || previousChats).filter(
    (prevChat) => prevChat.title === currentTitle
  );

  const uniqueTitles = Array.from(
    new Set(previousChats.map((prevChat) => prevChat.title).reverse())
  );

  const localUniqueTitles = Array.from(
    new Set(localChats.map((prevChat) => prevChat.title).reverse())
  ).filter((title) => !uniqueTitles.includes(title));
  function getUniqueChatTitles(previousChats, localChats) {
    const allChats = [...previousChats, ...localChats];
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
  <div className="ChatGpt">
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
            <div className="sidebar-info-upgrade">
              <BiUser size={20} />
              <p>Upgrade plan</p>
            </div>
            <div className="sidebar-info-user">
              <BiSolidUserCircle size={20} />
              <p>User</p>
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
            <button onClick={exportChatLogs}>Export Chat</button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ChatGpt;
