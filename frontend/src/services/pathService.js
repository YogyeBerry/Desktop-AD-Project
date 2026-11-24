import { request } from './api';

export const pathService = {
  async getAllPaths() {
    const res = await request('/paths');
    return res.data;
  },

  async getPathById(id) {
    const res = await request(`/paths/${id}`);
    return res.data;
  },

  async createPath(data) {
    const res = await request('/paths', {
      method: 'POST',
      body: data,
    });
    return res.data;
  },

  async updatePath(id, data) {
    const res = await request(`/paths/${id}`, {
      method: 'PUT',
      body: data,
    });
    return res.data;
  },

  async deletePath(id) {
    const res = await request(`/paths/${id}`, {
      method: 'DELETE',
    });
    return res;
  },
};

export default pathService;
