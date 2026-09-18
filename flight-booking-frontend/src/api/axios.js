import axios from 'axios';

// Base URL points to backend API (or dev proxy)
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token if logged in
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skywings_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle auth expirations gracefully
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is expired or invalid - clear local storage
      const token = localStorage.getItem('skywings_token');
      if (token) {
        localStorage.removeItem('skywings_token');
        localStorage.removeItem('skywings_user');
        // Dispatch custom event to notify auth context
        window.dispatchEvent(new Event('skywings_auth_logout'));
      }
    }
    return Promise.reject(error);
  }
);

export default API;
