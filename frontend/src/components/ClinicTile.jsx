import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getResolvedImageUrl, handleImageError } from '../utils/imageHelper';

function ClinicTile({ clinic }) {
  const navigate = useNavigate();
  
  const profilePictureUrl = getResolvedImageUrl(clinic.user?.profile_picture, 'doctor');
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
        onError={(e) => handleImageError(e, 'doctor')}
      />
      <div className="tile-content">
        <h3>{doctorName}</h3>
        {clinic.specialization && (
          <p style={{ color: '#4338CA', fontWeight: '600' }}>{clinic.specialization}</p>
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
