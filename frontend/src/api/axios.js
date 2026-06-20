// src/api/axios.js
// Centralized Axios instance — all API calls go through here.
// Interview points:
// - baseURL set to /api — dev proxy in vite.config.js routes this to backend
// - Request interceptor automatically attaches the JWT token to every request
// - Response interceptor handles 401 globally (auto-logout on expired token)

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kv_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kv_token');
      localStorage.removeItem('kv_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
