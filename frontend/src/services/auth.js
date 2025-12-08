import api from './api';

export const signup = async (userData) => {
  const response = await api.post('/api/auth/signup', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/api/auth/login', credentials);
  return response.data;
};

export const googleAuth = async (token) => {
  const response = await api.post('/api/auth/google', { token });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

export const verifyDoctor = async (file) => {
  const formData = new FormData();
  formData.append('verification_document', file);
  
  const response = await api.post('/api/auth/verify-doctor', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
