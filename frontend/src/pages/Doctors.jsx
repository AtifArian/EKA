import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SendChatRequest from '../components/SendChatRequest';
import api from '../services/api';
import '../styles/Doctors.css';

function Doctors({ user }) {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, [search, specialization]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (search) params.append('search', search);
      if (specialization) params.append('specialization', specialization);
      
      const url = `/clinics/?${params.toString()}`;

      const response = await api.get(url);
      
      const data = response.data;
      setDoctors(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors. Please try again later.');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChat = (doctor) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.is_doctor) {
      setError('Doctors cannot send chat requests to other doctors');
      return;
    }
    setSelectedDoctor(doctor);
    setShowRequestModal(true);
  };

  const handleRequestSent = () => {
    setShowRequestModal(false);
    fetchDoctors();
  };

  if (loading && doctors.length === 0) {
    return <div className="doctors-page loading">Loading doctors...</div>;
  }

  return (
    <div className="doctors-page">
      <div className="doctors-header">
        <h1>Chat with Doctors</h1>
        <p>Browse our doctors and send a chat request to discuss your concerns</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="doctors-filters">
        <input
          type="text"
          placeholder="Search doctors by name or specialty..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-input"
        />
        <select
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="filter-select"
        >
          <option value="">All Specializations</option>
          <option value="Psychiatrist">Psychiatrist</option>
          <option value="Psychologist">Psychologist</option>
          <option value="Counselor">Counselor</option>
          <option value="Therapist">Therapist</option>
          <option value="Mental Health Counselor">Mental Health Counselor</option>
        </select>
      </div>

      <div className="doctors-grid">
        {doctors.length === 0 ? (
          <div className="empty-state">
            <p>No doctors found</p>
            <small>Try adjusting your search filters</small>
          </div>
        ) : (
          doctors.map((doctor) => (
            <div key={doctor.id} className="doctor-card">
              <div className="doctor-card-header">
                <div className="doctor-info">
                  <h3>{doctor.user?.full_name || 'Dr. ' + doctor.user?.username}</h3>
                  <p className="specialization">{doctor.specialization}</p>
                </div>
                {doctor.is_verified && (
                  <span className="verified-badge" title="Verified">✓</span>
                )}
              </div>

              <div className="doctor-card-body">
                {doctor.bio && (
                  <p className="bio">{doctor.bio}</p>
                )}

                <div className="doctor-stats">
                  {doctor.average_rating && (
                    <div className="stat">
                      <span className="stat-label">Rating:</span>
                      <span className="stat-value">⭐ {doctor.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                  {doctor.review_count !== undefined && (
                    <div className="stat">
                      <span className="stat-label">Reviews:</span>
                      <span className="stat-value">{doctor.review_count}</span>
                    </div>
                  )}
                </div>

                {doctor.education && (
                  <div className="doctor-detail">
                    <span className="detail-label">Education:</span>
                    <span className="detail-value">{doctor.education}</span>
                  </div>
                )}

                {doctor.expertise && (
                  <div className="doctor-detail">
                    <span className="detail-label">Expertise:</span>
                    <span className="detail-value">{doctor.expertise}</span>
                  </div>
                )}

                {doctor.session_charge !== undefined && (
                  <div className="doctor-detail">
                    <span className="detail-label">Session Charge:</span>
                    <span className="detail-value">
                      {doctor.session_charge === 0 ? 'Free consultation available' : `Rs. ${doctor.session_charge}`}
                    </span>
                  </div>
                )}
              </div>

              <div className="doctor-card-footer">
                <button
                  onClick={() => handleRequestChat(doctor)}
                  className="btn-request-chat"
                  disabled={user?.is_doctor}
                >
                  💬 Request Chat
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showRequestModal && selectedDoctor && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chat Request to {selectedDoctor.user?.full_name}</h2>
              <button
                className="modal-close"
                onClick={() => setShowRequestModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <SendChatRequest
                doctor={selectedDoctor}
                user={user}
                onRequestSent={handleRequestSent}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Doctors;
