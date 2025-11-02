import React from 'react';
import { useNavigate } from 'react-router-dom';

function ArticleTile({ article }) {
  const navigate = useNavigate();

  return (
    <div className="tile" onClick={() => navigate(`/articles/${article.id}`)}>
      <img 
        src={article.cover_image || 'https://via.placeholder.com/400x200?text=Article'} 
        alt={article.title}
        className="tile-image"
      />
      <div className="tile-content">
        <h3>{article.title}</h3>
        <p>By {article.author.user.username}</p>
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
