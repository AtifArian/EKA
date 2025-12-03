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
        <div className="navbar-logo">🧠</div>
        <div>
          <span>EKA</span>
          <div style={{fontSize: '0.6em', fontWeight: 'normal'}}>Ease, Kindness, Awareness</div>
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
