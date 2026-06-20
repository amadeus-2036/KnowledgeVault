import api from './axios';

export const ingestUrl = async (data) => {
  const response = await api.post('/knowledge/ingest', data);
  return response.data;
};
