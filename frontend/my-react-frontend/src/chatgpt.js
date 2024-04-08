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
  const [currentTitle, setCurrentTitle] = useState(null);
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const [localChats, setLocalChats] = useState([]);
  const [errorText, setErrorText] = useState("");
  const [isShowSidebar, setIsShowSidebar] = useState(false);
  const scrollToLastItem = useRef(null);

  const createNewChat = () => {
    setMessage(null);
    setText("");
    setCurrentTitle(null);
  };

  const fetchChats = useCallback(async () => {
    const queryParams = new URLSearchParams({ userId: user.id }).toString();
    try {
      const response = await fetch(`${config.backendURL}/get_chats?${queryParams}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const chats = await response.json();
      
      if (chats.length > 0) {
        const latestChat = chats[chats.length - 1];
        setPreviousChats([{ title: `Chat ${latestChat.id}`, id: latestChat.id, messages: latestChat.messages }]);
      } else {
        // If no chats are returned, you could optionally start a new chat log here
        // Or just leave previousChats as an empty array
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

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
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) throw new Error('Message processing failed');

      const data = await response.json();
      setMessage(data); // Adapt based on your backend response
      setErrorText("");
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
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Removed the useEffect related to localChats as it's no longer relevant
  const backToHistoryPrompt = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle);
    setMessage(null);
    setText("");
  };
  // Handle title and message for current chat
  useEffect(() => {
    if (previousChats.length > 0 && !currentTitle) {
      setCurrentTitle(previousChats[0].title);
    }

    if (currentTitle && text && message) {
      const newMessage = {
        title: currentTitle,
        role: "user",
        content: text,
      };
      
      const responseMessage = {
        title: currentTitle,
        role: message.role,
        content: message.content,
      };

      // Update the messages in the latest chat
      setPreviousChats((prevChats) => {
        const updatedChats = [...prevChats];
        updatedChats[0].messages.push(newMessage, responseMessage);
        return updatedChats;
      });
    }
  }, [message, currentTitle, text]);

  useEffect(() => {
    const storedChats = localStorage.getItem("previousChats");

    if (storedChats) {
      setLocalChats(JSON.parse(storedChats));
    }
  }, []);
  const currentChat = ( previousChats).filter(
    (prevChat) => prevChat.title === currentTitle
  );

  const uniqueTitles = Array.from(
    new Set(previousChats.map((prevChat) => prevChat.title).reverse())
  );
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
          </div>
        </section>
      </div>
    </div>
  );
}

export default ChatGpt;