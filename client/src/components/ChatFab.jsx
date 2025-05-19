import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/chatfab.css';

const ChatFAB = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleChatClick = (e) => {
    e.preventDefault();
    
    // Set flag to indicate we're changing routes manually
    sessionStorage.setItem('fromOtherPage', 'true');
    
    // Use navigate instead of Link component for more control
    navigate('/chatbot');
  };

  return (
    <div className="chat-fab-container">
      {isHovered && (
        <div className="chat-tooltip animate__animated animate__fadeIn">
          Chat with HamSafar Assistant
        </div>
      )}
      <a 
        href="/chatbot"
        className="chat-fab"
        onClick={handleChatClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <i className="fas fa-comment-dots"></i>
      </a>
    </div>
  );
};

export default ChatFAB;