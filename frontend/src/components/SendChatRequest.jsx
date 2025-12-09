import React, { useState, useEffect } from 'react';
import { sendChatRequest, getSentChatRequests } from '../services/messages';

function SendChatRequest({ doctor, user, onRequestSent }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingRequest, setExistingRequest] = useState(null);

  useEffect(() => {
    checkExistingRequest();
  }, [doctor.id]);

  const checkExistingRequest = async () => {
    try {
      const data = await getSentChatRequests();
      const existing = data.sent_requests?.find(
        (req) => req.to_doctor.id === doctor.id && ['pending', 'accepted'].includes(req.status)
      );
      setExistingRequest(existing);
    } catch (err) {
      console.error('Error checking request:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await sendChatRequest(doctor.id, message);
      setSuccess('Chat request sent successfully!');
      setMessage('');
      setTimeout(() => {
        checkExistingRequest();
        if (onRequestSent) onRequestSent();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  if (existingRequest) {
    return (
      <div className="chat-request-status">
        <p>
          Request status: <span className={existingRequest.status}>
            {existingRequest.status.toUpperCase()}
          </span>
        </p>
        {existingRequest.status === 'accepted' && (
          <p className="active-message">💬 You can now chat with this doctor</p>
        )}
      </div>
    );
  }

  return (
    <div className="send-chat-request">
      <h4>Send Chat Request</h4>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your concern (optional)"
          rows="4"
          className="request-textarea"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-send-request"
        >
          {loading ? 'Sending...' : 'Request Chat'}
        </button>
      </form>
    </div>
  );
}

export default SendChatRequest;
