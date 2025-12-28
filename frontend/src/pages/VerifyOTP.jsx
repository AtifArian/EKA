import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOTP } from '../services/auth';

function VerifyOTP({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const tempToken = location.state?.tempToken;
  const message = location.state?.message;
  const otpForTesting = location.state?.otpForTesting; // For testing only
  const otpCode = location.state?.otpCode; // OTP shown on website for non-existing users
  const emailNotFound = location.state?.emailNotFound;
  const maskedEmail = location.state?.maskedEmail; // Masked email for display

  useEffect(() => {
    console.log('\n=== OTP VERIFICATION PAGE LOADED ===');
    console.log('Has temp token:', !!tempToken);
    console.log('Message:', message);
    console.log('OTP for testing:', otpForTesting);
    console.log('OTP code (non-existing user):', otpCode);
    console.log('Email not found:', emailNotFound);
    console.log('Masked email:', maskedEmail);
    
    if (!tempToken) {
      console.warn('✗ No temp token found - redirecting to login');
      navigate('/login');
    } else {
      console.log('✓ Ready for OTP verification');
    }
  }, [tempToken, navigate, message, otpForTesting, otpCode, emailNotFound, maskedEmail]);

  // Generate device fingerprint
  const getDeviceFingerprint = () => {
    const nav = navigator;
    const screen = window.screen;
    const fingerprint = [
      nav.userAgent,
      nav.language,
      screen.colorDepth,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      nav.hardwareConcurrency || 'unknown',
      nav.platform
    ].join('|');
    return fingerprint;
  };

  // Get device name (browser and OS)
  const getDeviceName = () => {
    const userAgent = navigator.userAgent;
    let browser = "Unknown Browser";
    let os = "Unknown OS";

    // Detect browser
    if (userAgent.indexOf("Chrome") > -1) browser = "Chrome";
    else if (userAgent.indexOf("Safari") > -1) browser = "Safari";
    else if (userAgent.indexOf("Firefox") > -1) browser = "Firefox";
    else if (userAgent.indexOf("Edge") > -1) browser = "Edge";

    // Detect OS
    if (userAgent.indexOf("Win") > -1) os = "Windows";
    else if (userAgent.indexOf("Mac") > -1) os = "MacOS";
    else if (userAgent.indexOf("Linux") > -1) os = "Linux";
    else if (userAgent.indexOf("Android") > -1) os = "Android";
    else if (userAgent.indexOf("iOS") > -1) os = "iOS";

    return `${browser} on ${os}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('\n=== SUBMITTING OTP ===');
    console.log('OTP Code:', otp);
    console.log('Remember device:', rememberDevice);

    if (otp.length !== 6) {
      console.warn('✗ Invalid OTP length');
      setError('Please enter a 6-digit code');
      setLoading(false);
      return;
    }

    try {
      const deviceFP = getDeviceFingerprint();
      const deviceName = getDeviceName();
      
      console.log('Device fingerprint:', deviceFP.substring(0, 50) + '...');
      console.log('Device name:', deviceName);
      console.log('Using temp token:', tempToken ? 'Yes' : 'No');
      
      const response = await verifyOTP({
        otp_code: otp,
        remember_device: rememberDevice,
        device_fingerprint: deviceFP,
        device_name: deviceName
      }, tempToken);

      console.log('✓ OTP Verified successfully');
      console.log('Response:', response);
      
      onLogin(response.user, response.access_token);
      
      if (response.message) {
        alert(response.message);
      }
      
      console.log('✓ Redirecting to home...');
      navigate('/');
    } catch (err) {
      console.error('✗ OTP Verification error:', err);
      console.error('Error response:', err.response?.data);
      
      // If email not found, redirect to signup
      if (err.response?.status === 404 && err.response?.data?.error?.includes('not found')) {
        setError('Email not found. Redirecting to sign up...');
        setTimeout(() => {
          navigate('/signup');
        }, 2000);
      } else {
        setError(err.response?.data?.error || 'Verification failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const gradientBg = 'linear-gradient(180deg, #6b76c5 0%, #8a87c9 35%, #b49bc1 70%, #d6c2c4 100%)';
  const cardStyle = {
    maxWidth: '520px',
    width: '100%',
    background: 'rgba(255,255,255,0.18)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '24px',
    padding: '2.5rem',
    boxShadow: '0 18px 50px rgba(72, 64, 109, 0.22)',
    border: '1px solid rgba(255,255,255,0.35)'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: gradientBg,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem'
    }}>
      <div style={cardStyle}>
        {/* Show OTP prominently at the top for non-existing users */}
        {emailNotFound && otpCode && (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '16px',
            marginBottom: '1.5rem',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.35)'
          }}>
            <div style={{ fontSize: '0.95rem', marginBottom: '0.5rem', opacity: '0.95' }}>
              Verification code sent to:
            </div>
            <div style={{ 
              fontSize: '1.15rem', 
              fontWeight: '700',
              marginBottom: '1rem',
              padding: '0.65rem',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '12px'
            }}>
              {maskedEmail || 'your email'}
            </div>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.35rem', opacity: '0.95' }}>
              Your Verification Code:
            </div>
            <div style={{ 
              fontSize: '2.6rem', 
              fontWeight: '800', 
              letterSpacing: '0.55rem',
              fontFamily: 'monospace',
              padding: '0.6rem',
              background: 'rgba(255, 255, 255, 0.22)',
              borderRadius: '14px',
              marginTop: '0.35rem'
            }}>
              {otpCode}
            </div>
            <div style={{ fontSize: '0.9rem', marginTop: '0.85rem', opacity: '0.95' }}>
              Please enter this code below to continue
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '2rem', margin: 0, color: '#1f2240' }}>Two-Factor Authentication</h2>
          <p style={{ color: '#4c5076', marginTop: '0.65rem', fontWeight: 500 }}>
            {message || 'Verification code sent to your email'}
          </p>
          {otpForTesting && !emailNotFound && (
            <p style={{ 
              background: '#fff6d5', 
              color: '#7a6525', 
              padding: '0.9rem 1rem', 
              borderRadius: '12px',
              marginTop: '1rem',
              fontSize: '0.95rem',
              border: '1px solid #f3dd93'
            }}>
              <strong>Testing Mode:</strong> Your code is <strong>{otpForTesting}</strong>
            </p>
          )}
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontWeight: 700, color: '#2f3059' }}>Verification Code</label>
            <input
              type="text"
              value={otp}
              onChange={handleOtpChange}
              placeholder="Enter 6-digit"
              required
              autoFocus
              style={{
                fontSize: '1.6rem',
                letterSpacing: '0.55rem',
                textAlign: 'center',
                fontFamily: 'monospace',
                height: '64px',
                background: '#f0f2ff',
                border: '1px solid #d6d9f5',
                borderRadius: '18px',
                boxShadow: 'inset 0 2px 6px rgba(51, 63, 130, 0.08)',
                color: '#1f2240'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '1.25rem'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#2f3059', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              Remember this device
            </label>
          </div>
          <div style={{ color: '#6a6b86', fontSize: '0.92rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>
            You won't need to verify on this device for future logins
          </div>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
            style={{ 
              opacity: loading ? 0.85 : 1,
              background: 'linear-gradient(135deg, #6b7de0 0%, #5663c3 100%)',
              borderRadius: '14px',
              height: '56px',
              boxShadow: '0 12px 26px rgba(86, 99, 195, 0.35)',
              fontSize: '1.05rem',
              letterSpacing: '0.02em'
            }}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.1rem' }}>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#6a6fd1',
                cursor: 'pointer',
                fontSize: '0.95rem',
                textDecoration: 'underline'
              }}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VerifyOTP;
