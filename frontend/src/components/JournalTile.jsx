import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getResolvedImageUrl, handleImageError } from '../utils/imageHelper';

function JournalTile({ journal }) {
  const navigate = useNavigate();

  return (
    <div 
      className="tile"
      onClick={() => navigate(`/journals/${journal.id}`)}
      role="article"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/journals/${journal.id}`);
        }
      }}
      aria-label={`Read journal: ${journal.title}`}
      style={{ cursor: 'pointer' }}
    >
      <div className="tile-content">
        <h3>{journal.title}</h3>
        <p style={{ marginTop: '0.8rem', color: '#4B5563', lineHeight: '1.6' }}>
          {journal.content ? journal.content.substring(0, 150) + '...' : ''}
        </p>
        <div style={{ 
          marginTop: '1rem', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div 
            onClick={(e) => {
              e.stopPropagation();
              if (journal.author?.id) {
                navigate(`/users/${journal.author.id}`);
              }
            }}
            style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem' 
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #7F7FD5',
              background: '#f0f0f0',
              flexShrink: 0
            }}>
              {journal.author?.profile_picture ? (
                <img 
                  src={getResolvedImageUrl(journal.author.profile_picture, 'user')}
                  alt={journal.author?.username || 'User avatar'}
                  loading="lazy"
                  width="32"
                  height="32"
                  onError={(e) => handleImageError(e, 'user')}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #7F7FD5, #86A8E7)',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  {journal.author?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <span style={{ color: '#4338CA', fontWeight: '600', fontSize: '0.9rem' }}>
              {journal.author?.username || 'Anonymous'}
            </span>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>
            <span>❤️ {journal.heart_count || 0}</span>
            <span style={{ marginLeft: '1rem' }}>💬 {journal.comment_count || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JournalTile;
