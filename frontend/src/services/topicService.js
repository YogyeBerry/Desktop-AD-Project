import { request } from './api';

export const topicService = {
  async addTopic(pathId, data) {
    const res = await request(`/paths/${pathId}/topics`, {
      method: 'POST',
      body: data,
    });
    return res.data;
  },

  async updateTopic(id, data) {
    const res = await request(`/topics/${id}`, {
      method: 'PUT',
      body: data,
    });
    return res.data;
  },

  async deleteTopic(id) {
    const res = await request(`/topics/${id}`, {
      method: 'DELETE',
    });
    return res;
  },

  async updateProgress(id, isCompleted) {
    const res = await request(`/topics/${id}/progress`, {
      method: 'PATCH',
      body: { isCompleted },
    });
    return res.data;
  },
};

export default topicService;
