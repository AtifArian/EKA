import React, { useState, useRef, useEffect } from 'react';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: 'Hi! I\'m your EKA assistant. How can I help you today? 😊\n\nI can help you:\n• Navigate the website\n• Find to book doctors\n• Get mental health support\n• Learn about our services'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasIntroduced, setHasIntroduced] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen]);

  const checkForCrisisKeywords = (text) => {
    const crisisKeywords = [
      'suicide', 'kill myself', 'end my life', 'want to die', 'self harm',
      'self-harm', 'no point living', 'better off dead',, 
      'can\'t go on', 'cant live anymore', 'don\'t want to live', 'wanna die','kill','knife','poison','hang myself'
    ];
    return crisisKeywords.some(keyword => text.toLowerCase().includes(keyword));
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Check for crisis keywords first
      if (checkForCrisisKeywords(userMessage)) {
        setMessages(prev => [...prev, {
          role: 'bot',
          content: '🚨URGENT CRISIS SUPPORT🚨\n\nI\'m really concerned about what you\'re sharing. Please know that help is available right now.\n\n 📞Emergency Hotline:  01819026352\n\nPlease call this number immediately. Trained professionals are ready to support you 24/7.\n\nYou are not alone. Your life matters, and there are people who care about you and want to help. 💙'
        }]);
        setIsTyping(false);
        return;
      }

      // Call backend API for Gemini response
      const rawApi = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5050/api';
      const apiUrl = rawApi.endsWith('/api') ? rawApi : `${rawApi}/api`;
      const response = await fetch(`${apiUrl}/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: userMessage,
          isFirstMessage: !hasIntroduced
        })
      });

      const data = await response.json();
      
      // Mark that introduction has been given after first user message
      if (!hasIntroduced) {
        setHasIntroduced(true);
      }
      
      setMessages(prev => [...prev, {
        role: 'bot',
        content: data.response || 'I apologize, but I encountered an error. Please try again.'
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'bot',
        content: 'I\'m sorry, I\'m having trouble connecting right now. Please try again in a moment.'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '200px',
            height: '60px',
            background: 'white',
            border: 'none',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 15px',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            transition: 'transform 0.3s ease',
            zIndex: 1000
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {/* Blue Flower Icon */}
          <div style={{
            fontSize: '32px',
            filter: 'hue-rotate(200deg) saturate(1)'
          }}>
            🌸
          </div>
          {/* EKA AI Assistant text */}
          <div style={{
            fontFamily: "'Segoe UI', 'Arial', sans-serif",
            fontSize: '15px',
            fontWeight: '600',
            background: 'linear-gradient(90deg, #5971b1 0%, #9898ba 50%, #c7b5c1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap'
          }}>
            EKA AI Assistant
          </div>
        </div>
      )}

      {/* Expanded Chat Box */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '380px',
            height: '550px',
            background: 'white',
            border: 'none',
            borderRadius: '20px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          {/* Chat Header */}
          <div style={{
            background: 'linear-gradient(90deg, #5971b1 0%, #9898ba 50%, #c7b5c1 100%)',
            padding: '15px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ 
                fontSize: '28px',
                filter: 'hue-rotate(200deg) saturate(1)'
              }}>🌸</span>
              <div>
                <div style={{ 
                  fontFamily: "'Segoe UI', 'Arial', sans-serif",
                  fontSize: '17px',
                  fontWeight: '600',
                  color: 'white',
                  letterSpacing: '0.5px'
                }}>
                  EKA AI Assistant
                </div>
                <div style={{ fontSize: '12px', color: '#fff', opacity: 0.9 }}>
                  Online now
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '20px',
                fontWeight: 'bold',
                color: 'white',
                transition: 'background 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
              ×
            </button>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            background: '#f9f9f9'
          }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '15px',
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '12px 16px',
                    borderRadius: '15px',
                    background: msg.role === 'user' 
                      ? 'linear-gradient(90deg, #5971b1 0%, #9898ba 50%, #c7b5c1 100%)'
                      : '#fff',
                    color: msg.role === 'user' ? 'white' : '#333',
                    border: msg.role === 'bot' ? '2px solid #e0e0e0' : 'none',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  background: '#fff',
                  border: '2px solid #e0e0e0',
                  borderRadius: '15px',
                  padding: '12px 16px',
                  display: 'flex',
                  gap: '5px'
                }}>
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    background: '#5e72e4', 
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite ease-in-out both',
                    animationDelay: '0s'
                  }}></span>
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    background: '#825ee4', 
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite ease-in-out both',
                    animationDelay: '0.2s'
                  }}></span>
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    background: '#d084b3', 
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite ease-in-out both',
                    animationDelay: '0.4s'
                  }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            borderTop: '3px solid #e0e0e0',
            padding: '15px',
            background: 'white',
            display: 'flex',
            gap: '10px'
          }}>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              style={{
                flex: 1,
                border: '2px solid #ddd',
                borderRadius: '12px',
                padding: '10px',
                fontSize: '14px',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                minHeight: '45px',
                maxHeight: '100px'
              }}
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isTyping}
              style={{
                background: inputMessage.trim() && !isTyping
                  ? 'linear-gradient(90deg, #5971b1 0%, #9898ba 50%, #c7b5c1 100%)'
                  : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '0 20px',
                cursor: inputMessage.trim() && !isTyping ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'all 0.3s'
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Add animation for typing indicator */}
      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0);
            }
            40% {
              transform: scale(1);
            }
          }
        `}
      </style>
    </>
  );
}

export default Chatbot;
