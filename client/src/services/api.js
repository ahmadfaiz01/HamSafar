import axios from 'axios';

// Create a base axios instance with common configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Log errors but don't handle them here - let components handle specific errors
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Request interceptor for authentication
api.interceptors.request.use(
  config => {
    // Add auth token if needed in the future
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default api;