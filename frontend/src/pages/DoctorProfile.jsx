import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { sendFriendRequest } from '../services/api';
import '../styles/DoctorProfile.css';

function DoctorProfile({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [chatRequests, setChatRequests] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [respondingTo, setRespondingTo] = useState(null);
  const [showChatRequest, setShowChatRequest] = useState(false);
  const [chatRequestNote, setChatRequestNote] = useState('');
  const [chatRequestLoading, setChatRequestLoading] = useState(false);
  const [friendRequestLoading, setFriendRequestLoading] = useState(false);

  useEffect(() => {
    fetchDoctorData();
  }, [id]);

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      // Get doctor by clinic id
      const clinicRes = await api.get(`/clinics/${id}`);
      const clinicData = clinicRes.data;
      setDoctor(clinicData);

      // If current user is a doctor, fetch their requests
      if (user?.is_doctor) {
        try {
          const chatRes = await api.get('/doctors/chat-requests');
          setChatRequests(chatRes.data || []);
        } catch (error) {
          console.log('Could not fetch chat requests:', error);
        }

        try {
          const friendRes = await api.get('/users/friend-requests');
          setFriendRequests(friendRes.data || []);
        } catch (error) {
          console.log('Could not fetch friend requests:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      alert('Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToChatRequest = async (requestId, action) => {
    try {
      setRespondingTo(requestId);
      await api.put(`/doctors/chat-requests/${requestId}`, { status: action === 'accept' ? 'accepted' : 'rejected' });
      alert(`Chat request ${action}ed`);
      fetchDoctorData();
    } catch (error) {
      console.error('Error responding to chat request:', error);
      alert(error.response?.data?.error || 'Failed to respond to request');
    } finally {
      setRespondingTo(null);
    }
  };

  const handleRespondToFriendRequest = async (requestId, action) => {
    try {
      setRespondingTo(requestId);
      await api.post(`/users/friend-request/${requestId}/respond`, { action });
      alert(`Friend request ${action}ed`);
      fetchDoctorData();
    } catch (error) {
      console.error('Error responding to friend request:', error);
      alert(error.response?.data?.error || 'Failed to respond to request');
    } finally {
      setRespondingTo(null);
    }
  };

  const handleSendChatRequest = async (e) => {
    e?.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.is_doctor) {
      alert('Doctors cannot send chat requests to other doctors');
      return;
    }

    try {
      setChatRequestLoading(true);
      
      const doctorId = doctor.id;
      
      const response = await api.post('/messages/chat-request/send', {
        doctor_id: doctorId,
        message: chatRequestNote
      });

      alert('Chat request sent successfully!');
      setChatRequestNote('');
      setShowChatRequest(false);
    } catch (error) {
      console.error('Error sending chat request:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send chat request';
      alert(errorMessage);
    } finally {
      setChatRequestLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.is_doctor) {
      alert('Doctors cannot send friend requests to other doctors');
      return;
    }

    // Prevent users from sending friend request to themselves
    if (user.id === doctor.user_id) {
      alert('You cannot send a friend request to yourself');
      return;
    }

    try {
      setFriendRequestLoading(true);
      
      await sendFriendRequest(doctor.user_id);
      
      alert('Friend request sent successfully!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send friend request';
      alert(errorMessage);
    } finally {
      setFriendRequestLoading(false);
    }
  };

  if (loading) {
    return <div className="doctor-profile-container" style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!doctor) {
    return <div className="doctor-profile-container" style={{ padding: '40px', textAlign: 'center' }}>Doctor not found</div>;
  }

  return (
    <div className="doctor-profile-container">
      <div className="doctor-profile-tabs">
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👨‍⚕️ Profile
        </button>
        {user?.is_doctor && doctor?.user_id === user?.id && (
          <>
            <button
              className={`tab-button ${activeTab === 'chat-requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat-requests')}
            >
              💬 Chat Requests ({chatRequests.length})
            </button>
            <button
              className={`tab-button ${activeTab === 'friend-requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('friend-requests')}
            >
              👥 Friend Requests ({friendRequests.length})
            </button>
          </>
        )}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="doctor-profile-content">
          <div className="doctor-profile-header">
            <div className="doctor-avatar">
              {doctor.user?.full_name?.[0] || 'D'}
            </div>
            <div className="doctor-profile-info">
              <h1>{doctor.user?.full_name || 'Dr. Unknown'}</h1>
              <p className="specialization">{doctor.specialization || 'General Practitioner'}</p>
              <div className="doctor-ratings">
                <span className="rating">⭐ {doctor.average_rating?.toFixed(1) || 'N/A'}</span>
                <span className="reviews">({doctor.review_count || 0} reviews)</span>
              </div>
              
              {/* Action Buttons - Only show for logged-in non-doctor users */}
              {user && !user.is_doctor && (
                <div className="action-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowChatRequest(true)}
                    disabled={chatRequestLoading}
                  >
                    {chatRequestLoading ? '⏳ Sending...' : '💬 Chat with Doctor'}
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={handleSendFriendRequest}
                    disabled={friendRequestLoading}
                  >
                    {friendRequestLoading ? '⏳ Sending...' : '👥 Add Friend'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="doctor-profile-details">
            {doctor.bio && (
              <div className="detail-section">
                <h3>About</h3>
                <p>{doctor.bio}</p>
              </div>
            )}

            {doctor.expertise && (
              <div className="detail-section">
                <h3>Expertise</h3>
                <p>{doctor.expertise}</p>
              </div>
            )}

            {doctor.education && (
              <div className="detail-section">
                <h3>Education</h3>
                <p>{doctor.education}</p>
              </div>
            )}

            {doctor.quote && (
              <div className="detail-section quote-section">
                <p>"{doctor.quote}"</p>
              </div>
            )}

            {doctor.location && (
              <div className="detail-section">
                <h3>📍 Location</h3>
                <p>{doctor.location}</p>
                {doctor.google_maps_link && (
                  <a href={doctor.google_maps_link} target="_blank" rel="noopener noreferrer">
                    View on Google Maps
                  </a>
                )}
              </div>
            )}

            {doctor.session_charge && (
              <div className="detail-section">
                <h3>💳 Session Charge</h3>
                <p>${doctor.session_charge}</p>
              </div>
            )}

            {doctor.reviews && doctor.reviews.length > 0 && (
              <div className="detail-section">
                <h3>Reviews ({doctor.reviews.length})</h3>
                <div className="reviews-list">
                  {doctor.reviews.map((review) => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <span className="reviewer-name">{review.reviewer?.full_name || 'Anonymous'}</span>
                        <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                      <small className="review-date">
                        {new Date(review.created_at).toLocaleDateString()}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chat Request Modal */}
          {showChatRequest && (
            <div className="modal-overlay" onClick={() => setShowChatRequest(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Send Chat Request to {doctor.user?.full_name || 'Doctor'}</h3>
                
                <textarea
                  placeholder="Why do you want to chat with this doctor? (optional)"
                  value={chatRequestNote}
                  onChange={(e) => setChatRequestNote(e.target.value)}
                  rows={5}
                  className="chat-request-textarea"
                />
                
                <div className="modal-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={handleSendChatRequest}
                    disabled={chatRequestLoading}
                  >
                    {chatRequestLoading ? 'Sending...' : 'Send Request'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowChatRequest(false)}
                    disabled={chatRequestLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat Requests Tab (for own doctor profile only) */}
      {activeTab === 'chat-requests' && user?.is_doctor && doctor?.user_id === user?.id && (
        <div className="chat-requests-content">
          {chatRequests.length === 0 ? (
            <div className="empty-state">
              <p>No pending chat requests</p>
            </div>
          ) : (
            <div className="requests-list">
              {chatRequests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <h3>{request.from_user?.full_name || 'User'}</h3>
                    <span className="request-status">{request.status}</span>
                  </div>
                  
                  {request.message && (
                    <div className="request-message">
                      <h4>Request Message:</h4>
                      <p>{request.message}</p>
                    </div>
                  )}
                  
                  <div className="request-date">
                    <small>Sent: {new Date(request.created_at).toLocaleDateString()}</small>
                  </div>
                  
                  {request.status === 'pending' && (
                    <div className="request-actions">
                      <button
                        className="btn-accept"
                        onClick={() => handleRespondToChatRequest(request.id, 'accept')}
                        disabled={respondingTo === request.id}
                      >
                        ✓ Accept
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleRespondToChatRequest(request.id, 'reject')}
                        disabled={respondingTo === request.id}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Friend Requests Tab (for own doctor profile only) */}
      {activeTab === 'friend-requests' && user?.is_doctor && doctor?.user_id === user?.id && (
        <div className="friend-requests-content">
          {friendRequests.length === 0 ? (
            <div className="empty-state">
              <p>No pending friend requests</p>
            </div>
          ) : (
            <div className="requests-list">
              {friendRequests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <h3>{request.from_user?.full_name || 'User'}</h3>
                    <span className="request-status">{request.status}</span>
                  </div>
                  
                  {request.message && (
                    <div className="request-message">
                      <h4>Request Message:</h4>
                      <p>{request.message}</p>
                    </div>
                  )}
                  
                  <div className="request-date">
                    <small>Sent: {new Date(request.created_at).toLocaleDateString()}</small>
                  </div>
                  
                  {request.status === 'pending' && (
                    <div className="request-actions">
                      <button
                        className="btn-accept"
                        onClick={() => handleRespondToFriendRequest(request.id, 'accept')}
                        disabled={respondingTo === request.id}
                      >
                        ✓ Accept
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleRespondToFriendRequest(request.id, 'reject')}
                        disabled={respondingTo === request.id}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DoctorProfile;
