import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJournal, heartJournal, addJournalComment, updateJournal, deleteJournal } from '../services/api';
import { getResolvedImageUrl, handleImageError } from '../utils/imageHelper';

function JournalDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [journal, setJournal] = useState(null);
  const [comment, setComment] = useState('');
  const [isHearted, setIsHearted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(false);

  const fetchJournal = async () => {
    try {
      const data = await getJournal(id);
      setJournal(data);
      setEditTitle(data.title);
      setEditContent(data.content);
      setEditIsPublic(data.is_public);
      // Check if current user has hearted this journal
      // Note: Backend doesn't return this info yet, but we'll handle the toggle
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 403) {
        alert('This journal is private');
        navigate('/journals');
      }
    }
  };

  useEffect(() => {
    fetchJournal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleHeart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const result = await heartJournal(id);
      setIsHearted(result.hearted);
      fetchJournal(); // Refresh to get updated heart count
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 403) {
        alert('Cannot like a private journal');
      }
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
      await addJournalComment(id, { content: comment });
      setComment('');
      fetchJournal(); // Refresh to get new comment
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 403) {
        alert('Cannot comment on a private journal');
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(journal.title);
    setEditContent(journal.content);
    setEditIsPublic(journal.is_public);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim()) {
      alert('Title and content are required');
      return;
    }

    try {
      await updateJournal(id, {
        title: editTitle,
        content: editContent,
        is_public: editIsPublic
      });
      setIsEditing(false);
      fetchJournal();
      alert('Journal updated successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update journal');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this journal? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteJournal(id);
      alert('Journal deleted successfully');
      navigate('/journals');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete journal');
    }
  };

  if (!journal) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '3rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        {/* Header with author info */}
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
              <h1 style={{ margin: 0, marginBottom: '0.5rem' }}>{journal.title}</h1>
            )}
            <p style={{ margin: 0, color: '#666' }}>
              By{' '}
              <span 
                onClick={() => navigate(`/users/${journal.author.id}`)}
                style={{ cursor: 'pointer', color: '#7F7FD5', fontWeight: 'bold' }}
              >
                {journal.author.username}
              </span>
              {' • '}
              {new Date(journal.created_at).toLocaleDateString()}
            </p>
            {isEditing && (
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginTop: '0.5rem',
                color: '#666'
              }}>
                <input
                  type="checkbox"
                  checked={editIsPublic}
                  onChange={(e) => setEditIsPublic(e.target.checked)}
                />
                Make this journal public
              </label>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem', flexDirection: 'column' }}>
            {journal.emotion && !isEditing && (
              <div style={{
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                {journal.emotion}
              </div>
            )}
            
            {journal.is_owner && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap'
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
                      🗑️
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
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap'
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
                      ✕
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Journal content */}
        {isEditing ? (
          <div style={{ marginTop: '2rem' }}>
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
        ) : (
          <div style={{ 
            whiteSpace: 'pre-wrap', 
            marginTop: '2rem',
            lineHeight: '1.8',
            fontSize: '1.1rem'
          }}>
            {journal.content}
          </div>
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
              onClick={handleHeart} 
              className="like-btn"
              style={{
                background: isHearted ? '#ff6b9d' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
              ❤️ {journal.heart_count} {journal.heart_count === 1 ? 'Heart' : 'Hearts'}
            </button>
            <div style={{
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              padding: '0.8rem 1.5rem'
            }}>
              💬 {journal.comment_count} {journal.comment_count === 1 ? 'Comment' : 'Comments'}
            </div>
          </div>
        )}

        {/* Comments section (only show when not editing) */}
        {!isEditing && (
        <div className="comments-section" style={{ marginTop: '3rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Comments</h2>
          
          {user && (
            <form onSubmit={handleComment} style={{ marginBottom: '2rem' }}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows="4"
                style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  borderRadius: '15px',
                  border: '2px solid #e0e0e0',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
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
              background: '#f8f9fa',
              borderRadius: '15px',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <p style={{ margin: 0 }}>
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
                {' '}to like and comment on this journal
              </p>
            </div>
          )}

          {journal.comments && journal.comments.length > 0 ? (
            journal.comments.map(c => (
              <div 
                key={c.id} 
                className="comment" 
                style={{ 
                  marginTop: '1rem', 
                  padding: '1.5rem', 
                  background: '#f8f9fa', 
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
                <p style={{ margin: 0, marginLeft: '48px', lineHeight: '1.6' }}>{c.content}</p>
              </div>
            ))
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              color: '#999' 
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

export default JournalDetail;
