import axios from 'axios';

// Normalize API base URL to ensure it always includes '/api'
let API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5050/api';
if (API_URL) {
  const hasApiSegment = /\/api\/?$/.test(API_URL) || /\/api\//.test(API_URL);
  if (!hasApiSegment) {
    API_URL = API_URL.replace(/\/$/, '') + '/api';
  }
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Simple in-memory response cache with TTL for ultra-fast navigation (0ms instant page loads)
const apiCache = new Map();
const DEFAULT_CACHE_TTL = 180000; // 3 minutes

const getCacheKey = (url, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return `${url}?${queryString}`;
};

export const getCachedData = (url, params = {}) => {
  const key = getCacheKey(url, params);
  const entry = apiCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    apiCache.delete(key);
    return null;
  }
  return entry.data;
};

export const setCachedData = (url, params = {}, data, ttl = DEFAULT_CACHE_TTL) => {
  const key = getCacheKey(url, params);
  apiCache.set(key, { data, timestamp: Date.now(), ttl });
};

export const clearCachePrefix = (prefix) => {
  for (const key of apiCache.keys()) {
    if (key.startsWith(prefix)) {
      apiCache.delete(key);
    }
  }
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const errorMsg = error.response.data?.msg || error.response.data?.error || '';
      if (errorMsg.includes('expired') || errorMsg.includes('Token') || errorMsg.includes('JWT')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        if (window.location.pathname !== '/login') {
          alert('Your session has expired. Please login again.');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Cached fetch helper
const fetchWithCache = async (url, params = {}, ttl = DEFAULT_CACHE_TTL) => {
  const cached = getCachedData(url, params);
  if (cached) {
    // Return cached immediately; fetch fresh in background
    api.get(url, { params })
      .then(res => setCachedData(url, params, res.data, ttl))
      .catch(() => {});
    return cached;
  }
  const res = await api.get(url, { params });
  setCachedData(url, params, res.data, ttl);
  return res.data;
};

export const checkTodayMood = () => api.get('/mood/today').then(res => res.data);
export const createMoodEntry = (data) => api.post('/mood', data).then(res => res.data);
export const getMoodEntries = (days = 30) => api.get(`/mood?days=${days}`).then(res => res.data);

export const getUser = (userId) => api.get(`/users/${userId}`).then(res => res.data);
export const searchUsers = (query) => api.get(`/users/search?q=${query}`).then(res => res.data);
export const getFriends = () => api.get('/users/friends').then(res => res.data);
export const addFriend = (friendId) => api.post(`/users/friends/${friendId}`).then(res => res.data);
export const removeFriend = (friendId) => api.delete(`/users/friends/${friendId}`).then(res => res.data);
export const getFriendRequests = () => api.get('/users/friend-requests').then(res => res.data);
export const handleFriendRequest = (requestId, action) => api.put(`/users/friend-requests/${requestId}`, { action }).then(res => res.data);
export const updateProfile = (data) => api.put('/users/profile', data).then(res => {
  clearCachePrefix('/users');
  return res.data;
});
export const uploadProfilePicture = (file) => {
  const formData = new FormData();
  formData.append('profile_picture', file);
  return api.put('/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => {
    clearCachePrefix('/users');
    return res.data;
  });
};
export const deleteProfilePicture = () => api.delete('/users/profile-picture').then(res => {
  clearCachePrefix('/users');
  return res.data;
});

// Clinic APIs with caching
export const getClinics = (params = {}) => fetchWithCache('/clinics/', params);
export const getClinicDetail = (clinicId) => fetchWithCache(`/clinics/${clinicId}`);
export const addClinicReview = (clinicId, data) => api.post(`/clinics/${clinicId}/reviews`, data).then(res => {
  clearCachePrefix('/clinics');
  return res.data;
});
export const bookSession = (clinicId, data) => api.post(`/clinics/${clinicId}/book`, data).then(res => res.data);
export const sendChatRequest = (clinicId, data) => api.post(`/clinics/${clinicId}/chat-request`, data).then(res => res.data);
export const getSpecializations = () => fetchWithCache('/clinics/specializations', {}, 600000); // 10 min cache

export const getDoctorProfile = () => api.get('/doctors/profile').then(res => res.data);
export const updateDoctorProfile = (data) => api.put('/doctors/profile', data).then(res => {
  clearCachePrefix('/clinics');
  return res.data;
});
export const getPatients = () => api.get('/doctors/patients').then(res => res.data);
export const getPatientDetail = (patientId) => api.get(`/doctors/patients/${patientId}`).then(res => res.data);
export const getChatRequests = () => api.get('/doctors/chat-requests').then(res => res.data);
export const updateChatRequest = (requestId, data) => api.put(`/doctors/chat-requests/${requestId}`, data).then(res => res.data);

// Chat feature
export const createUserUserThread = (recipient_user_id) => api.post('/messages/threads/user-user', { recipient_user_id }).then(res => res.data);
export const listThreads = () => api.get('/messages/threads').then(res => res.data);
export const getThreadMessages = (threadId) => api.get(`/messages/threads/${threadId}/messages`).then(res => res.data);
export const postThreadMessage = (threadId, content) => api.post(`/messages/threads/${threadId}/messages`, { content }).then(res => res.data);
export const markThreadRead = (threadId) => api.put(`/messages/threads/${threadId}/read`).then(res => res.data);
export const deleteThread = (threadId) => api.delete(`/messages/threads/${threadId}`).then(res => res.data);
export const createDoctorChatRequest = (to_doctor_id, message) => api.post('/doctors/chat-requests', { to_doctor_id, message }).then(res => res.data);

// Notifications
export const getNotificationCounts = () => api.get('/notifications').then(res => res.data);
export const markNotificationsRead = (scope) => api.put('/notifications/read', { scope }).then(res => res.data);

// Article APIs with caching
export const getArticles = (params = {}) => fetchWithCache('/articles', params);
export const getTopArticles = () => fetchWithCache('/articles/top');
export const getArticle = (articleId) => fetchWithCache(`/articles/${articleId}`);
export const getMyArticles = () => api.get('/articles/my').then(res => res.data);
export const createArticle = (formData) => {
  return api.post('/articles', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => {
    clearCachePrefix('/articles');
    return res.data;
  });
};
export const updateArticle = (articleId, formData) => {
  return api.put(`/articles/${articleId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => {
    clearCachePrefix('/articles');
    return res.data;
  });
};
export const deleteArticle = (articleId) => api.delete(`/articles/${articleId}`).then(res => {
  clearCachePrefix('/articles');
  return res.data;
});
export const likeArticle = (articleId) => api.post(`/articles/${articleId}/like`).then(res => {
  clearCachePrefix('/articles');
  return res.data;
});
export const addArticleComment = (articleId, data) => api.post(`/articles/${articleId}/comments`, data).then(res => {
  clearCachePrefix('/articles');
  return res.data;
});

// Journal APIs with caching
export const getJournals = (params = {}) => fetchWithCache('/journals', params);
export const getTopJournals = () => fetchWithCache('/journals/top');
export const getJournal = (journalId) => fetchWithCache(`/journals/${journalId}`);
export const getMyJournals = () => api.get('/journals/my').then(res => res.data);
export const getUserJournals = (userId) => api.get(`/journals/user/${userId}`).then(res => res.data);
export const createJournal = (data) => api.post('/journals', data).then(res => {
  clearCachePrefix('/journals');
  return res.data;
});
export const updateJournal = (journalId, data) => api.put(`/journals/${journalId}`, data).then(res => {
  clearCachePrefix('/journals');
  return res.data;
});
export const deleteJournal = (journalId) => api.delete(`/journals/${journalId}`).then(res => {
  clearCachePrefix('/journals');
  return res.data;
});
export const heartJournal = (journalId) => api.post(`/journals/${journalId}/heart`).then(res => {
  clearCachePrefix('/journals');
  return res.data;
});
export const addJournalComment = (journalId, data) => api.post(`/journals/${journalId}/comments`, data).then(res => {
  clearCachePrefix('/journals');
  return res.data;
});

// Booking APIs
export const getMyBookings = () => api.get('/bookings/my-bookings').then(res => res.data);
export const getMySessions = () => api.get('/bookings/my-sessions').then(res => res.data);
export const cancelBooking = (bookingId) => api.put(`/bookings/${bookingId}/cancel`).then(res => res.data);
export const completeBooking = (bookingId) => api.put(`/bookings/${bookingId}/complete`).then(res => res.data);
export const confirmBooking = (bookingId) => api.put(`/bookings/${bookingId}/confirm`).then(res => res.data);

// Doctor APIs
export const getHighRiskPatients = () => api.get('/doctors/high-risk-patients').then(res => res.data);

// Activity APIs
export const getMyActivity = () => api.get('/activity/my').then(res => res.data);
export const getPatientActivity = (patientId) => api.get(`/activity/patient/${patientId}`).then(res => res.data);
export const trackArticleRead = (articleId) => api.post(`/activity/track-article-read/${articleId}`).then(res => res.data);

// Donation APIs - no authentication required
export const createDonation = (data) => {
  return axios.post(`${API_URL}/donations`, data, {
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.data);
};
export const getDonations = (params) => axios.get(`${API_URL}/donations`, { params }).then(res => res.data);
export const getDonationStats = () => axios.get(`${API_URL}/donations/stats`).then(res => res.data);

export default api;
