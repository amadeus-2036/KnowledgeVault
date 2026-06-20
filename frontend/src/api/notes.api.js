// src/api/notes.api.js
import api from './axios';
export const getNotes = (params) => api.get('/notes', { params });
export const getNoteById = (id) => api.get(`/notes/${id}`);
export const createNote = (data) => api.post('/notes', data);
export const updateNote = (id, data) => api.put(`/notes/${id}`, data);
export const deleteNote = (id) => api.delete(`/notes/${id}`);
export const togglePin = (id) => api.patch(`/notes/${id}/pin`);
