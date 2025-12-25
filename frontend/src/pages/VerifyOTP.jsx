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

  return (
    <div className="container" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <div className="form-container" style={{ maxWidth: '450px', width: '100%' }}>
        {/* Show OTP prominently at the top for non-existing users */}
        {emailNotFound && otpCode && (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: '0.9' }}>
              Verification code sent to:
            </div>
            <div style={{ 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              marginBottom: '1rem',
              padding: '0.5rem',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '0.5rem'
            }}>
              {maskedEmail || 'your email'}
            </div>
            <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', opacity: '0.9' }}>
              Your Verification Code:
            </div>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              letterSpacing: '0.5rem',
              fontFamily: 'monospace',
              padding: '0.5rem',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '0.5rem',
              marginTop: '0.5rem'
            }}>
              {otpCode}
            </div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.75rem', opacity: '0.9' }}>
              Please enter this code below to continue
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2>Two-Factor Authentication</h2>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>
            {message || 'Enter the verification code sent to your email'}
          </p>
          {otpForTesting && !emailNotFound && (
            <p style={{ 
              background: '#fff3cd', 
              color: '#856404', 
              padding: '0.75rem', 
              borderRadius: '0.5rem',
              marginTop: '1rem',
              fontSize: '0.9rem'
            }}>
              <strong>Testing Mode:</strong> Your code is <strong>{otpForTesting}</strong>
            </p>
          )}
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Verification Code</label>
            <input
              type="text"
              value={otp}
              onChange={handleOtpChange}
              placeholder="Enter 6-digit code"
              required
              autoFocus
              style={{
                fontSize: '1.5rem',
                letterSpacing: '0.5rem',
                textAlign: 'center',
                fontFamily: 'monospace'
              }}
            />
          </div>

          <div className="form-group">
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}>
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
              />
              Remember this device
            </label>
            <small style={{ 
              color: '#666', 
              fontSize: '0.85rem', 
              marginTop: '0.25rem', 
              display: 'block',
              marginLeft: '1.5rem'
            }}>
              You won't need to verify on this device for future logins
            </small>
          </div>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#7F7FD5',
                cursor: 'pointer',
                fontSize: '0.9rem',
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
