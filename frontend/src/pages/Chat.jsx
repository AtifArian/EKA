import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createUserUserThread, getThreadMessages, postThreadMessage, listThreads } from '../services/api';

function Chat({ user }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [threadId, setThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const loadMessages = useCallback(async () => {
    if (!threadId) return;
    try {
      const msgs = await getThreadMessages(threadId);
      setMessages(msgs);
    } catch (e) {
      console.error('Error loading messages:', e);
    }
  }, [threadId]);

  useEffect(() => {
    const init = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      try {
        // Check if a thread already exists with this user
        const threads = await listThreads();
        const existing = threads.find(t => t.thread_type === 'user_user' && t.participants.some(p => p.id === parseInt(userId)));
        let tid = existing?.id;
        if (!tid) {
          const created = await createUserUserThread(parseInt(userId));
          tid = created.id;
        }
        setThreadId(tid);
        const msgs = await getThreadMessages(tid);
        setMessages(msgs);
      } catch (e) {
        // handle quietly
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user, userId, navigate]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!threadId) return;
    const interval = setInterval(() => {
      loadMessages();
    }, 3000);
    return () => clearInterval(interval);
  }, [threadId, loadMessages]);

  const send = async () => {
    if (!text.trim() || !threadId) return;
    await postThreadMessage(threadId, text);
    loadMessages();
    setText('');
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <button onClick={() => navigate(-1)} className="submit-btn" style={{ width: 'auto', marginBottom: '1rem' }}>
        ← Back
      </button>
      <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1rem', minHeight: '300px' }}>
        {messages.map(m => (
          <div key={m.id} style={{
            background: m.sender.id === user.id ? '#dbe7ff' : 'white',
            padding: '0.8rem',
            borderRadius: '10px',
            marginBottom: '0.6rem',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ fontWeight: 600 }}>{m.sender.username}</div>
            <div>{m.content}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '0.8rem', border: '2px solid #e0e0e0', borderRadius: '10px' }}
        />
        <button onClick={send} className="submit-btn" style={{ width: 'auto' }}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
