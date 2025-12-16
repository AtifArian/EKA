import axios from 'axios';

// Normalize API base URL to ensure it always includes '/api'
let API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5050/api';
if (API_URL) {
  const hasApiSegment = /\/api\/?$/.test(API_URL) || /\/api\//.test(API_URL);
  if (!hasApiSegment) {
    // Append '/api' safely without duplicating slashes
    API_URL = API_URL.replace(/\/$/, '') + '/api';
  }
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

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
      // Token expired or invalid
      const errorMsg = error.response.data?.msg || error.response.data?.error || '';
      if (errorMsg.includes('expired') || errorMsg.includes('Token') || errorMsg.includes('JWT')) {
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login page
        if (window.location.pathname !== '/login') {
          alert('Your session has expired. Please login again.');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

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
export const updateProfile = (data) => api.put('/users/profile', data).then(res => res.data);
export const uploadProfilePicture = (file) => {
  const formData = new FormData();
  formData.append('profile_picture', file);
  return api.put('/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data);
};
export const deleteProfilePicture = () => api.delete('/users/profile-picture').then(res => res.data);

export const getClinics = (params) => {
  const query = new URLSearchParams(params).toString();
  // Use trailing slash to match Flask blueprint root route and avoid 308 redirects
  return api.get(`/clinics/?${query}`).then(res => res.data);
};
export const getClinicDetail = (clinicId) => api.get(`/clinics/${clinicId}`).then(res => res.data);
export const addClinicReview = (clinicId, data) => api.post(`/clinics/${clinicId}/reviews`, data).then(res => res.data);
export const bookSession = (clinicId, data) => api.post(`/clinics/${clinicId}/book`, data).then(res => res.data);
export const sendChatRequest = (clinicId, data) => api.post(`/clinics/${clinicId}/chat-request`, data).then(res => res.data);
export const getSpecializations = () => api.get('/clinics/specializations').then(res => res.data);

export const getDoctorProfile = () => api.get('/doctors/profile').then(res => res.data);
export const updateDoctorProfile = (data) => api.put('/doctors/profile', data).then(res => res.data);
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

export const getArticles = (params) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/articles?${query}`).then(res => res.data);
};
export const getTopArticles = () => api.get('/articles/top').then(res => res.data);
export const getArticle = (articleId) => api.get(`/articles/${articleId}`).then(res => res.data);
export const getMyArticles = () => api.get('/articles/my').then(res => res.data);
export const createArticle = (formData) => {
  return api.post('/articles', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data);
};
export const updateArticle = (articleId, formData) => {
  return api.put(`/articles/${articleId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data);
};
export const deleteArticle = (articleId) => api.delete(`/articles/${articleId}`).then(res => res.data);
export const likeArticle = (articleId) => api.post(`/articles/${articleId}/like`).then(res => res.data);
export const addArticleComment = (articleId, data) => api.post(`/articles/${articleId}/comments`, data).then(res => res.data);

export const getJournals = (params) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/journals?${query}`).then(res => res.data);
};
export const getTopJournals = () => api.get('/journals/top').then(res => res.data);
export const getJournal = (journalId) => api.get(`/journals/${journalId}`).then(res => res.data);
export const getMyJournals = () => api.get('/journals/my').then(res => res.data);
export const getUserJournals = (userId) => api.get(`/journals/user/${userId}`).then(res => res.data);
export const createJournal = (data) => api.post('/journals', data).then(res => res.data);
export const updateJournal = (journalId, data) => api.put(`/journals/${journalId}`, data).then(res => res.data);
export const deleteJournal = (journalId) => api.delete(`/journals/${journalId}`).then(res => res.data);
export const heartJournal = (journalId) => api.post(`/journals/${journalId}/heart`).then(res => res.data);
export const addJournalComment = (journalId, data) => api.post(`/journals/${journalId}/comments`, data).then(res => res.data);

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
