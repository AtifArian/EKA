import React from 'react';
import { useNavigate } from 'react-router-dom';

function JournalTile({ journal }) {
  const navigate = useNavigate();

  return (
    <div className="tile">
      <div className="tile-content">
        <h3>{journal.title}</h3>
        <p style={{ marginTop: '0.8rem' }}>{journal.content.substring(0, 150)}...</p>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
          <span 
            onClick={() => navigate(`/users/${journal.author.id}`)}
            style={{ cursor: 'pointer', color: '#7F7FD5' }}
          >
            {journal.author.username}
          </span>
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
