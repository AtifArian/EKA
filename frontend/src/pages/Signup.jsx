import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../services/auth';

function Signup({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    is_doctor: false
  });
  const [verificationFile, setVerificationFile] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleFileChange = (e) => {
    setVerificationFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.is_doctor && !verificationFile) {
      setError('Please upload verification document');
      return;
    }

    try {
      const response = await signup(formData);
      onLogin(response.user, response.access_token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>Join EKA</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
            />
          </div>
          
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

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                name="is_doctor"
                checked={formData.is_doctor}
                onChange={handleChange}
              />
              I am a doctor/therapist
            </label>
          </div>

          {formData.is_doctor && (
            <div className="form-group">
              <label>Verification Document (License/Certificate)</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                required
              />
            </div>
          )}
          
          <button type="submit" className="submit-btn">
            Sign Up
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#666' }}>
          Already have an account? <Link to="/login" style={{ color: '#7F7FD5', fontWeight: '600' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
