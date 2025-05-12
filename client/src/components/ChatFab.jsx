import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ChatFAB = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="chat-fab-container">
      {isHovered && (
        <div className="chat-tooltip animate__animated animate__fadeIn">
          Chat with HamSafar Assistant
        </div>
      )}
      <Link 
        to="/chatbot" 
        className="chat-fab"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <i className="fas fa-comment-dots"></i>
      </Link>
    </div>
  );
};

export default ChatFAB;