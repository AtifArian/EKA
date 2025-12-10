import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';

// Import components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import MoodTracker from './components/MoodTracker';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login1';
import Signup from './pages/Signup';
import EmailVerification from './pages/EmailVerification';
import ResendVerification from './pages/ResendVerification';
import Doctors from './pages/Doctors';
import Clinics from './pages/Clinics';
import ClinicDetail from './pages/ClinicDetail';
import DoctorProfile from './pages/DoctorProfile';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Journals from './pages/Journals';
import JournalDetail from './pages/JournalDetail';
import MyProfile from './pages/MyProfile';
import UserProfile from './pages/UserProfile';
import MyChats from './pages/MyChats';
import DoctorDashboard from './pages/DoctorDashboard';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || "dummy-client-id"}>
      <Router>
        <div className="App">
          <Navbar user={user} onLogout={handleLogout} />
          
          {user && !user.is_doctor && <MoodTracker />}
          
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
            <Route path="/verify-email" element={<EmailVerification onLogin={handleLogin} />} />
            <Route path="/resend-verification" element={<ResendVerification />} />
            <Route path="/doctors" element={<Doctors user={user} />} />
            <Route path="/clinics" element={<Clinics />} />
            <Route path="/clinics/:id" element={<ClinicDetail user={user} />} />
            <Route path="/doctors/:id" element={<DoctorProfile user={user} />} />
            <Route path="/articles" element={<Articles user={user} />} />
            <Route path="/articles/:id" element={<ArticleDetail user={user} />} />
            <Route path="/journals" element={<Journals user={user} />} />
            <Route path="/journals/:id" element={<JournalDetail user={user} />} />
            <Route path="/users/:id" element={<UserProfile />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute user={user}>
                  <MyProfile user={user} setUser={setUser} />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/chats"
              element={
                <ProtectedRoute user={user}>
                  <MyChats user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor-dashboard"
              element={
                <ProtectedRoute user={user}>
                  {user?.is_doctor ? (
                    <DoctorDashboard user={user} />
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <p>Only doctors can access this page</p>
                    </div>
                  )}
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
