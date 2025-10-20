import axios from 'axios';
import { getUserToken } from './authService';

// Your backend URL
const API_URL = 'http://localhost:5000/api/chat';

// Create axios instance with auth interceptor
const apiClient = axios.create({
  baseURL: API_URL
});

// Add token to every request automatically
apiClient.interceptors.request.use(async (config) => {
  const token = await getUserToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Create a new chat session
export const createSession = async (title = 'New Chat') => {
  try {
    const response = await apiClient.post('/session', { title });
    return response.data;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

// Get all user's sessions
export const getSessions = async () => {
  try {
    const response = await apiClient.get('/sessions');
    return response.data.sessions;
  } catch (error) {
    console.error('Error getting sessions:', error);
    throw error;
  }
};

// Get messages for a specific session
export const getMessages = async (sessionId) => {
  try {
    const response = await apiClient.get(`/messages/${sessionId}`);
    return response.data.messages;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

// Send a message and get AI response
export const sendMessage = async (sessionId, message) => {
  try {
    const response = await apiClient.post('/message', {
      sessionId,
      message
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Delete a session
export const deleteSession = async (sessionId) => {
  try {
    const response = await apiClient.delete(`/session/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};