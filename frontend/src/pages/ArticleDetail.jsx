import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArticle, likeArticle, addArticleComment } from '../services/api';

function ArticleDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const data = await getArticle(id);
      setArticle(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await likeArticle(id);
      fetchArticle();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;
    try {
      await addArticleComment(id, { content: comment });
      setComment('');
      fetchArticle();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!article) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '3rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <h1>{article.title}</h1>
        <p style={{ whiteSpace: 'pre-wrap', marginTop: '2rem' }}>{article.content}</p>
        
        <div className="action-buttons" style={{ marginTop: '2rem' }}>
          <button onClick={handleLike} className="like-btn">
            👍 {article.like_count} Likes
          </button>
        </div>

        <div className="comments-section" style={{ marginTop: '2rem' }}>
          <h2>Comments</h2>
          {user && (
            <form onSubmit={handleComment}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                rows="3"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px' }}
              />
              <button type="submit" className="submit-btn" style={{ marginTop: '1rem' }}>
                Post Comment
              </button>
            </form>
          )}
          {article.comments && article.comments.map(c => (
            <div key={c.id} className="comment" style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '10px' }}>
              <strong>{c.user.username}</strong>
              <p>{c.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ArticleDetail;
