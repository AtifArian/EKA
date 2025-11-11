import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5050/api';

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

export const checkTodayMood = () => api.get('/mood/today').then(res => res.data);
export const createMoodEntry = (data) => api.post('/mood', data).then(res => res.data);
export const getMoodEntries = (days = 30) => api.get(`/mood?days=${days}`).then(res => res.data);

export const getUser = (userId) => api.get(`/users/${userId}`).then(res => res.data);
export const searchUsers = (query) => api.get(`/users/search?q=${query}`).then(res => res.data);
export const getFriends = () => api.get('/users/friends').then(res => res.data);
export const addFriend = (friendId) => api.post(`/users/friends/${friendId}`).then(res => res.data);
export const removeFriend = (friendId) => api.delete(`/users/friends/${friendId}`).then(res => res.data);
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

export const getArticles = (params) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/articles?${query}`).then(res => res.data);
};
export const getArticle = (articleId) => api.get(`/articles/${articleId}`).then(res => res.data);
export const getMyArticles = () => api.get('/articles/my').then(res => res.data);
export const createArticle = (data) => api.post('/articles', data).then(res => res.data);
export const updateArticle = (articleId, data) => api.put(`/articles/${articleId}`, data).then(res => res.data);
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

export default api;
