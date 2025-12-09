import React, { useState, useEffect } from 'react';
import { getPendingChatRequests, respondToChatRequest, getMyChats } from '../services/messages';
import ChatInterface from '../components/ChatInterface';
import '../styles/DoctorDashboard.css';

function DoctorDashboard({ user }) {
  const [requests, setRequests] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('requests'); // requests or chats
  const [respondingTo, setRespondingTo] = useState(null);

  useEffect(() => {
    loadData();
    // Refresh every 3 seconds
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const loadData = async () => {
    try {
      const requestsData = await getPendingChatRequests();
      setRequests(requestsData.pending_requests || []);

      const chatsData = await getMyChats();
      setChats(chatsData.chats || []);

      setError('');
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load requests and chats');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId, action) => {
    try {
      setRespondingTo(requestId);
      await respondToChatRequest(requestId, action);
      await loadData();
    } catch (err) {
      console.error('Failed to respond:', err);
      setError('Failed to respond to request');
    } finally {
      setRespondingTo(null);
    }
  };

  const handleChatEnded = () => {
    setSelectedChat(null);
    loadData();
  };

  if (loading) {
    return <div className="doctor-dashboard loading">Loading...</div>;
  }

  if (selectedChat) {
    return (
      <div className="doctor-dashboard-detail">
        <button onClick={() => setSelectedChat(null)} className="back-btn">
          ← Back
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
    <div className="doctor-dashboard">
      <h2>Doctor Dashboard</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Pending Requests ({requests.length})
        </button>
        <button
          className={`tab ${activeTab === 'chats' ? 'active' : ''}`}
          onClick={() => setActiveTab('chats')}
        >
          Active Chats ({chats.length})
        </button>
      </div>

      <div className="content">
        {activeTab === 'requests' ? (
          <div className="requests-section">
            {requests.length === 0 ? (
              <div className="empty-state">
                <p>No pending chat requests</p>
              </div>
            ) : (
              <div className="requests-list">
                {requests.map((request) => (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <h3>{request.from_user?.full_name || 'User'}</h3>
                      <span className="time">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {request.message && (
                      <p className="request-message">
                        <strong>Message:</strong> {request.message}
                      </p>
                    )}

                    <div className="user-info">
                      <p>📧 {request.from_user?.email}</p>
                    </div>

                    <div className="request-actions">
                      <button
                        onClick={() => handleRespond(request.id, 'accept')}
                        disabled={respondingTo === request.id}
                        className="btn-accept"
                      >
                        {respondingTo === request.id ? 'Processing...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleRespond(request.id, 'reject')}
                        disabled={respondingTo === request.id}
                        className="btn-reject"
                      >
                        {respondingTo === request.id ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="chats-section">
            {chats.length === 0 ? (
              <div className="empty-state">
                <p>No active chats</p>
              </div>
            ) : (
              <div className="chats-list">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className="chat-card"
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="chat-header">
                      <h3>{chat.user?.full_name || 'User'}</h3>
                      <span className="status">
                        {chat.status === 'active' ? '🟢' : '⚫'} {chat.status}
                      </span>
                    </div>
                    <p className="chat-info">
                      {chat.message_count} messages
                      <br />
                      Started: {new Date(chat.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <button onClick={loadData} className="refresh-btn">
        🔄 Refresh
      </button>
    </div>
  );
}

export default DoctorDashboard;
