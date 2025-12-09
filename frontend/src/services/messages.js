import api from './api';

// Chat Requests
export const sendChatRequest = async (doctorId, message) => {
  const response = await api.post('/messages/chat-request/send', {
    doctor_id: doctorId,
    message: message
  });
  return response.data;
};

export const respondToChatRequest = async (requestId, action) => {
  const response = await api.post(`/messages/chat-request/${requestId}/respond`, {
    action: action  // 'accept' or 'reject'
  });
  return response.data;
};

export const getPendingChatRequests = async () => {
  const response = await api.get('/messages/chat-requests/pending');
  return response.data;
};

export const getSentChatRequests = async () => {
  const response = await api.get('/messages/chat-requests/sent');
  return response.data;
};

// Chats
export const getMyChats = async () => {
  const response = await api.get('/messages/chats');
  return response.data;
};

export const getChat = async (chatId) => {
  const response = await api.get(`/messages/chats/${chatId}`);
  return response.data;
};

export const endChat = async (chatId) => {
  const response = await api.post(`/messages/chats/${chatId}/end`);
  return response.data;
};

export const leaveChat = async (chatId) => {
  const response = await api.post(`/messages/chats/${chatId}/leave`);
  return response.data;
};

// Messages
export const sendMessage = async (chatId, content) => {
  const response = await api.post('/messages/messages/send', {
    chat_id: chatId,
    content: content
  });
  return response.data;
};

export const markMessageAsRead = async (messageId) => {
  const response = await api.put(`/messages/messages/${messageId}/read`);
  return response.data;
};

export const getUnreadCount = async (chatId) => {
  const response = await api.get(`/messages/chats/${chatId}/unread-count`);
  return response.data;
};
