// src/api/ai.api.js
import api from './axios';
export const searchVault = (params) => api.get('/ai/search', { params });
export const askVault = (data) => api.post('/ai/ask', data);
export const getInsights = () => api.get('/ai/insights');
export const getDashboardStats = () => api.get('/ai/dashboard/stats');
