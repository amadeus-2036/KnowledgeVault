// src/api/tags.api.js
import api from './axios';
export const getTags = () => api.get('/tags');
export const createTag = (data) => api.post('/tags', data);
export const deleteTag = (id) => api.delete(`/tags/${id}`);
