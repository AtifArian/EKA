import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUser, getUserJournals } from '../services/api';

function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [journals, setJournals] = useState([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const userData = await getUser(id);
      setUser(userData);
      const journalsData = await getUserJournals(id);
      setJournals(journalsData);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <div style={{ background: 'white', borderRadius: '25px', padding: '3rem' }}>
        <h1 style={{ color: '#7F7FD5' }}>{user.full_name || user.username}</h1>
        <p>@{user.username}</p>

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
