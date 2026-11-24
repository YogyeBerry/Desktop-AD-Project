import { request } from './api';

export const resourceService = {
  async getAllResources() {
    const res = await request('/resources');
    return res.data;
  },

  async addResource(topicId, data) {
    const res = await request(`/topics/${topicId}/resources`, {
      method: 'POST',
      body: data,
    });
    return res.data;
  },

  async updateResource(id, data) {
    const res = await request(`/resources/${id}`, {
      method: 'PUT',
      body: data,
    });
    return res.data;
  },

  async deleteResource(id) {
    const res = await request(`/resources/${id}`, {
      method: 'DELETE',
    });
    return res;
  },

  async importBatch(items) {
    const res = await request('/resources/import', {
      method: 'POST',
      body: { resources: items },
    });
    return res.data;
  },
};

export default resourceService;
