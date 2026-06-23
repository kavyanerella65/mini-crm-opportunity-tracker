import api from './api';

export const opportunityApi = {
  list: (params) => api.get('/opportunities', { params }).then((res) => res.data),
  summary: () => api.get('/opportunities/summary').then((res) => res.data),
  getById: (id) => api.get(`/opportunities/${id}`).then((res) => res.data),
  create: (payload) => api.post('/opportunities', payload).then((res) => res.data),
  update: (id, payload) => api.put(`/opportunities/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/opportunities/${id}`).then((res) => res.data),
};
