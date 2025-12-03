import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUser, getUserJournals } from '../services/api';

function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [journals, setJournals] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const userData = await getUser(id);
        const journalsData = await getUserJournals(id);
        if (mounted) {
          setUser(userData);
          setJournals(journalsData);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, [id]);

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <div style={{ background: 'white', borderRadius: '25px', padding: '3rem' }}>
        {/* Profile Header with Picture */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '4px solid #7F7FD5',
            background: '#f0f0f0',
            flexShrink: 0
          }}>
            {user.profile_picture ? (
              <img 
                src={`http://127.0.0.1:5050/${user.profile_picture}`}
                alt={user.username}
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
                fontSize: '2.5rem',
                fontWeight: 'bold'
              }}>
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div>
            <h1 style={{ color: '#7F7FD5', marginBottom: '0.3rem' }}>
              {user.full_name || user.username}
            </h1>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>@{user.username}</p>
          </div>
        </div>

        <h2 style={{ marginTop: '2rem' }}>Public Journals</h2>
        {journals.map(journal => (
          <div key={journal.id} style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '10px', marginTop: '1rem' }}>
            <h3>{journal.title}</h3>
            <p>{journal.content}</p>
            <div>❤️ {journal.heart_count} • 💬 {journal.comment_count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserProfile;
