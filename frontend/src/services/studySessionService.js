import { request } from './api';

export const studySessionService = {
  async getAllSessions() {
    const res = await request('/sessions');
    return res.data;
  },

  async getSessionsByTopic(topicId) {
    const res = await request(`/topics/${topicId}/sessions`);
    return res.data;
  },

  async createSession(topicId, data) {
    const res = await request(`/topics/${topicId}/sessions`, {
      method: 'POST',
      body: data,
    });
    return res.data;
  },
};

export default studySessionService;
