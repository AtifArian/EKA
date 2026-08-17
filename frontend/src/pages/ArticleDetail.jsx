import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArticle, likeArticle, addArticleComment, updateArticle, deleteArticle, trackArticleRead } from '../services/api';
import { getResolvedImageUrl, handleImageError } from '../utils/imageHelper';

function ArticleDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editMoodCategory, setEditMoodCategory] = useState('');
  const [editKeywords, setEditKeywords] = useState('');
  const [newCoverImage, setNewCoverImage] = useState(null);

  const fetchArticle = async () => {
    try {
      const data = await getArticle(id);
      setArticle(data);
      setEditTitle(data.title);
      setEditContent(data.content);
      setEditMoodCategory(data.mood_category || '');
      setEditKeywords(data.keywords || '');
      
      // Track article read if user is logged in
      if (user) {
        try {
          await trackArticleRead(id);
        } catch (error) {
          // Silently fail - tracking is not critical
          console.log('Article read tracking failed:', error);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchArticle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const result = await likeArticle(id);
      setIsLiked(result.liked);
      fetchArticle();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!comment.trim()) return;
    
    try {
      await addArticleComment(id, { content: comment });
      setComment('');
      fetchArticle();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(article.title);
    setEditContent(article.content);
    setEditMoodCategory(article.mood_category || '');
    setEditKeywords(article.keywords || '');
    setNewCoverImage(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim()) {
      alert('Title and content are required');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('content', editContent);
      formData.append('mood_category', editMoodCategory);
      formData.append('keywords', editKeywords);
      if (newCoverImage) {
        formData.append('cover_image', newCoverImage);
      }
      
      await updateArticle(id, formData);
      setIsEditing(false);
      setNewCoverImage(null);
      fetchArticle();
      alert('Article updated successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.error || 'Failed to update article');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteArticle(id);
      alert('Article deleted successfully');
      navigate('/articles');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete article');
    }
  };

  if (!article) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <div style={{
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '20px',
        padding: '3rem',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header with author info and edit/delete buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '2px solid #f0f0f0'
        }}>
          <div style={{ flex: 1 }}>
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={{
                  width: '100%',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  border: '2px solid #667eea',
                  borderRadius: '10px',
                  padding: '0.5rem',
                  marginBottom: '0.5rem'
                }}
              />
            ) : (
              <h1 style={{ margin: 0, marginBottom: '0.5rem', color: '#1f2937' }}>{article.title}</h1>
            )}
            <p style={{ margin: 0, color: '#1f2937' }}>
              By{' '}
              <span 
                onClick={() => navigate(`/users/${article.author?.id}`)}
                style={{ cursor: 'pointer', color: '#7F7FD5', fontWeight: 'bold' }}
              >
                Dr. {article.author?.username || 'Unknown'}
              </span>
              {' • '}
              {new Date(article.created_at).toLocaleDateString()}
            </p>
            {!isEditing && article.keywords && (
              <p style={{ margin: '0.5rem 0 0 0', color: '#4b5563', fontSize: '0.9rem' }}>
                Keywords: {article.keywords}
              </p>
            )}
          </div>

          {article.is_author && (
            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
              {!isEditing ? (
                <>
                  <button
                    onClick={handleEdit}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '0.6rem 1.2rem',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    style={{
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '0.6rem 1.2rem',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSaveEdit}
                    style={{
                      background: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '0.6rem 1.2rem',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ✓ Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    style={{
                      background: '#ccc',
                      color: '#333',
                      border: 'none',
                      padding: '0.6rem 1.2rem',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ✕ Cancel
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Article content or edit form */}
        {isEditing ? (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Mood Category (optional)
              </label>
              <select
                value={editMoodCategory}
                onChange={(e) => setEditMoodCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: '10px',
                  border: '2px solid #e0e0e0',
                  fontSize: '1rem'
                }}
              >
                <option value="">Select mood category</option>
                <option value="happy">Happy</option>
                <option value="sad">Sad</option>
                <option value="anxious">Anxious</option>
                <option value="stressed">Stressed</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Keywords (comma-separated, optional)
              </label>
              <input
                type="text"
                value={editKeywords}
                onChange={(e) => setEditKeywords(e.target.value)}
                placeholder="e.g. anxiety, depression, wellness"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: '10px',
                  border: '2px solid #e0e0e0',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Update Cover Image (optional)
              </label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setNewCoverImage(file);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: '10px',
                  border: '2px solid #e0e0e0',
                  fontSize: '1rem'
                }}
              />
              {newCoverImage && (
                <small style={{ color: '#4CAF50', display: 'block', marginTop: '0.5rem' }}>
                  ✓ New image selected: {newCoverImage.name}
                </small>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Content
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows="20"
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '10px',
                  border: '2px solid #e0e0e0',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  lineHeight: '1.8'
                }}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Cover Image */}
            {article.cover_image && (
              <div style={{ 
                marginTop: '2rem',
                marginBottom: '2rem',
                borderRadius: '15px',
                overflow: 'hidden',
                maxHeight: '500px'
              }}>
                <img 
                  src={getResolvedImageUrl(article.cover_image, 'article')}
                  alt={article.title}
                  onError={(e) => handleImageError(e, 'article')}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    objectFit: 'cover'
                  }}
                />
              </div>
            )}
            
            {/* Content */}
            <div style={{ 
              whiteSpace: 'pre-wrap', 
              lineHeight: '1.8',
              fontSize: '1.1rem',
              color: '#1f2937'
            }}>
              {article.content}
            </div>
          </>
        )}
        
        {/* Action buttons (only show when not editing) */}
        {!isEditing && (
          <div className="action-buttons" style={{ 
            marginTop: '3rem',
            paddingTop: '2rem',
            borderTop: '2px solid #f0f0f0',
            display: 'flex',
            gap: '1rem'
          }}>
            <button 
              onClick={handleLike} 
              className="like-btn"
              style={{
                background: isLiked ? '#4CAF50' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '0.8rem 1.5rem',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              👍 {article.like_count} {article.like_count === 1 ? 'Like' : 'Likes'}
            </button>
            <div style={{
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              padding: '0.8rem 1.5rem'
            }}>
              💬 {article.comment_count} {article.comment_count === 1 ? 'Comment' : 'Comments'}
            </div>
          </div>
        )}

        {/* Comments section (only show when not editing) */}
        {!isEditing && (
          <div className="comments-section" style={{ marginTop: '3rem' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>Comments</h2>
            
            {user && (
              <form onSubmit={handleComment} style={{ marginBottom: '2rem' }}>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts on this article..."
                  rows="4"
                  style={{ 
                    width: '100%', 
                    padding: '1rem', 
                    borderRadius: '15px',
                    background: 'rgba(255, 255, 255, 0.35)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    color: '#1f2937'
                  }}
                />
                <button 
                  type="submit" 
                  className="submit-btn" 
                  style={{ 
                    marginTop: '1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '0.8rem 2rem',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  Post Comment
                </button>
              </form>
            )}

            {!user && (
              <div style={{
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '15px',
                textAlign: 'center',
                marginBottom: '2rem'
              }}>
                <p style={{ margin: 0, color: '#1f2937' }}>
                  <span 
                    onClick={() => navigate('/login')}
                    style={{ 
                      color: '#7F7FD5', 
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      textDecoration: 'underline'
                    }}
                  >
                    Login
                  </span>
                  {' '}to like and comment on this article
                </p>
              </div>
            )}

            {article.comments && article.comments.length > 0 ? (
              article.comments.map(c => (
                <div 
                  key={c.id} 
                  className="comment" 
                  style={{ 
                    marginTop: '1rem', 
                    padding: '1.5rem', 
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '15px'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.8rem'
                  }}>
                    <div 
                      onClick={() => navigate(`/users/${c.user.id}`)}
                      style={{ 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem'
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid #7F7FD5',
                        background: '#f0f0f0',
                        flexShrink: 0
                      }}>
                        {c.user.profile_picture ? (
                          <img 
                            src={getResolvedImageUrl(c.user.profile_picture, 'user')}
                            alt={c.user.username}
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
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                          }}>
                            {c.user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <strong style={{ color: '#7F7FD5' }}>
                        {c.user.username}
                      </strong>
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#999' }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, marginLeft: '48px', lineHeight: '1.6', color: '#1f2937' }}>{c.content}</p>
                </div>
              ))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem', 
                color: '#6b7280' 
              }}>
                No comments yet. Be the first to share your thoughts!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ArticleDetail;
