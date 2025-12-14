import React from 'react';
import { useNavigate } from 'react-router-dom';

function JournalTile({ journal }) {
  const navigate = useNavigate();

  return (
    <div 
      className="tile"
      onClick={() => navigate(`/journals/${journal.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className="tile-content">
        <h3>{journal.title}</h3>
        <p style={{ marginTop: '0.8rem' }}>{journal.content.substring(0, 150)}...</p>
        <div style={{ 
          marginTop: '1rem', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/users/${journal.author.id}`);
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
              {journal.author.profile_picture ? (
                <img 
                  src={`${process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://127.0.0.1:5050'}/${journal.author.profile_picture}`}
                  alt={journal.author.username}
                  loading="lazy"
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
                  {journal.author.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span style={{ color: '#7F7FD5' }}>
              {journal.author.username}
            </span>
          </div>
          <div>
            <span>❤️ {journal.heart_count}</span>
            <span style={{ marginLeft: '1rem' }}>💬 {journal.comment_count}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JournalTile;
