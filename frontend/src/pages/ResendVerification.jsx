import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { resendVerificationEmail } from '../services/auth';

function ResendVerification() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim()) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      const response = await resendVerificationEmail(email);
      setSuccess(true);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to resend verification email';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container">
        <div className="form-container" style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📧</div>
          <h2 style={{ color: '#7F7FD5', marginBottom: '10px' }}>Verification Email Sent!</h2>
          
          <div style={{ 
            backgroundColor: '#f0f4ff', 
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            <p style={{ marginBottom: '15px', color: '#333' }}>
              <strong>Check your email</strong>
            </p>
            <p style={{ color: '#666', marginBottom: '10px' }}>
              We've sent a new verification link to:
            </p>
            <p style={{ 
              color: '#7F7FD5', 
              fontWeight: 'bold',
              wordBreak: 'break-all',
              marginBottom: '15px'
            }}>
              {email}
            </p>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
              Please click the link in the email to verify your account. The link expires in 24 hours.
            </p>
          </div>
          
          <Link to="/login" style={{ 
            display: 'inline-block',
            color: '#7F7FD5', 
            fontWeight: '600',
            textDecoration: 'underline'
          }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="form-container" style={{ maxWidth: '500px' }}>
        <h2>Resend Verification Email</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Enter the email address associated with your account, and we'll send you a new verification link.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Resend Verification Email'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#666' }}>
          Remember your password? <Link to="/login" style={{ color: '#7F7FD5', fontWeight: '600' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ResendVerification;
