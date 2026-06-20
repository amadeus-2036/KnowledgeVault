// src/api/documents.api.js
import api from './axios';
export const getDocuments = (params) => api.get('/documents', { params });
export const getDocumentById = (id) => api.get(`/documents/${id}`);
export const uploadDocument = (formData) =>
  api.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteDocument = (id) => api.delete(`/documents/${id}`);
