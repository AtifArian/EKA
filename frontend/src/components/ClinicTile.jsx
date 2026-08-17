import React from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_DOCTOR_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%237B85C4"/><stop offset="100%" stop-color="%239BA5D4"/></linearGradient></defs><rect width="200" height="200" fill="url(%23g)"/><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="54" fill="white">🩺</text></svg>`;

function ClinicTile({ clinic }) {
  const navigate = useNavigate();
  
  const API_BASE = process.env.REACT_APP_API_URL 
    ? process.env.REACT_APP_API_URL.replace('/api', '') 
    : 'http://127.0.0.1:5050';

  const profilePictureUrl = clinic.user?.profile_picture 
    ? `${API_BASE}${clinic.user.profile_picture}`
    : DEFAULT_DOCTOR_AVATAR;

  const doctorName = clinic.user?.full_name || clinic.user?.username || 'Verified Doctor';

  return (
    <div 
      className="tile" 
      onClick={() => navigate(`/clinics/${clinic.id}`)}
      role="article"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/clinics/${clinic.id}`);
        }
      }}
      aria-label={`View doctor profile: ${doctorName}`}
    >
      <img 
        src={profilePictureUrl} 
        alt={doctorName}
        className="tile-image"
        loading="lazy"
        width="200"
        height="200"
        decoding="async"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = DEFAULT_DOCTOR_AVATAR;
        }}
      />
      <div className="tile-content">
        <h3>{doctorName}</h3>
        {clinic.specialization && (
          <p style={{ color: '#7B85C4', fontWeight: '600' }}>{clinic.specialization}</p>
        )}
        {clinic.bio && <p>{clinic.bio}</p>}
        <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#4B5563' }}>
          ⭐ {(clinic.average_rating || 0).toFixed(1)} ({clinic.review_count || 0} reviews)
          {!clinic.is_verified && (
            <span style={{ 
              marginLeft: '10px', 
              color: '#B45309', 
              fontSize: '0.8em',
              padding: '2px 8px',
              backgroundColor: '#FEF3C7',
              borderRadius: '4px',
              fontWeight: '600'
            }}>
              Pending Verification
            </span>
          )}
        </div>
      </div>
      <div className="arrow" aria-hidden="true">→</div>
    </div>
  );
}

export default ClinicTile;
