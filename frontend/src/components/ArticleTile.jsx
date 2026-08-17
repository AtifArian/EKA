import React from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_ARTICLE_COVER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="320" viewBox="0 0 600 320"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%237B85C4"/><stop offset="100%" stop-color="%239BA5D4"/></linearGradient></defs><rect width="600" height="320" fill="url(%23g)"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="42" fill="white">🌿</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="bold" fill="white">Mental Wellness Guide</text></svg>`;

function ArticleTile({ article }) {
  const navigate = useNavigate();
  
  const API_BASE = process.env.REACT_APP_API_URL 
    ? process.env.REACT_APP_API_URL.replace('/api', '') 
    : 'http://127.0.0.1:5050';
  
  const coverImageUrl = article.cover_image 
    ? `${API_BASE}${article.cover_image}` 
    : DEFAULT_ARTICLE_COVER;

  return (
    <div 
      className="tile" 
      onClick={() => navigate(`/articles/${article.id}`)}
      role="article"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/articles/${article.id}`);
        }
      }}
      aria-label={`Read article: ${article.title}`}
    >
      <img 
        src={coverImageUrl} 
        alt={article.title || 'Article cover'}
        className="tile-image"
        loading="lazy"
        width="380"
        height="190"
        decoding="async"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = DEFAULT_ARTICLE_COVER;
        }}
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
                src={`${API_BASE}/${article.author.profile_picture}`}
                alt={article.author.username || 'Author avatar'}
                loading="lazy"
                width="28"
                height="28"
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
          <span style={{ fontSize: '0.9rem', color: '#4B5563' }}>
            By {article.author?.username || 'EKA Expert'}
          </span>
        </div>
        <div style={{ marginTop: '0.9rem', fontSize: '0.9rem', color: '#6B7280', display: 'flex', alignItems: 'center' }}>
          <span>👍 {article.like_count || 0}</span>
          <span style={{ marginLeft: '1rem' }}>💬 {article.comment_count || 0}</span>
        </div>
      </div>
      <div className="arrow" aria-hidden="true">→</div>
    </div>
  );
}

export default ArticleTile;
