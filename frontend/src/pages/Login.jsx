import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, googleAuth } from '../services/auth';
import { GoogleLogin } from '@react-oauth/google';

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
      const response = await login(formData);
      onLogin(response.user, response.access_token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await googleAuth(credentialResponse.credential);
      onLogin(response.user, response.access_token);
      navigate('/');
    } catch (err) {
      setError('Google authentication failed');
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>Login to MindCare</h2>
        
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

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ marginBottom: '1rem', color: '#666' }}>Or continue with</p>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Sign In failed')}
          />
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#666' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#7F7FD5', fontWeight: '600' }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
