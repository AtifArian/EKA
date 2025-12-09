import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { verifyEmail, resendVerificationEmail } from '../services/auth';

function EmailVerification({ onLogin }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('No verification token provided');
      setLoading(false);
      return;
    }

    verifyEmailToken(token);
  }, [searchParams]);

  const verifyEmailToken = async (token) => {
    try {
      setLoading(true);
      const response = await verifyEmail(token);
      
      setSuccess(true);
      
      // Auto-login user
      if (response.access_token && response.user) {
        onLogin(response.user, response.access_token);
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
      setCanResend(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get email from user input or from error message
      const email = window.prompt('Enter your email address:');
      if (!email) return;

      await resendVerificationEmail(email);
      setSuccess(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend email');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !error) {
    return (
      <div className="container">
        <div className="form-container" style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <h2 style={{ color: '#7F7FD5', marginBottom: '10px' }}>Verifying Email...</h2>
          <p style={{ color: '#666' }}>Please wait while we verify your email address.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container">
        <div className="form-container" style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✓</div>
          <h2 style={{ color: '#7F7FD5', marginBottom: '10px' }}>Email Verified!</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Your email has been verified successfully. You are being logged in...
          </p>
          <div style={{ color: '#999', fontSize: '14px' }}>
            Redirecting to home page in 2 seconds...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="form-container" style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px', color: '#f44336' }}>✗</div>
          <h2 style={{ color: '#f44336', marginBottom: '10px' }}>Verification Failed</h2>
          
          <div style={{ 
            backgroundColor: '#ffebee', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            color: '#c62828',
            textAlign: 'left'
          }}>
            <p style={{ margin: '0' }}>
              <strong>Error:</strong> {error}
            </p>
          </div>

          <p style={{ color: '#666', marginBottom: '20px' }}>
            Your verification token may have expired or is invalid. Please request a new verification email.
          </p>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              onClick={handleResend}
              style={{
                padding: '10px 20px',
                backgroundColor: '#7F7FD5',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Resend Verification Email
            </button>
            
            <Link to="/login" style={{ 
              padding: '10px 20px',
              backgroundColor: '#999',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px',
              fontWeight: 'bold',
              display: 'inline-block'
            }}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default EmailVerification;
