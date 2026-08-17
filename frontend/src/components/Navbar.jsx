import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar" aria-label="Main Navigation">
      <Link to="/" className="navbar-brand" aria-label="EKA Home">
        <div className="navbar-logo">
          <picture>
            <source srcSet="/logo.webp" type="image/webp" />
            <img
              src="/logo.png"
              alt="EKA Mental Wellness Logo"
              width="44"
              height="44"
              style={{ width: '44px', height: '44px', objectFit: 'contain', borderRadius: '50%' }}
            />
          </picture>
        </div>
        <div>
          <span style={{
            background: 'linear-gradient(to right, #5871b1 0%, #838bb7 50%, #ada5bc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '1.4rem',
            fontWeight: '800'
          }}>
            EKA
          </span>
          <div style={{
            fontSize: '0.62rem',
            fontWeight: '600',
            letterSpacing: '0.5px',
            color: '#6B7280'
          }}>
            Ease · Kindness · Awareness
          </div>
        </div>
      </Link>

      <div className="navbar-links" role="menubar">
        <Link to="/" className={isActive('/') ? 'active-link' : ''} role="menuitem">
          Home
        </Link>
        <Link to="/clinics" className={isActive('/clinics') ? 'active-link' : ''} role="menuitem">
          Clinics
        </Link>
        <Link to="/articles" className={isActive('/articles') ? 'active-link' : ''} role="menuitem">
          Articles
        </Link>
        <Link to="/journals" className={isActive('/journals') ? 'active-link' : ''} role="menuitem">
          Journals
        </Link>

        {user ? (
          <>
            <Link to="/profile" className={isActive('/profile') ? 'active-link' : ''} role="menuitem">
              My Profile
            </Link>
            <button onClick={handleLogout} className="logout-btn" aria-label="Log out of account">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" role="menuitem">
            <button className="login-btn" aria-label="Sign in to your account">Login</button>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
