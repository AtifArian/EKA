import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';

// Import components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import MoodTracker from './components/MoodTracker';
import HighRiskAlert from './components/HighRiskAlert';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login1';
import Signup from './pages/Signup';
import Clinics from './pages/Clinics';
import ClinicDetail from './pages/ClinicDetail';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Journals from './pages/Journals';
import JournalDetail from './pages/JournalDetail';
import MyProfile from './pages/MyProfile';
import UserProfile from './pages/UserProfile';
import Chat from './pages/Chat';
import VideoCall from './pages/VideoCall';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [navigateToInbox, setNavigateToInbox] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
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

  if (loading) {
    return (
      <div className="loading">Loading...</div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || "dummy-client-id"}>
      <Router>
        <div className="App">
          <Navbar user={user} onLogout={handleLogout} />
          
          {user && !user.is_doctor && <MoodTracker />}
          {user && user.is_doctor && <HighRiskAlert user={user} onChatNow={(patient) => setNavigateToInbox(patient)} />}
          
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
            <Route path="/clinics" element={<Clinics />} />
            <Route path="/clinics/:id" element={<ClinicDetail user={user} />} />
            <Route path="/articles" element={<Articles user={user} />} />
            <Route path="/articles/:id" element={<ArticleDetail user={user} />} />
            <Route path="/journals" element={<Journals user={user} />} />
            <Route path="/journals/:id" element={<JournalDetail user={user} />} />
            <Route path="/users/:id" element={<UserProfile />} />
            <Route path="/chat/:userId" element={<ProtectedRoute user={user}><Chat user={user} /></ProtectedRoute>} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute user={user}>
                  <MyProfile user={user} setUser={setUser} navigateToInbox={navigateToInbox} setNavigateToInbox={setNavigateToInbox} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/video-call/:sessionId" 
              element={
                <ProtectedRoute user={user}>
                  <VideoCall user={user} setUser={setUser} />
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
