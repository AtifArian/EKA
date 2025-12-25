import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/auth';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      console.log('\n=== LOGIN ATTEMPT ===');
      console.log('Email:', formData.email);
      
      const response = await login(formData);
      console.log('Login response:', response);
      
      // Check if 2FA is required
      if (response.requires_2fa) {
        console.log('✓ 2FA Required - Redirecting to OTP page');
        console.log('Temp token received:', response.temp_token ? 'Yes' : 'No');
        console.log('OTP for testing:', response.otp_for_testing);
        console.log('Email not found:', response.email_not_found);
        console.log('OTP code (for non-existing user):', response.otp_code);
        console.log('Masked email:', response.masked_email);
        
        // Redirect to OTP verification page
        navigate('/verify-otp', {
          state: {
            tempToken: response.temp_token,
            message: response.message,
            otpForTesting: response.otp_for_testing, // For testing only
            otpCode: response.otp_code, // OTP shown on website for non-existing users
            emailNotFound: response.email_not_found,
            maskedEmail: response.masked_email // Pass masked email
          }
        });
        return;
      }
      
      // If no 2FA needed (trusted device)
      console.log('✓ Trusted device - No 2FA required');
      onLogin(response.user, response.access_token);
      
      // Show verification message if present
      if (response.message) {
        alert(response.message);
      }
      
      navigate('/');
    } catch (err) {
      console.error('✗ Login error:', err);
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>Login to EKA</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" className="submit-btn">
            Login
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#666' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#7F7FD5', fontWeight: '600' }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
