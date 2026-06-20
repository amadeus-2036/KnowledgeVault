import api from './axios';

export const getRepositories = async () => {
  const { data } = await api.get('/repositories');
  return data.data;
};

export const getRepository = async (id) => {
  const { data } = await api.get(`/repositories/${id}`);
  return data.data;
};

export const createRepository = async (repositoryData) => {
  const { data } = await api.post('/repositories', repositoryData);
  return data.data;
};

export const updateRepository = async (id, repositoryData) => {
  const { data } = await api.put(`/repositories/${id}`, repositoryData);
  return data.data;
};

export const deleteRepository = async (id) => {
  const { data } = await api.delete(`/repositories/${id}`);
  return data.data;
};
