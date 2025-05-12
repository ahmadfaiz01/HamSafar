import React, { useState, useEffect, useRef } from 'react';
import './chatbot.css';
import { generateGeminiResponse } from '../api/gemini';
import { Link } from 'react-router-dom';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Welcome to <strong>HamSafar</strong>! I'm your travel assistant. How can I help you plan your journey today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await generateGeminiResponse(input);
      const formattedResponse = formatAssistantReply(response);
      setMessages([...newMessages, { role: 'assistant', content: formattedResponse }]);
    } catch (err) {
      console.error('Gemini API Error:', err);
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while processing your request. Please try again.' 
      }]);
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

  return (
    <div className="chatbot-centered-page">
      <div className="chatbot-bg"></div>
      
      <div className="chatbot-container">
        <div className="chatbot-header">
          <div className="chatbot-title">
            <i className="fas fa-robot me-2"></i>
            <h2>HamSafar Travel Assistant</h2>
          </div>
          <Link to="/" className="chatbot-back">
            <i className="fas fa-home"></i>
          </Link>
        </div>
        
        <div className="chatbot-body">
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
