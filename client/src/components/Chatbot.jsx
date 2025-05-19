import { useRef, useEffect, useState } from 'react';
// Import other dependencies...

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Add a state to control scrolling behavior
  const [shouldScroll, setShouldScroll] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom only when shouldScroll is true
  useEffect(() => {
    if (shouldScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setShouldScroll(false);
    }
  }, [shouldScroll, messages]);

  // Save the scroll position when leaving the component
  useEffect(() => {
    // Get the saved scroll position if it exists
    const savedScrollPosition = sessionStorage.getItem('chatScrollPosition');
    
    if (savedScrollPosition && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = parseInt(savedScrollPosition);
    }
    
    // Save scroll position when component unmounts
    return () => {
      if (chatContainerRef.current) {
        sessionStorage.setItem('chatScrollPosition', chatContainerRef.current.scrollTop);
      }
    };
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = { text: input, sender: 'user', timestamp: new Date() };
    
    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    // Set shouldScroll to true to trigger scrolling after user sends a message
    setShouldScroll(true);
    
    try {
      // API call to get bot response
      const response = await sendMessageToBot(input);
      
      // Add bot message
      setMessages(prev => [...prev, {
        text: response,
        sender: 'bot',
        timestamp: new Date()
      }]);
      
      // Set shouldScroll to true to trigger scrolling after bot response
      setShouldScroll(true);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      setMessages(prev => [...prev, {
        text: 'Sorry, I couldn\'t process your request at the moment.',
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      }]);
      
      // Set shouldScroll to true even on error
      setShouldScroll(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages" ref={chatContainerRef}>
        {/* Messages rendering */}
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            {/* Message content */}
          </div>
        ))}
        
        {loading && (
          <div className="message bot-message loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        {/* This element will be scrolled into view only when shouldScroll is true */}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chatbot-input-container" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="chatbot-input"
          disabled={loading}
        />
        <button 
          type="submit"
          className="chatbot-send-button"
          disabled={loading || !input.trim()}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
}

export default Chatbot;