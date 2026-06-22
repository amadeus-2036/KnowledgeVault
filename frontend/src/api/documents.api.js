// src/api/documents.api.js
import api from './axios';
export const getDocuments = (params) => api.get('/documents', { params });
export const getDocumentById = (id) => api.get(`/documents/${id}`);
export const uploadDocument = (formData) => api.post('/documents', formData);
export const deleteDocument = (id) => api.delete(`/documents/${id}`);
export const generateDocumentSummary = (id) => api.post(`/documents/${id}/summary`);
export const generateDocumentTags = (id) => api.post(`/documents/${id}/tags`);
