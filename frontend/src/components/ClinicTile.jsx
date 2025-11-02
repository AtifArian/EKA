import React from 'react';
import { useNavigate } from 'react-router-dom';

function ClinicTile({ clinic }) {
  const navigate = useNavigate();

  return (
    <div className="tile" onClick={() => navigate(`/clinics/${clinic.id}`)}>
      <img 
        src={clinic.user.profile_picture || 'https://via.placeholder.com/200x200?text=Doctor'} 
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
