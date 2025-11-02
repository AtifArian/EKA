import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home({ user }) {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="hero-section">
        <div className="hero-image">
          <img 
            src="https://via.placeholder.com/500x400?text=Mental+Wellness" 
            alt="Mental Wellness"
          />
        </div>
        <div className="hero-content">
          <h1>Welcome to MindCare</h1>
          <p>
            Your journey to mental wellness starts here. Connect with professional 
            therapists, track your mood, share your thoughts, and build a supportive 
            community. We're here to help you every step of the way.
          </p>
          <p style={{ marginTop: '1rem' }}>
            Whether you're seeking professional help, looking for resources, or 
            wanting to journal your experiences, MindCare provides a safe and 
            supportive platform for your mental health journey.
          </p>
        </div>
      </div>

      <div 
        onClick={() => navigate('/articles')}
        style={{
          marginTop: '3rem',
          cursor: 'pointer',
          position: 'relative',
          borderRadius: '25px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          transition: 'transform 0.3s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <img 
          src="https://via.placeholder.com/1200x300?text=Explore+Our+Articles" 
          alt="Articles"
          style={{ width: '100%', display: 'block' }}
        />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255,255,255,0.95)',
          padding: '2rem 3rem',
          borderRadius: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#7F7FD5', marginBottom: '0.5rem' }}>
            Explore Articles
          </h2>
          <p style={{ color: '#666' }}>
            Read expert insights and wellness tips
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
