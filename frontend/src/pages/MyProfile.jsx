import React, { useState, useEffect, useCallback } from 'react';
import { 
  searchUsers, 
  addFriend, 
  removeFriend,
  getFriends,
  getFriendRequests,
  handleFriendRequest as handleFriendRequestAPI,
  getMyJournals,
  createJournal,
  updateJournal,
  deleteJournal,
  getPatients,
  getChatRequests,
  updateChatRequest,
  createArticle,
  getDoctorProfile,
  updateDoctorProfile,
  getMyArticles,
  deleteArticle,
  uploadProfilePicture,
  deleteProfilePicture
} from '../services/api';
import {
  listThreads,
  getThreadMessages,
  postThreadMessage,
  markThreadRead,
  deleteThread,
  createUserUserThread,
  getNotificationCounts,
  markNotificationsRead
} from '../services/api';
import { useNavigate } from 'react-router-dom';
import MapLocationPicker from '../components/MapLocationPicker';

function MyProfile({ user, setUser }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(user?.is_doctor ? 'clinic-profile' : 'journals');
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [journals, setJournals] = useState([]);
  const [articles, setArticles] = useState([]);
  const [patients, setPatients] = useState([]);
  const [chatRequests, setChatRequests] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showJournalForm, setShowJournalForm] = useState(false);
  
  const [journalForm, setJournalForm] = useState({
    title: '',
    content: '',
    is_public: false
  });
  
  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    mood_category: 'neutral',
    keywords: '',
    cover_image: null
  });

  const [clinicForm, setClinicForm] = useState({
    specialization: '',
    bio: '',
    quote: '',
    expertise: '',
    education: '',
    age_group: '',
    location: '',
    session_charge: '',
    google_maps_link: '',
    latitude: null,
    longitude: null
  });

  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [threads, setThreads] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [notificationCounts, setNotificationCounts] = useState({ inbox: 0, chat_requests: 0 });

  const loadData = useCallback(async () => {
    try {
      if (activeTab === 'friends') {
        const data = await getFriends();
        setFriends(data);
        const requests = await getFriendRequests();
        setFriendRequests(requests);
      } else if (activeTab === 'journals') {
        const data = await getMyJournals();
        setJournals(data);
      } else if (activeTab === 'my-articles' && user.is_doctor) {
        const data = await getMyArticles();
        setArticles(data);
      } else if (activeTab === 'patients' && user.is_doctor) {
        const data = await getPatients();
        setPatients(data);
      } else if (activeTab === 'chat-requests' && user.is_doctor) {
        const data = await getChatRequests();
        setChatRequests(data);
      } else if (activeTab === 'clinic-profile' && user.is_doctor) {
        try {
          const profile = await getDoctorProfile();
          console.log('Loaded doctor profile:', profile);
          setDoctorProfile(profile);
          setClinicForm({
            specialization: profile.specialization || '',
            bio: profile.bio || '',
            quote: profile.quote || '',
            expertise: profile.expertise || '',
            education: profile.education || '',
            age_group: profile.age_group || '',
            location: profile.location || '',
            session_charge: profile.session_charge || '',
            google_maps_link: profile.google_maps_link || '',
            latitude: profile.latitude || null,
            longitude: profile.longitude || null
          });
          console.log('Set clinic form to:', {
            specialization: profile.specialization || '',
            bio: profile.bio || '',
            quote: profile.quote || '',
            session_charge: profile.session_charge || ''
          });
        } catch (error) {
          console.log('No doctor profile yet:', error);
        }
      } else if (activeTab === 'inbox') {
        const data = await listThreads();
        setThreads(data);
        // reset thread view when switching into inbox
        setSelectedThreadId(null);
        setThreadMessages([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, activeTab, loadData, navigate]);

  // Poll notification counts periodically
  useEffect(() => {
    let timer;
    const poll = async () => {
      try {
        const counts = await getNotificationCounts();
        if (counts) setNotificationCounts(counts);
      } catch (e) {
        // ignore polling errors
      }
    };
    poll();
    timer = setInterval(poll, 15000);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [user]);

  // Mark notifications read on tab entry
  useEffect(() => {
    const markRead = async () => {
      try {
        if (activeTab === 'inbox') {
          await markNotificationsRead('inbox');
        } else if (activeTab === 'chat-requests' && user?.is_doctor) {
          await markNotificationsRead('chat_requests');
        }
      } catch (e) {
        // ignore
      }
    };
    markRead();
  }, [activeTab, user]);

  // Poll messages when a thread is selected
  useEffect(() => {
    if (!selectedThreadId) return;
    const loadMessages = async () => {
      try {
        const msgs = await getThreadMessages(selectedThreadId);
        setThreadMessages(msgs);
      } catch (e) {
        console.error('Error loading messages:', e);
      }
    };
    // Load immediately
    loadMessages();
    // Then poll every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedThreadId]);

  const handleUpdateClinicProfile = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...clinicForm,
        latitude: clinicForm.latitude,
        longitude: clinicForm.longitude
      };
      await updateDoctorProfile(dataToSubmit);
      alert('Clinic profile updated successfully!');
      loadData();
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleAddFriend = async (friendId) => {
    try {
      await addFriend(friendId);
      alert('Friend request sent!');
      setSearchResults([]);
      setSearchQuery('');
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to send friend request');
    }
  };

  const handleAcceptFriendRequest = async (requestId) => {
    try {
      await handleFriendRequestAPI(requestId, 'accept');
      alert('Friend request accepted!');
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to accept friend request');
    }
  };

  const handleRejectFriendRequest = async (requestId) => {
    try {
      await handleFriendRequestAPI(requestId, 'reject');
      alert('Friend request rejected');
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to reject friend request');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm('Remove this friend?')) return;
    try {
      await removeFriend(friendId);
      alert('Friend removed');
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to remove friend');
    }
  };

  const handleOpenChat = async (friendId) => {
    try {
      // First switch to inbox tab
      setActiveTab('inbox');
      
      // Small delay to ensure tab switch completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Load threads
      const threadsData = await listThreads();
      setThreads(threadsData);
      
      // Find the thread with this friend
      const thread = threadsData.find(t => 
        t.thread_type === 'user_user' && 
        t.participants.some(p => p.id === friendId)
      );
      
      if (thread) {
        // Select the existing thread
        setSelectedThreadId(thread.id);
        const msgs = await getThreadMessages(thread.id);
        setThreadMessages(msgs);
        await markThreadRead(thread.id);
      } else {
        // Create new thread
        const newThread = await createUserUserThread(friendId);
        const threadsRefresh = await listThreads();
        setThreads(threadsRefresh);
        setSelectedThreadId(newThread.id);
        const msgs = await getThreadMessages(newThread.id);
        setThreadMessages(msgs);
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      alert('Failed to open chat');
    }
  };

  const handleCreateJournal = async (e) => {
    e.preventDefault();
    try {
      await createJournal(journalForm);
      alert('Journal created successfully!');
      setShowJournalForm(false);
      setJournalForm({ title: '', content: '', is_public: false });
      loadData();
    } catch (error) {
      alert('Failed to create journal');
    }
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    
    if (!articleForm.cover_image) {
      alert('Cover image is required');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('title', articleForm.title);
      formData.append('content', articleForm.content);
      formData.append('mood_category', articleForm.mood_category);
      formData.append('keywords', articleForm.keywords);
      formData.append('cover_image', articleForm.cover_image);
      
      await createArticle(formData);
      alert('Article published successfully!');
      setArticleForm({ title: '', content: '', mood_category: 'neutral', keywords: '', cover_image: null });
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to publish article');
    }
  };

  const handleTogglePublic = async (journal) => {
    try {
      await updateJournal(journal.id, { is_public: !journal.is_public });
      loadData();
    } catch (error) {
      alert('Failed to update journal');
    }
  };

  const handleDeleteJournal = async (journalId) => {
    if (!window.confirm('Are you sure you want to delete this journal?')) return;
    try {
      await deleteJournal(journalId);
      loadData();
    } catch (error) {
      alert('Failed to delete journal');
    }
  };

  const handleDeleteArticle = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await deleteArticle(articleId);
      loadData();
    } catch (error) {
      alert('Failed to delete article');
    }
  };

  const handleEditArticle = (articleId) => {
    navigate(`/articles/${articleId}`);
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    
    try {
      setUploadingPicture(true);
      const updatedUser = await uploadProfilePicture(file);
      // Update localStorage and state with new user data
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert('Profile picture updated successfully!');
    } catch (error) {
      alert('Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!window.confirm('Are you sure you want to delete your profile picture?')) return;
    
    try {
      await deleteProfilePicture();
      // Update user data in localStorage and state
      const updatedUser = { ...user, profile_picture: null };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert('Profile picture deleted successfully!');
    } catch (error) {
      alert('Failed to delete profile picture');
    }
  };

  const handleChatRequestAction = async (requestId, status) => {
    try {
      await updateChatRequest(requestId, { status });
      alert(`Chat request ${status}!`);
      loadData();
    } catch (error) {
      alert('Failed to update chat request');
    }
  };

  const handleDeleteThread = async (threadId) => {
    if (!window.confirm('Delete this conversation? This will remove it for both participants.')) return;
    try {
      await deleteThread(threadId);
      setThreads(threads.filter(t => t.id !== threadId));
      if (selectedThreadId === threadId) {
        setSelectedThreadId(null);
        setThreadMessages([]);
      }
    } catch (error) {
      alert('Failed to delete thread: ' + (error.response?.data?.error || error.message));
    }
  };

  if (!user) return null;

  return (
    <div className="container">
      <div style={{
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '25px',
        padding: '3rem',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Profile Header with Picture */}
        <div style={{ 
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '4px solid #7F7FD5',
              background: '#f0f0f0'
            }}>
              {user.profile_picture ? (
                <img 
                  src={`${process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://127.0.0.1:5050'}/${user.profile_picture}`}
                  alt="Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #7F7FD5, #86A8E7)',
                  color: 'white',
                  fontSize: '3rem',
                  fontWeight: 'bold'
                }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Upload button overlay */}
            <label 
              htmlFor="profile-picture-input"
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                background: '#7F7FD5',
                color: 'white',
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '3px solid white',
                fontSize: '1.2rem'
              }}
              title="Change profile picture"
            >
              📷
            </label>
            <input
              id="profile-picture-input"
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              style={{ display: 'none' }}
            />
          </div>
          
          <div style={{ flex: 1 }}>
            <h1 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>
              {user.full_name || user.username}
            </h1>
            <p style={{ color: '#1f2937', fontSize: '1.1rem', marginBottom: '1rem' }}>
              {user.is_doctor ? '👨‍⚕️ Doctor' : '👤 User'} • {user.email}
            </p>
            
            {/* Profile picture actions */}
            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
              {user.profile_picture && (
                <button
                  onClick={handleDeleteProfilePicture}
                  style={{
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  🗑️ Remove Picture
                </button>
              )}
              {uploadingPicture && (
                <span style={{ 
                  color: '#7F7FD5', 
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  Uploading...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          borderBottom: '2px solid #eee',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          {(
            <>
              <button
                onClick={() => setActiveTab('inbox')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '1rem 1.5rem',
                  fontSize: '1.05rem',
                  fontWeight: '600',
                  color: activeTab === 'inbox' ? '#7F7FD5' : '#000',
                  borderBottom: activeTab === 'inbox' ? '3px solid #7F7FD5' : 'none',
                  cursor: 'pointer'
                }}
              >
                Inbox {notificationCounts.inbox > 0 && (
                  <span style={{
                    marginLeft: '0.4rem',
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    background: '#e74c3c',
                    borderRadius: '50%'
                  }}/>
                )}
              </button>
            </>
          )}
          {!user.is_doctor && (
            <>
              <button
                onClick={() => setActiveTab('journals')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '1rem 1.5rem',
                  fontSize: '1.05rem',
                  fontWeight: '600',
                  color: activeTab === 'journals' ? '#7F7FD5' : '#000',
                  borderBottom: activeTab === 'journals' ? '3px solid #7F7FD5' : 'none',
                  cursor: 'pointer'
                }}
              >
                My Journals
              </button>
              <button
                onClick={() => setActiveTab('friends')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '1rem 1.5rem',
                  fontSize: '1.05rem',
                  fontWeight: '600',
                  color: activeTab === 'friends' ? '#7F7FD5' : '#000',
                  borderBottom: activeTab === 'friends' ? '3px solid #7F7FD5' : 'none',
                  cursor: 'pointer'
                }}
              >
                Friends
              </button>
            </>
          )}
          
          {user.is_doctor && (
            <>
              <button
                onClick={() => setActiveTab('clinic-profile')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '1rem 1.5rem',
                  fontSize: '1.05rem',
                  fontWeight: '600',
                  color: activeTab === 'clinic-profile' ? '#7F7FD5' : '#000',
                  borderBottom: activeTab === 'clinic-profile' ? '3px solid #7F7FD5' : 'none',
                  cursor: 'pointer'
                }}
              >
                🏥 Clinic Profile
              </button>
              <button
                onClick={() => setActiveTab('friends')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '1rem 1.5rem',
                  fontSize: '1.05rem',
                  fontWeight: '600',
                  color: activeTab === 'friends' ? '#7F7FD5' : '#000',
                  borderBottom: activeTab === 'friends' ? '3px solid #7F7FD5' : 'none',
                  cursor: 'pointer'
                }}
              >
                👥 Friends
              </button>
              <button
                onClick={() => setActiveTab('patients')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '1rem 1.5rem',
                  fontSize: '1.05rem',
                  fontWeight: '600',
                  color: activeTab === 'patients' ? '#7F7FD5' : '#000',
                  borderBottom: activeTab === 'patients' ? '3px solid #7F7FD5' : 'none',
                  cursor: 'pointer'
                }}
              >
                👥 My Patients
              </button>
              <button
                onClick={() => setActiveTab('chat-requests')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '1rem 1.5rem',
                  fontSize: '1.05rem',
                  fontWeight: '600',
                  color: activeTab === 'chat-requests' ? '#7F7FD5' : '#000',
                  borderBottom: activeTab === 'chat-requests' ? '3px solid #7F7FD5' : 'none',
                  cursor: 'pointer'
                }}
              >
                💬 Chat Requests {notificationCounts.chat_requests > 0 && (
                  <span style={{
                    marginLeft: '0.4rem',
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    background: '#e74c3c',
                    borderRadius: '50%'
                  }}/>
                )}
              </button>
              <button
                onClick={() => setActiveTab('my-articles')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '1rem 1.5rem',
                  fontSize: '1.05rem',
                  fontWeight: '600',
                  color: activeTab === 'my-articles' ? '#7F7FD5' : '#000',
                  borderBottom: activeTab === 'my-articles' ? '3px solid #7F7FD5' : 'none',
                  cursor: 'pointer'
                }}
              >
                📰 My Articles
              </button>
              <button
                onClick={() => setActiveTab('publish-article')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '1rem 1.5rem',
                  fontSize: '1.05rem',
                  fontWeight: '600',
                  color: activeTab === 'publish-article' ? '#7F7FD5' : '#000',
                  borderBottom: activeTab === 'publish-article' ? '3px solid #7F7FD5' : 'none',
                  cursor: 'pointer'
                }}
              >
                📝 Publish Article
              </button>
            </>
          )}
        </div>

        {/* Clinic Profile Tab (Doctor) */}
        {activeTab === 'clinic-profile' && user.is_doctor && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Setup Your Clinic Profile</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              Complete your profile to appear in the Clinics directory and accept patients.
            </p>
            <form onSubmit={handleUpdateClinicProfile}>
              <div className="form-group">
                <label>Specialization *</label>
                <select
                  value={clinicForm.specialization}
                  onChange={(e) => setClinicForm({...clinicForm, specialization: e.target.value})}
                  required
                >
                  <option value="">Select Specialization</option>
                  <option value="Clinical Psychologist">Clinical Psychologist</option>
                  <option value="Psychiatrist">Psychiatrist</option>
                  <option value="Counselor">Counselor</option>
                  <option value="Therapist">Therapist</option>
                  <option value="Mental Health Specialist">Mental Health Specialist</option>
                </select>
              </div>

              <div className="form-group">
                <label>Bio *</label>
                <textarea
                  value={clinicForm.bio}
                  onChange={(e) => setClinicForm({...clinicForm, bio: e.target.value})}
                  rows="4"
                  placeholder="Brief introduction about yourself..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Quote</label>
                <input
                  type="text"
                  value={clinicForm.quote}
                  onChange={(e) => setClinicForm({...clinicForm, quote: e.target.value})}
                  placeholder="Your professional quote or motto"
                />
              </div>

              <div className="form-group">
                <label>Areas of Expertise</label>
                <textarea
                  value={clinicForm.expertise}
                  onChange={(e) => setClinicForm({...clinicForm, expertise: e.target.value})}
                  rows="3"
                  placeholder="e.g., Anxiety, Depression, Trauma, Relationship Issues"
                />
              </div>

              <div className="form-group">
                <label>Education & Qualifications</label>
                <textarea
                  value={clinicForm.education}
                  onChange={(e) => setClinicForm({...clinicForm, education: e.target.value})}
                  rows="3"
                  placeholder="e.g., Ph.D. in Clinical Psychology, Licensed Therapist"
                />
              </div>

              <div className="form-group">
                <label>Age Group Specialization</label>
                <select
                  value={clinicForm.age_group}
                  onChange={(e) => setClinicForm({...clinicForm, age_group: e.target.value})}
                >
                  <option value="">Select Age Group</option>
                  <option value="Children (0-12)">Children (0-12)</option>
                  <option value="Teens (13-19)">Teens (13-19)</option>
                  <option value="Adults (20-59)">Adults (20-59)</option>
                  <option value="Seniors (60+)">Seniors (60+)</option>
                  <option value="All Ages">All Ages</option>
                </select>
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={clinicForm.location}
                  onChange={(e) => setClinicForm({...clinicForm, location: e.target.value})}
                  placeholder="e.g., Dhaka, Bangladesh"
                />
              </div>

              <div className="form-group">
                <label>Session Charge (Amount per session) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={clinicForm.session_charge}
                  onChange={(e) => setClinicForm({...clinicForm, session_charge: e.target.value})}
                  placeholder="e.g., 1500"
                  required
                />
              </div>

              <MapLocationPicker
                initialPosition={
                  clinicForm.latitude && clinicForm.longitude
                    ? { lat: clinicForm.latitude, lng: clinicForm.longitude }
                    : null
                }
                onLocationSelect={(position) => {
                  setClinicForm({
                    ...clinicForm,
                    latitude: position.lat,
                    longitude: position.lng
                  });
                }}
              />

              <button type="submit" className="submit-btn">
                {doctorProfile?.is_profile_complete ? 'Update Clinic Profile' : 'Create Clinic Profile'}
              </button>
            </form>

            {doctorProfile?.is_profile_complete && (
              <div style={{ 
                marginTop: '2rem', 
                padding: '1.5rem', 
                background: 'rgba(46, 125, 50, 0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(46, 125, 50, 0.3)',
                borderRadius: '15px',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{ color: '#1f2937', marginBottom: '0.5rem', fontWeight: 'bold' }}>✅ Profile Complete!</h3>
                <p style={{ color: '#1f2937' }}>
                  Your clinic is now visible on the Clinics page. Patients can find you and book sessions!
                </p>
              </div>
            )}
          </div>
        )}

        {/* My Patients Tab (Doctor) */}
        {activeTab === 'patients' && user.is_doctor && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>My Patients</h2>
            
            {patients.length > 0 ? (
              patients.map(patient => (
                <div 
                  key={patient.id} 
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    padding: '1.5rem',
                    borderRadius: '15px',
                    marginBottom: '1rem',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.2s'
                  }}
                >
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h3 style={{ color: '#1f2937' }}>{patient.username}</h3>
                      <p style={{ color: '#1f2937', fontSize: '0.95rem' }}>{patient.email}</p>
                    </div>
                    <div style={{
                      padding: '0.8rem 1.5rem',
                      borderRadius: '10px',
                      fontWeight: '600',
                      fontSize: '1.1rem',
                      background: patient.suicide_risk_score > 70 ? '#e74c3c' : 
                                 patient.suicide_risk_score > 40 ? '#f39c12' : '#4CAF50',
                      color: 'white'
                    }}>
                      Risk: {Math.round(patient.suicide_risk_score)}%
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem', 
                color: '#999',
                background: '#f8f9fa',
                borderRadius: '15px'
              }}>
                <p style={{ fontSize: '1.1rem' }}>
                  No patients yet. They will appear here when they accept your chat requests.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Chat Requests Tab (Doctor) */}
        {activeTab === 'chat-requests' && user.is_doctor && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Chat Requests</h2>
            
            {chatRequests.filter(r => r.status === 'pending').length > 0 ? (
              chatRequests.filter(r => r.status === 'pending').map(request => (
                <div key={request.id} style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '1.5rem',
                  borderRadius: '15px',
                  marginBottom: '1rem',
                  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
                }}>
                  <h3 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>
                    From: {request.from_user.username}
                  </h3>
                  <p style={{ color: '#1f2937', marginBottom: '1rem' }}>{request.message}</p>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={() => handleChatRequestAction(request.id, 'approved')}
                      style={{
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '0.6rem 1.5rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleChatRequestAction(request.id, 'declined')}
                      style={{
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '0.6rem 1.5rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem', 
                color: '#1f2937',
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '15px',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
              }}>
                <p style={{ fontSize: '1.1rem' }}>No pending chat requests</p>
              </div>
            )}
          </div>
        )}

        {/* My Articles Tab (Doctor) */}
        {activeTab === 'my-articles' && user.is_doctor && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>My Articles</h2>
            
            {articles.length > 0 ? (
              articles.map(article => (
                <div 
                  key={article.id} 
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    padding: '1.5rem',
                    borderRadius: '15px',
                    marginBottom: '1rem',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.2s'
                  }}
                >
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '0.8rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 
                        style={{ 
                          color: '#1f2937', 
                          marginBottom: '0.5rem',
                          cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/articles/${article.id}`)}
                      >
                        {article.title}
                      </h3>
                      <p style={{ 
                        color: '#1f2937', 
                        fontSize: '0.95rem',
                        marginBottom: '0.5rem'
                      }}>
                        {article.content.substring(0, 150)}...
                      </p>
                      <div style={{ 
                        fontSize: '0.9rem', 
                        color: '#1f2937',
                        marginTop: '0.5rem'
                      }}>
                        👍 {article.like_count} likes • 💬 {article.comment_count} comments
                        {article.keywords && (
                          <span style={{ marginLeft: '1rem' }}>
                            🏷️ {article.keywords}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      gap: '0.5rem',
                      marginLeft: '1rem'
                    }}>
                      <button
                        onClick={() => handleEditArticle(article.id)}
                        style={{
                          background: '#7F7FD5',
                          color: 'white',
                          border: 'none',
                          padding: '0.6rem 1.2rem',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          fontWeight: '600',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
                        style={{
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          padding: '0.6rem 1.2rem',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          fontWeight: '600',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem', 
                color: '#1f2937',
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '15px',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
              }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                  No articles yet. Start sharing your knowledge!
                </p>
                <button
                  onClick={() => setActiveTab('publish-article')}
                  className="submit-btn"
                  style={{ width: 'auto' }}
                >
                  📝 Publish Your First Article
                </button>
              </div>
            )}
          </div>
        )}

        {/* Publish Article Tab (Doctor) */}
        {activeTab === 'publish-article' && user.is_doctor && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Publish Article</h2>
            <form onSubmit={handleCreateArticle}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({...articleForm, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={articleForm.content}
                  onChange={(e) => setArticleForm({...articleForm, content: e.target.value})}
                  rows="10"
                  required
                />
              </div>
              <div className="form-group">
                <label>Mood Category (Hidden from users - used for AI recommendations)</label>
                <select
                  value={articleForm.mood_category}
                  onChange={(e) => setArticleForm({...articleForm, mood_category: e.target.value})}
                >
                  <option value="happy">Happy</option>
                  <option value="sad">Sad</option>
                  <option value="anxious">Anxious</option>
                  <option value="stressed">Stressed</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>
              <div className="form-group">
                <label>Keywords (comma separated)</label>
                <input
                  type="text"
                  value={articleForm.keywords}
                  onChange={(e) => setArticleForm({...articleForm, keywords: e.target.value})}
                  placeholder="mental health, anxiety, stress relief"
                />
              </div>
              <div className="form-group">
                <label>Cover Image *</label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setArticleForm({...articleForm, cover_image: file});
                    }
                  }}
                  required
                />
                {articleForm.cover_image && (
                  <small style={{ color: '#4CAF50', display: 'block', marginTop: '0.5rem' }}>
                    ✓ Selected: {articleForm.cover_image.name}
                  </small>
                )}
              </div>
              <button type="submit" className="submit-btn">
                Publish Article
              </button>
            </form>
          </div>
        )}

        {/* Journals Tab (Regular Users) */}
        {activeTab === 'journals' && !user.is_doctor && (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2>My Journals</h2>
              <button 
                onClick={() => setShowJournalForm(true)}
                className="submit-btn"
                style={{ width: 'auto' }}
              >
                + New Journal
              </button>
            </div>

            {journals.map(journal => (
              <div key={journal.id} style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '1.5rem',
                borderRadius: '15px',
                marginBottom: '1rem',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '0.5rem'
                }}>
                  <h3 style={{ color: '#1f2937' }}>{journal.title}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleTogglePublic(journal)}
                      style={{
                        background: journal.is_public ? '#4CAF50' : '#999',
                        color: 'white',
                        border: 'none',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      {journal.is_public ? '🌐 Public' : '🔒 Private'}
                    </button>
                    <button
                      onClick={() => handleDeleteJournal(journal.id)}
                      style={{
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
                <p style={{ color: '#1f2937', whiteSpace: 'pre-wrap' }}>{journal.content}</p>
                <div style={{ 
                  marginTop: '0.8rem',
                  fontSize: '0.9rem',
                  color: '#1f2937'
                }}>
                  ❤️ {journal.heart_count} hearts • 💬 {journal.comment_count} comments
                </div>
              </div>
            ))}

            {journals.length === 0 && (
              <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                No journals yet. Start writing!
              </p>
            )}
          </div>
        )}

        {/* Inbox Tab (Regular Users) */}
        {activeTab === 'inbox' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Inbox</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1rem' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '1rem',
                borderRadius: '12px',
                maxHeight: '480px',
                overflowY: 'auto',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
              }}>
                {threads.length === 0 && (
                  <p style={{ color: '#1f2937' }}>No conversations yet.</p>
                )}
                {threads.map(thread => (
                  <div
                    key={thread.id}
                    style={{
                      padding: '0.8rem',
                      background: selectedThreadId === thread.id ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      borderRadius: '10px',
                      marginBottom: '0.6rem',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      position: 'relative'
                    }}
                  >
                    <div
                      onClick={async () => {
                        setSelectedThreadId(thread.id);
                        const msgs = await getThreadMessages(thread.id);
                        setThreadMessages(Array.isArray(msgs) ? msgs : []);
                        try { await markThreadRead(thread.id); } catch {}
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div style={{ fontWeight: 600, color: '#1f2937' }}>{thread.thread_type === 'user_user' ? 'Friend Chat' : 'Doctor Chat'}</div>
                      <div style={{ fontSize: '0.85rem', color: '#1f2937' }}>
                        With: {(() => {
                          const participants = (thread.participants || []);
                          const others = participants.filter(p => p.id !== user.id);
                          return others.length > 0 ? others.map(p => p.full_name || p.username).join(', ') : '';
                        })()}
                      </div>
                      {thread.last_message && thread.last_message.content && (
                        <div style={{ fontSize: '0.85rem', color: '#1f2937', marginTop: '0.3rem' }}>
                          "{thread.last_message.content.length > 80 ? thread.last_message.content.slice(0, 80) + '…' : thread.last_message.content}"
                        </div>
                      )}
                      {thread.unread_count > 0 && (
                        <div style={{ fontSize: '0.8rem', color: '#7F7FD5', marginTop: '0.3rem' }}>
                          • {thread.unread_count} new
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteThread(thread.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Delete conversation"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '1rem',
                borderRadius: '12px',
                minHeight: '300px',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
              }}>
                {!selectedThreadId ? (
                  <p style={{ color: '#1f2937' }}>Select a conversation to view messages.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
                      {(Array.isArray(threadMessages) ? threadMessages : []).map(m => (
                        <div key={m.id} style={{
                          background: m.sender.id === user.id ? 'rgba(127, 127, 213, 0.25)' : 'rgba(255, 255, 255, 0.35)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          padding: '0.8rem',
                          borderRadius: '10px',
                          marginBottom: '0.6rem'
                        }}>
                          <div style={{ fontWeight: 600, color: '#1f2937' }}>{m.sender.username}</div>
                          <div style={{ color: '#1f2937' }}>{m.content}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={messageText}
                        onChange={e => setMessageText(e.target.value)}
                        placeholder="Type a message..."
                        style={{ 
                          flex: 1, 
                          padding: '0.8rem', 
                          border: '1px solid rgba(255, 255, 255, 0.3)', 
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.35)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          color: '#1f2937'
                        }}
                      />
                      <button
                        onClick={async () => {
                          if (!messageText.trim()) return;
                          await postThreadMessage(selectedThreadId, { content: messageText });
                          const msgs = await getThreadMessages(selectedThreadId);
                          setThreadMessages(msgs);
                          setMessageText('');
                        }}
                        className="submit-btn"
                        style={{ width: 'auto' }}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Friends</h2>
            
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '1.5rem',
              borderRadius: '15px',
              marginBottom: '2rem',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>Add Friends</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by username or name..."
                  style={{
                    flex: 1,
                    padding: '0.8rem',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.35)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    color: '#1f2937'
                  }}
                />
                <button onClick={handleSearch} className="submit-btn" style={{ width: 'auto' }}>
                  Search
                </button>
              </div>

              {searchResults.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  {searchResults.map(result => (
                    <div key={result.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.8rem',
                      background: 'rgba(255, 255, 255, 0.35)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '10px',
                      marginTop: '0.5rem'
                    }}>
                      <span style={{ color: '#1f2937' }}>{result.username} ({result.full_name || 'No name'})</span>
                      <button
                        onClick={() => handleAddFriend(result.id)}
                        style={{
                          background: 'linear-gradient(135deg, #7F7FD5, #86A8E7)',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        Add Friend
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Friend Requests Section */}
            {friendRequests.length > 0 && (
              <div style={{ 
                background: 'rgba(255, 193, 7, 0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                padding: '1.5rem',
                borderRadius: '15px',
                marginBottom: '2rem',
                border: '1px solid rgba(255, 193, 7, 0.3)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{ marginBottom: '1rem', color: '#1f2937', fontWeight: 'bold' }}>Friend Requests ({friendRequests.length})</h3>
                {friendRequests.map(req => (
                  <div 
                    key={req.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.35)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '10px',
                      marginBottom: '0.8rem'
                    }}
                  >
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '2px solid #ffc107',
                      background: '#f0f0f0',
                      flexShrink: 0
                    }}>
                      {req.from_user.profile_picture ? (
                        <img 
                          src={`${process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://127.0.0.1:5050'}${req.from_user.profile_picture}`}
                          alt={req.from_user.username}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(135deg, #ffc107, #ff9800)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '1.2rem',
                          fontWeight: 'bold'
                        }}>
                          {req.from_user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#1f2937' }}>{req.from_user.username}</div>
                      <div style={{ fontSize: '0.9rem', color: '#1f2937' }}>
                        {req.from_user.full_name || 'No name'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleAcceptFriendRequest(req.id)}
                        className="submit-btn"
                        style={{ width: 'auto', background: '#28a745' }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectFriendRequest(req.id)}
                        className="submit-btn"
                        style={{ width: 'auto', background: '#dc3545' }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              {friends.map(friend => (
                <div 
                  key={friend.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '15px',
                    marginBottom: '0.8rem',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                    cursor: 'default'
                  }}
                >
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid #7F7FD5',
                    background: '#f0f0f0',
                    flexShrink: 0
                  }}>
                    {friend.profile_picture ? (
                      <img 
                        src={`${process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://127.0.0.1:5050'}/${friend.profile_picture}`}
                        alt={friend.username}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #7F7FD5, #86A8E7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}>
                        {friend.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#1f2937' }}>{friend.username}</div>
                    <div style={{ fontSize: '0.9rem', color: '#1f2937' }}>
                      {friend.full_name || 'No name'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => navigate(`/users/${friend.id}`)}
                      className="submit-btn"
                      style={{ width: 'auto', background: '#ccc' }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleOpenChat(friend.id)}
                      className="submit-btn"
                      style={{ width: 'auto' }}
                    >
                      Message
                    </button>
                    <button
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="submit-btn"
                      style={{ width: 'auto', background: '#dc3545' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {friends.length === 0 && (
                <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                  No friends yet. Search and add some!
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Journal Form Modal */}
      {showJournalForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="form-container" style={{ maxWidth: '600px' }}>
            <h2>New Journal Entry</h2>
            <form onSubmit={handleCreateJournal}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={journalForm.title}
                  onChange={(e) => setJournalForm({...journalForm, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={journalForm.content}
                  onChange={(e) => setJournalForm({...journalForm, content: e.target.value})}
                  rows="8"
                  required
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={journalForm.is_public}
                    onChange={(e) => setJournalForm({...journalForm, is_public: e.target.checked})}
                  />
                  Make this journal public
                </label>
              </div>
              <button type="submit" className="submit-btn">
                Create Journal
              </button>
              <button 
                type="button" 
                onClick={() => setShowJournalForm(false)}
                style={{ marginTop: '1rem', background: '#ccc' }}
                className="submit-btn"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyProfile;
