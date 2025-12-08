import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="navbar-logo">
          <img 
            src="/logo.png.png" 
            alt="EKA Logo" 
            style={{width: '65px', height: '65px', objectFit: 'contain', borderRadius: '50%'}}
          />
        </div>
        <div>
          <span style={{background: 'linear-gradient(to right, #5871b1 0%, #838bb7 50%, #ada5bc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>EKA</span>
          <div style={{fontSize: '0.6em', fontWeight: 'normal', background: 'linear-gradient(to right, #5871b1 0%, #838bb7 50%, #ada5bc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Ease. Kindness. Awareness</div>
        </div>
      </Link>
      
      <div className="navbar-links">
        <Link to="/clinics">Clinics</Link>
        <Link to="/articles">Articles</Link>
        <Link to="/journals">Journals</Link>
        
        {user ? (
          <>
            <Link to="/profile">MyProfile</Link>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login">
            <button className="login-btn">Login</button>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
