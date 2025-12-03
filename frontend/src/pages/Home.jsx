import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home({ user }) {
  const navigate = useNavigate();
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);

  const handleDonation = () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    console.log('Donation:', {
      amount: donationAmount,
      name: isAnonymous ? 'Anonymous' : donorName || 'Anonymous',
      timestamp: new Date().toISOString()
    });

    setDonationSuccess(true);
    setTimeout(() => {
      setShowDonationModal(false);
      setDonationSuccess(false);
      setDonationAmount('');
      setDonorName('');
      setIsAnonymous(false);
    }, 2000);
  };

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

      {/* Donation Section */}
      <div style={{
        marginTop: '4rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '25px',
        padding: '3rem',
        color: 'white',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
      }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '600' }}>
          Support Mental Health Awareness
        </h2>
        <p style={{ fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
          Your generous donation helps us provide free mental health resources, 
          support crisis intervention services, and maintain a safe platform for 
          those seeking help. Every contribution makes a difference in someone's life.
        </p>
        <div style={{ 
          display: 'flex', 
          gap: '2rem', 
          justifyContent: 'center', 
          flexWrap: 'wrap',
          marginBottom: '2rem'
        }}>
          <div style={{ flex: '1', minWidth: '200px', maxWidth: '250px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🧠</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Free Resources</h3>
            <p style={{ fontSize: '0.9rem', opacity: '0.9' }}>
              Keep articles and tools accessible to everyone
            </p>
          </div>
          <div style={{ flex: '1', minWidth: '200px', maxWidth: '250px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💙</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Crisis Support</h3>
            <p style={{ fontSize: '0.9rem', opacity: '0.9' }}>
              Fund emergency mental health interventions
            </p>
          </div>
          <div style={{ flex: '1', minWidth: '200px', maxWidth: '250px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🤝</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Community Care</h3>
            <p style={{ fontSize: '0.9rem', opacity: '0.9' }}>
              Build a supportive, judgment-free space
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowDonationModal(true)}
          style={{
            background: 'white',
            color: '#667eea',
            border: 'none',
            padding: '1rem 3rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
          }}
        >
          Donate Now
        </button>
      </div>

      {/* Donation Modal */}
      {showDonationModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2.5rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            {!donationSuccess ? (
              <>
                <button
                  onClick={() => setShowDonationModal(false)}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#999'
                  }}
                >
                  ×
                </button>
                <h2 style={{ marginBottom: '1.5rem', color: '#667eea', textAlign: 'center', fontSize: '2rem' }}>
                  Make a Donation
                </h2>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                    Donation Amount ($) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Enter amount"
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '1rem' }}>
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => {
                        setIsAnonymous(e.target.checked);
                        if (e.target.checked) setDonorName('');
                      }}
                      style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                    />
                    <span style={{ color: '#333', fontWeight: '500' }}>Donate Anonymously</span>
                  </label>

                  {!isAnonymous && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                        Your Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Enter your name"
                        style={{
                          width: '100%',
                          padding: '0.8rem',
                          border: '2px solid #e0e0e0',
                          borderRadius: '10px',
                          fontSize: '1rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleDonation}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Complete Donation
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
                <h2 style={{ color: '#4CAF50', marginBottom: '1rem' }}>Thank You!</h2>
                <p style={{ color: '#666', fontSize: '1.1rem' }}>
                  Your donation of ${parseFloat(donationAmount).toFixed(2)} has been received.
                </p>
                <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  {isAnonymous ? 'Anonymous Donor' : donorName || 'Anonymous Donor'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
