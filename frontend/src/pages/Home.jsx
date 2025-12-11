import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Chatbot from '../components/Chatbot';
import { createDonation } from '../services/api';

function Home({ user }) {
  const navigate = useNavigate();
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slideshow images - update these paths once you copy the images
  const slides = [
    '/slideshow/1.png',
    '/slideshow/2.png',
    '/slideshow/3.png',
    '/slideshow/4.png',
    '/slideshow/5.png',
    '/slideshow/6.png',
    '/slideshow/7.png',
    '/slideshow/8.png',
    '/slideshow/9.png',
    '/slideshow/10.png',
    '/slideshow/11.png'
  ];

  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  const handleDonation = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    setIsSubmitting(true);

    try {
      const donationData = {
        amount: parseFloat(donationAmount),
        payment_method: paymentMethod,
        currency: 'BDT',
        is_anonymous: isAnonymous
      };

      // Add optional fields if not anonymous
      if (!isAnonymous) {
        if (donorName) donationData.donor_name = donorName;
        if (donorEmail) donationData.donor_email = donorEmail;
      }

      if (phoneNumber) donationData.phone_number = phoneNumber;
      if (transactionId) donationData.transaction_id = transactionId;
      if (message) donationData.message = message;

      const response = await createDonation(donationData);
      console.log('Donation created:', response);

      setDonationSuccess(true);
      setTimeout(() => {
        setShowDonationModal(false);
        setDonationSuccess(false);
        setDonationAmount('');
        setDonorName('');
        setDonorEmail('');
        setPhoneNumber('');
        setTransactionId('');
        setMessage('');
        setPaymentMethod('bkash');
        setIsAnonymous(false);
      }, 3000);
    } catch (error) {
      console.error('Donation error:', error);
      alert(error.response?.data?.error || 'Failed to process donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 0 }}>
      {/* Automatic Slideshow */}
      <div className="slideshow-container">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
          >
            <img src={slide} alt={`Slide ${index + 1}`} />
          </div>
        ))}
        <div className="slideshow-dots">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Slogan */}
      <div className="slogan-gradient-wave" style={{
        textAlign: 'center',
        padding: '2rem 1rem',
        fontSize: '3rem',
        fontWeight: 'bold',
        letterSpacing: '2px'
      }}>
        EASE YOUR MIND . SPREAD YOUR KINDNESS . GROW YOUR AWARENESS
      </div>

      <div className="container">
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
                      Donation Amount (BDT) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
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
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                      Payment Method *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.8rem',
                        border: '2px solid #e0e0e0',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="rocket">Rocket</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="card">Credit/Debit Card</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
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
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                      Transaction ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Transaction ID from payment"
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
                          if (e.target.checked) {
                            setDonorName('');
                            setDonorEmail('');
                          }
                        }}
                        style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                      />
                      <span style={{ color: '#333', fontWeight: '500' }}>Donate Anonymously</span>
                    </label>

                    {!isAnonymous && (
                      <>
                        <div style={{ marginBottom: '1rem' }}>
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
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                            Your Email (Optional)
                          </label>
                          <input
                            type="email"
                            value={donorEmail}
                            onChange={(e) => setDonorEmail(e.target.value)}
                            placeholder="Enter your email"
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
                      </>
                    )}
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                      Message (Optional)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Leave a message..."
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '0.8rem',
                        border: '2px solid #e0e0e0',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <button
                    onClick={handleDonation}
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: isSubmitting ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmitting ? 'Processing...' : 'Complete Donation'}
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
                  <h2 style={{ color: '#4CAF50', marginBottom: '1rem' }}>Thank You!</h2>
                  <p style={{ color: '#666', fontSize: '1.1rem' }}>
                    Your donation of ৳{parseFloat(donationAmount).toFixed(2)} has been received.
                  </p>
                  <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    {isAnonymous ? 'Anonymous Donor' : donorName || 'Anonymous Donor'}
                  </p>
                  <p style={{ color: '#999', fontSize: '0.85rem', marginTop: '1rem' }}>
                    Payment Method: {paymentMethod.toUpperCase()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Chatbot />
    </div>
  );
}

export default Home;
