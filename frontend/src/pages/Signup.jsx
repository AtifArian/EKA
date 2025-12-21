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

    console.log('\n=== SIGNUP ATTEMPT ===');
    console.log('Form data:', formData);
    console.log('Is doctor:', formData.is_doctor);
    console.log('Has verification file:', !!verificationFile);

    if (formData.is_doctor && !verificationFile) {
      console.warn('✗ Doctor signup requires verification file');
      setError('Please upload verification document (license/certificate)');
      return;
    }

    try {
      console.log('Calling signup API...');
      const response = await signup(formData, verificationFile);
      console.log('✓ Signup successful:', response);
      
      onLogin(response.user, response.access_token);
      
      // Show message if doctor account needs verification
      if (formData.is_doctor) {
        alert('Doctor account created successfully! Your account will be verified by our team shortly.');
      }
      
      console.log('✓ Redirecting to home...');
      navigate('/');
    } catch (err) {
      console.error('✗ Signup error:', err);
      console.error('Error response:', err.response?.data);
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
              <label>Verification Document (License/Certificate) *</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                required
              />
              <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                Upload your medical license or professional certificate. Your account will be verified by our team.
              </small>
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
