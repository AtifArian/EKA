import React, { useState, useEffect } from 'react';
import { getJournals, getTopJournals } from '../services/api';
import JournalTile from '../components/JournalTile';
import Chatbot from '../components/Chatbot';

function Journals({ user }) {
  const [journals, setJournals] = useState([]);
  const [topJournals, setTopJournals] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchJournals();
    fetchTopJournals();
  }, []);

  useEffect(() => {
    if (topJournals.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % topJournals.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [topJournals]);

  const fetchJournals = async () => {
    try {
      const data = await getJournals({});
      setJournals(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchTopJournals = async () => {
    try {
      const data = await getTopJournals();
      setTopJournals(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container">
      <h1 style={{ color: 'white', marginBottom: '2rem' }}>Community Journals</h1>

      {topJournals.length > 0 && (
        <div className="slideshow-container">
          {topJournals.map((journal, index) => (
            <div key={journal.id} className={`slide ${index === currentSlide ? 'active' : ''}`}>
              <h2>⭐ Featured Journal</h2>
              <h3>{journal.title}</h3>
              <p>{journal.content.substring(0, 200)}...</p>
              <div>❤️ {journal.heart_count} hearts</div>
            </div>
          ))}
        </div>
      )}

      <div className="journal-grid">
        {journals.map(journal => (
          <JournalTile key={journal.id} journal={journal} />
        ))}
      </div>
      <Chatbot />
    </div>
  );
}

export default Journals;
