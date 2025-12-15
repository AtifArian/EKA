import React from 'react';
import { useNavigate } from 'react-router-dom';

function ArticleTile({ article }) {
  const navigate = useNavigate();
  
  const API_BASE = process.env.REACT_APP_API_URL 
    ? process.env.REACT_APP_API_URL.replace('/api', '') 
    : 'http://127.0.0.1:5050';
  
  const coverImageUrl = article.cover_image 
    ? `${API_BASE}${article.cover_image}` 
    : 'https://via.placeholder.com/400x200?text=Article';

  return (
    <div className="tile" onClick={() => navigate(`/articles/${article.id}`)}>
      <img 
        src={coverImageUrl} 
        alt={article.title}
        className="tile-image"
        loading="lazy"
      />
      <div className="tile-content">
        <h3>{article.title}</h3>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          marginTop: '0.5rem' 
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #7F7FD5',
            background: '#f0f0f0',
            flexShrink: 0
          }}>
            {article.author?.profile_picture ? (
              <img 
                src={`${process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://127.0.0.1:5050'}/${article.author.profile_picture}`}
                alt={article.author.username}
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
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                {article.author?.username?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>
          <span>By {article.author?.username || 'Unknown'}</span>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <span>👍 {article.like_count}</span>
          <span style={{ marginLeft: '1rem' }}>💬 {article.comment_count}</span>
        </div>
      </div>
      <div className="arrow">→</div>
    </div>
  );
}

export default ArticleTile;
