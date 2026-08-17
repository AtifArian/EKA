import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getResolvedImageUrl, handleImageError } from '../utils/imageHelper';

function ArticleTile({ article }) {
  const navigate = useNavigate();
  
  const coverImageUrl = getResolvedImageUrl(article.cover_image, 'article');

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
        onError={(e) => handleImageError(e, 'article')}
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
                src={getResolvedImageUrl(article.author.profile_picture, 'user')}
                alt={article.author.username || 'Author avatar'}
                loading="lazy"
                width="28"
                height="28"
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
