import React from 'react';
import { useNavigate } from 'react-router-dom';

function ClinicTile({ clinic }) {
  const navigate = useNavigate();
  
  // Construct full URL for profile picture
  const API_BASE = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://127.0.0.1:5050';
  const profilePictureUrl = clinic.user.profile_picture 
    ? `${API_BASE}${clinic.user.profile_picture}`
    : 'https://via.placeholder.com/200x200?text=Doctor';

  return (
    <div className="tile" onClick={() => navigate(`/clinics/${clinic.id}`)}>
      <img 
        src={profilePictureUrl} 
        alt={clinic.user.full_name}
        className="tile-image"
      />
      <div className="tile-content">
        <h3>{clinic.user.full_name || clinic.user.username}</h3>
        {clinic.specialization && (
          <p style={{ color: '#7F7FD5' }}>{clinic.specialization}</p>
        )}
        {clinic.bio && <p>{clinic.bio}</p>}
        <div>
          ⭐ {(clinic.average_rating || 0).toFixed(1)} ({clinic.review_count || 0} reviews)
          {!clinic.is_verified && (
            <span style={{ 
              marginLeft: '10px', 
              color: '#f39c12', 
              fontSize: '0.8em',
              padding: '2px 6px',
              backgroundColor: '#fff3cd',
              borderRadius: '4px'
            }}>
              Pending Verification
            </span>
          )}
        </div>
      </div>
      <div className="arrow">→</div>
    </div>
  );
}

export default ClinicTile;
