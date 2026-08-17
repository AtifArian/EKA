import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJournals, getTopJournals } from '../services/api';
import JournalTile from '../components/JournalTile';
import Chatbot from '../components/Chatbot';

function Journals({ user }) {
  const navigate = useNavigate();
  const [journals, setJournals] = useState([]);
  const [topJournals, setTopJournals] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJournals();
    fetchTopJournals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (topJournals.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % topJournals.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [topJournals.length]);

  const fetchJournals = async () => {
    if (journals.length === 0) setLoading(true);
    try {
      const data = await getJournals({});
      setJournals(data || []);
    } catch (error) {
      console.error('Error fetching journals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopJournals = async () => {
    try {
      const data = await getTopJournals();
      setTopJournals(data || []);
    } catch (error) {
      console.error('Error fetching top journals:', error);
    }
  };

  return (
    <div className="container">
      <h1 style={{ color: 'white', marginBottom: '2rem', fontSize: '2.2rem', fontWeight: '800' }}>
        Community Journals
      </h1>

      {/* Featured Journals Section */}
      {topJournals.length > 0 && (
        <section className="featured-section" aria-label="Featured Journals">
          <div className="featured-container">
            {topJournals.map((journal, index) => {
              const isActive = index === currentSlide;
              return (
                <div
                  key={journal.id}
                  className={`featured-card ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(`/journals/${journal.id}`)}
                  role="button"
                  tabIndex={isActive ? 0 : -1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/journals/${journal.id}`);
                    }
                  }}
                  aria-label={`Featured Journal: ${journal.title}`}
                >
                  <div className="featured-card-layout">
                    <div className="featured-journal-icon" aria-hidden="true">
                      📖
                    </div>
                    <div className="featured-card-body">
                      <div className="featured-pill-badge" style={{ position: 'static', alignSelf: 'flex-start', marginBottom: '0.5rem' }}>
                        ⭐ FEATURED JOURNAL
                      </div>
                      <h2 className="featured-title">{journal.title}</h2>
                      <p className="featured-excerpt">
                        {journal.content ? journal.content.substring(0, 220) + '...' : ''}
                      </p>
                      <div className="featured-card-footer">
                        <div className="featured-author-chip">
                          <span>✍️ By {journal.user?.username || 'Community Member'}</span>
                        </div>
                        <div className="featured-stats">
                          <span>❤️ {journal.heart_count || 0} Hearts</span>
                          <span>💬 {journal.comment_count || 0} Comments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Slider Navigation */}
            {topJournals.length > 1 && (
              <>
                <button
                  className="featured-nav-btn prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide((prev) => (prev - 1 + topJournals.length) % topJournals.length);
                  }}
                  aria-label="Previous featured journal"
                >
                  ‹
                </button>
                <button
                  className="featured-nav-btn next"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide((prev) => (prev + 1) % topJournals.length);
                  }}
                  aria-label="Next featured journal"
                >
                  ›
                </button>
                <div className="featured-dots">
                  {topJournals.map((_, idx) => (
                    <button
                      key={idx}
                      className={`featured-dot ${idx === currentSlide ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide(idx);
                      }}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {loading && journals.length === 0 ? (
        <div className="skeleton-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="skeleton-card" />
          ))}
        </div>
      ) : journals.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '20px',
          color: '#1f2937'
        }}>
          <h3>No journals shared yet</h3>
          <p>Be the first to share your thoughts with the community!</p>
        </div>
      ) : (
        <div className="journal-grid">
          {journals.map((journal) => (
            <JournalTile key={journal.id} journal={journal} />
          ))}
        </div>
      )}
      <Chatbot />
    </div>
  );
}

export default Journals;
