/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import './chatbot.css';
import { generateGeminiResponse } from '../api/gemini';
import { Link, useLocation } from 'react-router-dom';

const Chatbot = () => {
  // Track if this is the initial render
  const isInitialMount = useRef(true);
  const location = useLocation();
  
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Welcome to <strong>HamSafar</strong>! I'm your travel assistant. How can I help you plan your journey today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);
  
  // Completely disable auto-scrolling except when explicitly needed
  const [manuallyScrollToBottom, setManuallyScrollToBottom] = useState(false);
  
  // On component first mount only, restore saved position or default to top
  useEffect(() => {
    // This is a hard flag to indicate we're coming from another page
    const fromOtherPage = sessionStorage.getItem('fromOtherPage') === 'true';
    sessionStorage.removeItem('fromOtherPage');

    // Only if we're coming from another page, restore saved position
    if (fromOtherPage && !isInitialMount.current) {
      const savedScrollPosition = sessionStorage.getItem('chatScrollPosition');
      console.log('Restoring position from another page:', savedScrollPosition);
      
      if (savedScrollPosition && chatBodyRef.current) {
        // Clear any scroll animations and set position directly
        chatBodyRef.current.style.scrollBehavior = 'auto';
        chatBodyRef.current.scrollTop = parseInt(savedScrollPosition);
        
        // Reset scroll behavior after position is set
        setTimeout(() => {
          if (chatBodyRef.current) {
            chatBodyRef.current.style.scrollBehavior = '';
          }
        }, 100);
      }
    }
    
    isInitialMount.current = false;
    
    // Save scroll position when unmounting
    return () => {
      if (chatBodyRef.current) {
        const currentPosition = chatBodyRef.current.scrollTop;
        sessionStorage.setItem('chatScrollPosition', currentPosition.toString());
        sessionStorage.setItem('fromOtherPage', 'true');
        console.log('Saved position on unmount:', currentPosition);
      }
    };
  }, [location.pathname]);

  // Manual scroll function - only called when explicitly needed
  const scrollToBottom = () => {
    if (chatBodyRef.current && messagesEndRef.current) {
      // Force disable smooth scrolling
      chatBodyRef.current.style.scrollBehavior = 'auto';
      
      // Directly set scroll position to bottom
      const scrollHeight = chatBodyRef.current.scrollHeight;
      chatBodyRef.current.scrollTop = scrollHeight;
      
      // Reset scroll behavior
      setTimeout(() => {
        if (chatBodyRef.current) {
          chatBodyRef.current.style.scrollBehavior = '';
        }
      }, 100);
    }
  };

  // Only scroll when manuallyScrollToBottom flag is set
  useEffect(() => {
    if (manuallyScrollToBottom) {
      scrollToBottom();
      setManuallyScrollToBottom(false);
    }
  }, [manuallyScrollToBottom]);

  // Disable default scroll behavior for message changes
  useEffect(() => {
    // This empty useEffect intentionally avoids auto-scrolling
    // when messages change
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // We'll scroll to bottom after sending a message
    setManuallyScrollToBottom(true);

    try {
      const response = await generateGeminiResponse(input);
      const formattedResponse = formatAssistantReply(response);
      setMessages([...newMessages, { role: 'assistant', content: formattedResponse }]);
      
      // And scroll again after receiving a response
      setManuallyScrollToBottom(true);
    } catch (err) {
      console.error('Gemini API Error:', err);
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while processing your request. Please try again.' 
      }]);
      
      // Also scroll on error
      setManuallyScrollToBottom(true);
    } finally {
      setLoading(false);
    }
  };

  const formatAssistantReply = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\s*-\s*(.*?)\n/g, '<ul><li>$1</li></ul>\n')
      .replace(/-\s(.*?)\n/g, '<li>$1</li>')
      .replace(/\n/g, '<br />');
  };

  // Don't use onScroll handler as it might interfere
  // We'll completely rely on manual scrolling

  return (
    <div className="chatbot-centered-page">
      <div className="chatbot-bg"></div>
      
      <div className="chatbot-container">
        <div className="chatbot-header">
          <div className="chatbot-title">
            <i className="fas fa-robot me-2"></i>
            <h2>HamSafar Travel Assistant</h2>
          </div>
          <Link 
            to="/" 
            className="chatbot-back"
            onClick={() => {
              // Save scroll position before navigating away
              if (chatBodyRef.current) {
                const currentPos = chatBodyRef.current.scrollTop;
                sessionStorage.setItem('chatScrollPosition', currentPos.toString());
                sessionStorage.setItem('fromOtherPage', 'true');
                console.log('Saved position before navigation:', currentPos);
              }
            }}
          >
            <i className="fas fa-home"></i>
          </Link>
        </div>
        
        <div 
          className="chatbot-body no-auto-scroll" 
          ref={chatBodyRef}
        >
          <div className="chat-messages-container">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                <div className="chat-bubble">
                  {msg.role === 'assistant' && <div className="chat-avatar">
                    <i className="fas fa-robot"></i>
                  </div>}
                  <div className="chat-content">
                    {msg.role === 'assistant' ? (
                      <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-message assistant">
                <div className="chat-bubble">
                  <div className="chat-avatar">
                    <i className="fas fa-robot"></i>
                  </div>
                  <div className="chat-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <div className="chatbot-footer">
          <div className="chat-input-container">
            <input
              type="text"
              value={input}
              placeholder="Ask me about travel plans, destinations, or recommendations..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="chat-input"
            />
            <button 
              onClick={sendMessage} 
              className="chat-send-btn"
              disabled={loading || !input.trim()}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
