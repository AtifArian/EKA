import React, { useState, useEffect } from 'react';
import { getMyChats, getSentChatRequests } from '../services/messages';
import ChatInterface from '../components/ChatInterface';
import '../styles/MyChats.css';

function MyChats({ user }) {
  const [chats, setChats] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('chats'); // chats or requests

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const chatsData = await getMyChats();
      setChats(chatsData.chats || []);

      const requestsData = await getSentChatRequests();
      setRequests(requestsData.sent_requests || []);

      setError('');
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load chats and requests');
    } finally {
      setLoading(false);
    }
  };

  const handleChatEnded = () => {
    setSelectedChat(null);
    loadData();
  };

  const getOtherPerson = (chat) => {
    return user.is_doctor ? chat.user : chat.doctor;
  };

  if (loading) {
    return <div className="my-chats loading">Loading your chats...</div>;
  }

  if (selectedChat) {
    return (
      <div className="my-chats-detail">
        <button onClick={() => setSelectedChat(null)} className="back-btn">
          ← Back to Chats
        </button>
        <ChatInterface
          chatId={selectedChat.id}
          user={user}
          onChatEnded={handleChatEnded}
        />
      </div>
    );
  }

  return (
    <div className="my-chats">
      <h2>My Conversations</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'chats' ? 'active' : ''}`}
          onClick={() => setActiveTab('chats')}
        >
          Active Chats ({chats.length})
        </button>
        <button
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Chat Requests ({requests.filter(r => r.status === 'pending').length})
        </button>
      </div>

      <div className="chats-container">
        {activeTab === 'chats' ? (
          <div className="chats-list">
            {chats.length === 0 ? (
              <div className="empty-state">
                <p>No active chats</p>
                <small>Send a chat request to start a conversation with a doctor</small>
              </div>
            ) : (
              chats.map((chat) => {
                const otherPerson = getOtherPerson(chat);
                return (
                  <div
                    key={chat.id}
                    className="chat-item"
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="chat-item-header">
                      <h4>{otherPerson?.full_name || 'Unknown'}</h4>
                      <span className="status-badge">
                        {chat.status === 'active' ? '🟢 Active' : '⚫ Ended'}
                      </span>
                    </div>
                    <p className="chat-meta">
                      {chat.message_count} messages
                      <br />
                      Started: {new Date(chat.created_at).toLocaleDateString()}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="requests-list">
            {requests.length === 0 ? (
              <div className="empty-state">
                <p>No chat requests sent</p>
              </div>
            ) : (
              requests.map((request) => (
                <div key={request.id} className="request-item">
                  <div className="request-header">
                    <h4>{request.to_doctor?.user?.full_name || 'Doctor'}</h4>
                    <span className={`status-badge ${request.status}`}>
                      {request.status.toUpperCase()}
                    </span>
                  </div>
                  {request.message && (
                    <p className="request-message">{request.message}</p>
                  )}
                  <p className="request-date">
                    Sent: {new Date(request.created_at).toLocaleDateString()}
                  </p>
                  {request.responded_at && (
                    <p className="responded-date">
                      Responded: {new Date(request.responded_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <button onClick={loadData} className="refresh-btn">
        Refresh
      </button>
    </div>
  );
}

export default MyChats;
