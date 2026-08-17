import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Chatbot from '../components/Chatbot';
import ArticleTile from '../components/ArticleTile';
import { createDonation, getTopArticles } from '../services/api';

function Home({ user }) {
  const navigate = useNavigate();
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [featuredArticles, setFeaturedArticles] = useState([]);
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
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Optimized Slides with WebP & descriptive alt text
  const slides = [
    { id: 1, src: '/slideshow/1.webp', alt: 'Mental health awareness and mindful healing with EKA' },
    { id: 2, src: '/slideshow/2.webp', alt: 'Connecting with mental wellness professionals and verified doctors' },
    { id: 3, src: '/slideshow/3.webp', alt: 'Daily mood tracking and personalized journaling' },
    { id: 4, src: '/slideshow/4.webp', alt: 'Supportive community for mental wellness and empathy' },
    { id: 5, src: '/slideshow/5.webp', alt: 'Safe, judgment-free mental healthcare space for all' },
    { id: 6, src: '/slideshow/6.webp', alt: 'Empowering self-care and emotional resilience' },
    { id: 7, src: '/slideshow/7.webp', alt: 'Holistic wellness guidance and expert resources' },
    { id: 8, src: '/slideshow/8.webp', alt: 'Compassionate crisis intervention and urgent support' },
    { id: 9, src: '/slideshow/9.webp', alt: 'Growth, kindness, and personal wellbeing journeys' },
    { id: 10, src: '/slideshow/10.webp', alt: 'Professional therapy and doctor consultation' },
    { id: 11, src: '/slideshow/11.webp', alt: 'Every mind matters - start your mental wellness journey today' },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-advance slideshow with pause on hover
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  // Fetch featured articles
  useEffect(() => {
    fetchFeaturedArticles();
  }, []);

  const fetchFeaturedArticles = async () => {
    try {
      const data = await getTopArticles();
      setFeaturedArticles(data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching featured articles:', error);
    }
  };

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
      {/* Hero Slideshow Section */}
      <section
        className="slideshow-container"
        aria-label="Mental Wellness Highlights"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        <div className="slideshow-inner">
          {slides.map((slide, index) => {
            const isActive = index === currentSlide;
            // Only render image for active, previous, and next slides to save bandwidth & memory
            const shouldRenderImage =
              index === 0 ||
              isActive ||
              index === (currentSlide + 1) % slides.length ||
              index === (currentSlide - 1 + slides.length) % slides.length;

            return (
              <div
                key={slide.id}
                className={`slide ${isActive ? 'active' : ''}`}
                aria-hidden={!isActive}
              >
                {shouldRenderImage ? (
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    width="1920"
                    height="1080"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    decoding="async"
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Previous / Next Navigation Arrows */}
        <button
          type="button"
          className="slideshow-arrow prev"
          onClick={prevSlide}
          aria-label="Previous slide"
          title="Previous slide"
        >
          ‹
        </button>
        <button
          type="button"
          className="slideshow-arrow next"
          onClick={nextSlide}
          aria-label="Next slide"
          title="Next slide"
        >
          ›
        </button>

        {/* Indicator Dots */}
        <div className="slideshow-dots" role="tablist" aria-label="Slideshow slide selectors">
          {slides.map((_, index) => (
            <button
              type="button"
              key={index}
              role="tab"
              aria-selected={index === currentSlide}
              aria-label={`Go to slide ${index + 1}`}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* Main Slogan & Value Proposition */}
      <div style={{ textAlign: 'center', padding: '1rem 1rem 2rem' }}>
        <h1 className="slogan-gradient-wave">
          EASE YOUR MIND · SPREAD YOUR KINDNESS · GROW YOUR AWARENESS
        </h1>
        <p
          style={{
            color: 'rgba(255, 255, 255, 0.92)',
            fontSize: '1.15rem',
            maxWidth: '780px',
            margin: '0.75rem auto 0',
            fontWeight: '500',
            lineHeight: '1.6'
          }}
        >
          Your safe haven for holistic mental healthcare. Connect with verified doctors, track your emotional wellness, and share your journey with an empathetic community.
        </p>
      </div>

      <div className="container">
        {/* Featured Articles Section */}
        <section aria-labelledby="featured-articles-heading" style={{ marginTop: '2rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <h2 id="featured-articles-heading" style={{ color: 'white', margin: 0, fontSize: '1.85rem' }}>
              ⭐ Featured Articles
            </h2>
            <button
              onClick={() => navigate('/articles')}
              aria-label="View all wellness articles"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.75rem',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.04)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)';
              }}
            >
              View All Articles →
            </button>
          </div>

          {featuredArticles.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}
            >
              {featuredArticles.map((article) => (
                <ArticleTile key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '3rem',
                textAlign: 'center',
                color: '#4B5563',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <p style={{ margin: 0, fontSize: '1.05rem' }}>
                No featured articles yet. Check back soon for insightful guides!
              </p>
            </div>
          )}
        </section>

        {/* Donation & Community Impact Section */}
        <section
          aria-labelledby="donation-heading"
          style={{
            marginTop: '3.5rem',
            marginBottom: '3rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '25px',
            padding: '3.5rem 2rem',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 12px 36px rgba(0,0,0,0.2)'
          }}
        >
          <h2 id="donation-heading" style={{ fontSize: '2.4rem', marginBottom: '1rem', fontWeight: '700' }}>
            Support Mental Health Awareness
          </h2>
          <p
            style={{
              fontSize: '1.1rem',
              maxWidth: '720px',
              margin: '0 auto 2.5rem',
              lineHeight: '1.7',
              opacity: 0.95
            }}
          >
            Your generous donation helps us provide free mental health resources, support crisis intervention services, and maintain a safe platform for those seeking help. Every contribution makes a difference in someone's life.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '2rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '2.5rem'
            }}
          >
            <div style={{ flex: '1', minWidth: '220px', maxWidth: '270px' }}>
              <div style={{ fontSize: '2.8rem', marginBottom: '0.5rem' }} role="img" aria-label="Brain icon">🧠</div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '600' }}>Free Resources</h3>
              <p style={{ fontSize: '0.92rem', opacity: 0.9, lineHeight: '1.5' }}>
                Keep articles, tests, and self-care tools accessible to everyone in need
              </p>
            </div>
            <div style={{ flex: '1', minWidth: '220px', maxWidth: '270px' }}>
              <div style={{ fontSize: '2.8rem', marginBottom: '0.5rem' }} role="img" aria-label="Heart icon">💙</div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '600' }}>Crisis Support</h3>
              <p style={{ fontSize: '0.92rem', opacity: 0.9, lineHeight: '1.5' }}>
                Fund 24/7 emergency mental health interventions and doctor consultations
              </p>
            </div>
            <div style={{ flex: '1', minWidth: '220px', maxWidth: '270px' }}>
              <div style={{ fontSize: '2.8rem', marginBottom: '0.5rem' }} role="img" aria-label="Community handshake icon">🤝</div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '600' }}>Community Care</h3>
              <p style={{ fontSize: '0.92rem', opacity: 0.9, lineHeight: '1.5' }}>
                Build a supportive, stigma-free environment for healing and recovery
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDonationModal(true)}
            aria-label="Open donation form"
            style={{
              background: 'white',
              color: '#667eea',
              border: 'none',
              padding: '1.1rem 3.5rem',
              fontSize: '1.15rem',
              fontWeight: '700',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0,0,0,0.22)',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.22)';
            }}
          >
            Donate Now
          </button>
        </section>

        {/* Accessible Donation Modal */}
        {showDonationModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="donation-modal-title"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              padding: '1rem',
              overflowY: 'auto'
            }}
            onClick={() => setShowDonationModal(false)}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '2.5rem',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
                position: 'relative',
                margin: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {!donationSuccess ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowDonationModal(false)}
                    aria-label="Close donation modal"
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      background: '#f3f4f6',
                      border: 'none',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      fontSize: '1.25rem',
                      cursor: 'pointer',
                      color: '#4B5563',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#e5e7eb')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#f3f4f6')}
                  >
                    ✕
                  </button>
                  <h2
                    id="donation-modal-title"
                    style={{
                      marginBottom: '1.5rem',
                      color: '#667eea',
                      textAlign: 'center',
                      fontSize: '1.85rem',
                      fontWeight: '700'
                    }}
                  >
                    Make a Donation
                  </h2>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label
                      htmlFor="donation-amount"
                      style={{ display: 'block', marginBottom: '0.5rem', color: '#1F2937', fontWeight: '600' }}
                    >
                      Donation Amount (BDT) *
                    </label>
                    <input
                      id="donation-amount"
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      placeholder="e.g. 500"
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        border: '2px solid #D1D5DB',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label
                      htmlFor="payment-method"
                      style={{ display: 'block', marginBottom: '0.5rem', color: '#1F2937', fontWeight: '600' }}
                    >
                      Payment Method *
                    </label>
                    <select
                      id="payment-method"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        border: '2px solid #D1D5DB',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                        cursor: 'pointer',
                        background: 'white'
                      }}
                    >
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="rocket">Rocket</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="card">Credit / Debit Card</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label
                      htmlFor="donor-phone"
                      style={{ display: 'block', marginBottom: '0.5rem', color: '#1F2937', fontWeight: '600' }}
                    >
                      Phone Number (Optional)
                    </label>
                    <input
                      id="donor-phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        border: '2px solid #D1D5DB',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label
                      htmlFor="transaction-id"
                      style={{ display: 'block', marginBottom: '0.5rem', color: '#1F2937', fontWeight: '600' }}
                    >
                      Transaction ID (Optional)
                    </label>
                    <input
                      id="transaction-id"
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Transaction ID from payment receipt"
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        border: '2px solid #D1D5DB',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label
                      htmlFor="anonymous-check"
                      style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '1rem' }}
                    >
                      <input
                        id="anonymous-check"
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => {
                          setIsAnonymous(e.target.checked);
                          if (e.target.checked) {
                            setDonorName('');
                            setDonorEmail('');
                          }
                        }}
                        style={{ marginRight: '0.6rem', cursor: 'pointer', width: '18px', height: '18px' }}
                      />
                      <span style={{ color: '#1F2937', fontWeight: '600' }}>Donate Anonymously</span>
                    </label>

                    {!isAnonymous && (
                      <>
                        <div style={{ marginBottom: '1rem' }}>
                          <label
                            htmlFor="donor-name"
                            style={{ display: 'block', marginBottom: '0.5rem', color: '#1F2937', fontWeight: '600' }}
                          >
                            Your Name (Optional)
                          </label>
                          <input
                            id="donor-name"
                            type="text"
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            placeholder="Enter your name"
                            style={{
                              width: '100%',
                              padding: '0.85rem',
                              border: '2px solid #D1D5DB',
                              borderRadius: '10px',
                              fontSize: '1rem',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                          <label
                            htmlFor="donor-email"
                            style={{ display: 'block', marginBottom: '0.5rem', color: '#1F2937', fontWeight: '600' }}
                          >
                            Your Email (Optional)
                          </label>
                          <input
                            id="donor-email"
                            type="email"
                            value={donorEmail}
                            onChange={(e) => setDonorEmail(e.target.value)}
                            placeholder="Enter your email address"
                            style={{
                              width: '100%',
                              padding: '0.85rem',
                              border: '2px solid #D1D5DB',
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
                    <label
                      htmlFor="donor-message"
                      style={{ display: 'block', marginBottom: '0.5rem', color: '#1F2937', fontWeight: '600' }}
                    >
                      Message (Optional)
                    </label>
                    <textarea
                      id="donor-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Words of encouragement..."
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        border: '2px solid #D1D5DB',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleDonation}
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: isSubmitting
                        ? '#9CA3AF'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isSubmitting ? 'Processing Donation...' : 'Complete Donation'}
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ fontSize: '3.5rem', color: '#10B981', marginBottom: '1rem' }}>✓</div>
                  <h2 style={{ color: '#10B981', marginBottom: '1rem', fontSize: '2rem' }}>Thank You!</h2>
                  <p style={{ color: '#374151', fontSize: '1.15rem' }}>
                    Your donation of ৳{parseFloat(donationAmount).toFixed(2)} has been received with deep gratitude.
                  </p>
                  <p style={{ color: '#6B7280', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                    {isAnonymous ? 'Anonymous Supporter' : donorName || 'Anonymous Supporter'}
                  </p>
                  <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '0.5rem' }}>
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
