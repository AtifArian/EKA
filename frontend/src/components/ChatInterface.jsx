import React, { useState, useEffect, useRef } from 'react';
import { getChat, sendMessage, endChat, leaveChat, markMessageAsRead } from '../services/messages';
import '../styles/ChatInterface.css';

function ChatInterface({ chatId, user, onChatEnded }) {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChat();
    // Refresh chat every 2 seconds for new messages
    const interval = setInterval(loadChat, 2000);
    return () => clearInterval(interval);
  }, [chatId]);

  const loadChat = async () => {
    try {
      const data = await getChat(chatId);
      setChat(data);
      setMessages(data.messages || []);
      setError('');
    } catch (err) {
      console.error('Failed to load chat:', err);
      setError('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    setIsSending(true);

    try {
      await sendMessage(chatId, newMessage);
      setNewMessage('');
      await loadChat();
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleEndChat = async () => {
    if (!window.confirm('Are you sure you want to end this chat?')) {
      return;
    }

    try {
      await endChat(chatId);
      if (onChatEnded) {
        onChatEnded();
      }
    } catch (err) {
      console.error('Failed to end chat:', err);
      setError('Failed to end chat');
    }
  };

  const handleLeaveChat = async () => {
    if (!window.confirm('Are you sure you want to leave this chat?')) {
      return;
    }

    try {
      await leaveChat(chatId);
      if (onChatEnded) {
        onChatEnded();
      }
    } catch (err) {
      console.error('Failed to leave chat:', err);
      setError('Failed to leave chat');
    }
  };

  if (loading) {
    return <div className="chat-interface loading">Loading chat...</div>;
  }

  if (!chat) {
    return <div className="chat-interface error">Chat not found</div>;
  }

  const isDoctor = user?.is_doctor;
  const otherPerson = isDoctor ? chat.user : chat.doctor;

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="chat-header-info">
          <h3>{otherPerson?.full_name || 'Chat'}</h3>
          <p className="chat-status">
            {chat.status === 'active' ? '🟢 Active' : '⚫ Ended'}
          </p>
        </div>
        <div className="chat-header-actions">
          {isDoctor && chat.status === 'active' && (
            <button onClick={handleEndChat} className="btn-end-chat">
              End Chat
            </button>
          )}
          {!isDoctor && chat.status === 'active' && (
            <button onClick={handleLeaveChat} className="btn-leave-chat">
              Leave
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            // Determine if message is from current user
            const isCurrentUser = msg.sender_id === user.id;
            const senderName = isCurrentUser ? 'You' : (isDoctor ? chat.user?.full_name : chat.doctor?.user?.full_name) || 'User';
            
            return (
              <div
                key={msg.id}
                className={`message ${isCurrentUser ? 'sent' : 'received'}`}
              >
                <div className="message-bubble">
                  <p className="message-sender">{senderName}</p>
                  <p className="message-content">{msg.content}</p>
                  <span className="message-time">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {chat.status === 'active' ? (
        <form onSubmit={handleSendMessage} className="message-input-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={isSending}
            className="message-input"
          />
          <button
            type="submit"
            disabled={isSending || !newMessage.trim()}
            className="send-btn"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </form>
      ) : (
        <div className="chat-ended-notice">
          <p>This chat has ended</p>
          <small>Ended by: {chat.ended_by === 'doctor' ? 'Doctor' : 'You'}</small>
        </div>
      )}
    </div>
  );
}

export default ChatInterface;
