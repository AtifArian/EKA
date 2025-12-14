import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClinicDetail, bookSession, addClinicReview, createDoctorChatRequest } from '../services/api';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function ClinicDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [bookingData, setBookingData] = useState({
    appointment_date: '',
    notes: ''
  });
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });
  const [sendingChatReq, setSendingChatReq] = useState(false);

  const fetchClinicDetail = useCallback(async () => {
    try {
      const data = await getClinicDetail(id);
      setClinic(data);
    } catch (error) {
      console.error('Error fetching clinic:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchClinicDetail();
  }, [fetchClinicDetail]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await bookSession(id, bookingData);
      alert('Session booked successfully!');
      setShowBooking(false);
      setBookingData({ appointment_date: '', notes: '' });
    } catch (error) {
      if (error.response?.status === 402) {
        const amount = error.response?.data?.amount || clinic?.session_charge || 0;
        setPaymentAmount(amount.toString());
        setShowBooking(false);
        setShowPayment(true);
      } else {
        alert(error.response?.data?.error || 'Failed to book session');
      }
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Invalid payment amount');
      return;
    }

    try {
      await bookSession(id, { ...bookingData, payment_confirmed: true });
      alert('Payment processed! Session booked successfully.');
      setShowPayment(false);
      setPaymentAmount('');
      setBookingData({ appointment_date: '', notes: '' });
      fetchClinicDetail();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to process booking');
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await addClinicReview(id, reviewData);
      alert('Review added successfully!');
      setShowReview(false);
      fetchClinicDetail();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add review');
    }
  };

  const handleRequestChat = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setSendingChatReq(true);
      await createDoctorChatRequest(clinic.user.id, 'Hi, I would like to chat.');
      alert('Chat request sent! The doctor will see it in Chat Requests.');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to send chat request');
    } finally {
      setSendingChatReq(false);
    }
  };

  if (!clinic) {
    return <div className="loading">Loading...</div>;
  }

  // Construct full URL for profile picture
  const API_BASE = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://127.0.0.1:5050';
  const profilePictureUrl = clinic.user.profile_picture
    ? `${API_BASE}${clinic.user.profile_picture}`
    : 'https://via.placeholder.com/500x500?text=Doctor';

  return (
    <div className="container">
      <div className="hero-section">
        <div className="hero-image">
          <img 
            src={profilePictureUrl}
            alt={clinic.user.full_name}
          />
        </div>
        <div className="hero-content">
          <h1>{clinic.user.full_name}</h1>
          <p style={{ fontSize: '1.2rem', color: '#7F7FD5', fontWeight: '600', marginBottom: '1rem' }}>
            {clinic.specialization}
          </p>
          {clinic.session_charge > 0 && (
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '0.5rem 1.5rem',
              borderRadius: '25px',
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              ${clinic.session_charge} per session
            </div>
          )}
          <blockquote style={{ 
            fontStyle: 'italic', 
            color: '#666', 
            borderLeft: '4px solid #7F7FD5', 
            paddingLeft: '1rem',
            marginTop: '1rem'
          }}>
            "{clinic.quote || 'Dedicated to your mental wellness'}"
          </blockquote>

          {user && !user.is_doctor && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.2rem' }}>
              <button onClick={() => setShowBooking(true)} className="book-now-btn">
                Book Now
              </button>
              <button
                onClick={handleRequestChat}
                disabled={sendingChatReq}
                className="submit-btn"
                style={{ width: 'auto' }}
              >
                {sendingChatReq ? 'Sending...' : 'Request Chat'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="floating-tiles">
        <div className="floating-tile">
          <h3>Expertise</h3>
          <p>{clinic.expertise || 'General mental health counseling'}</p>
        </div>
        
        <div className="floating-tile">
          <h3>Education</h3>
          <p>{clinic.education || 'Licensed mental health professional'}</p>
        </div>
        
        <div className="floating-tile">
          <h3>Age Group</h3>
          <p>{clinic.age_group || 'All ages'}</p>
        </div>
      </div>

      {(clinic.latitude && clinic.longitude) && (
        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          padding: '2rem', 
          marginTop: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '1rem' }}>Clinic Location</h2>
          <div style={{
            height: '400px',
            borderRadius: '15px',
            overflow: 'hidden',
            border: '2px solid #e0e0e0'
          }}>
            <MapContainer
              center={[clinic.latitude, clinic.longitude]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[clinic.latitude, clinic.longitude]} />
            </MapContainer>
          </div>
          {clinic.location && (
            <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.95rem' }}>
              📍 <strong>{clinic.location}</strong>
            </p>
          )}
        </div>
      )}

      <div className="comments-section" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Reviews ({clinic.reviews.length})</h2>
          {user && !user.is_doctor && (
            <button onClick={() => setShowReview(true)} className="submit-btn" style={{ width: 'auto' }}>
              Write Review
            </button>
          )}
        </div>

        {clinic.reviews.map(review => (
          <div key={review.id} className="comment">
            <div className="comment-avatar">
              {review.user.username.charAt(0).toUpperCase()}
            </div>
            <div className="comment-content">
              <div className="comment-author">{review.user.username}</div>
              <div style={{ color: '#ffd700', marginBottom: '0.5rem' }}>
                {'⭐'.repeat(review.rating)}
              </div>
              <div className="comment-text">{review.comment}</div>
              <div className="comment-date">
                {new Date(review.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!user && (
        <div style={{ marginTop: '1rem' }}>
          <button onClick={() => setShowBooking(true)} className="book-now-btn">
            Book Now
          </button>
        </div>
      )}

      {showBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="form-container">
            <h2>Book Session</h2>
            <form onSubmit={handleBooking}>
              <div className="form-group">
                <label>Appointment Date & Time</label>
                <input
                  type="datetime-local"
                  value={bookingData.appointment_date}
                  onChange={(e) => setBookingData({...bookingData, appointment_date: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                  rows="4"
                />
              </div>
              <button type="submit" className="submit-btn">Confirm Booking</button>
              <button type="button" onClick={() => setShowBooking(false)} style={{ marginTop: '1rem', background: '#ccc' }} className="submit-btn">
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {showReview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="form-container">
            <h2>Write Review</h2>
            <form onSubmit={handleReview}>
              <div className="form-group">
                <label>Rating</label>
                <select
                  value={reviewData.rating}
                  onChange={(e) => setReviewData({...reviewData, rating: parseInt(e.target.value)})}
                >
                  {[5,4,3,2,1].map(r => (
                    <option key={r} value={r}>{r} Stars</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Comment</label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                  rows="4"
                />
              </div>
              <button type="submit" className="submit-btn">Submit Review</button>
              <button type="button" onClick={() => setShowReview(false)} style={{ marginTop: '1rem', background: '#ccc' }} className="submit-btn">
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {showPayment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2.5rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowPayment(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#999'
              }}
            >
              ×
            </button>
            <h2 style={{ 
              marginBottom: '1rem', 
              color: '#667eea',
              textAlign: 'center',
              fontSize: '2rem'
            }}>
              Payment Required
            </h2>
            <p style={{
              textAlign: 'center',
              color: '#666',
              marginBottom: '2rem',
              fontSize: '1rem'
            }}>
              You've used your FREE booking. Please proceed with payment to book this session.
            </p>
            
            <form onSubmit={handlePayment}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  color: '#333',
                  fontWeight: '500'
                }}>
                  Session Charge
                </label>
                <input
                  type="text"
                  value={`$${paymentAmount}`}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '10px',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    boxSizing: 'border-box',
                    background: '#f5f5f5',
                    textAlign: 'center',
                    color: '#667eea'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Complete Payment & Book
              </button>

              <p style={{ 
                marginTop: '1rem', 
                fontSize: '0.85rem', 
                color: '#666',
                textAlign: 'center'
              }}>
                Secure payment processing. Your first booking was FREE! 💙
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClinicDetail;
