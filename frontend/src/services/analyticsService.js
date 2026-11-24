import { request } from './api';

export const analyticsService = {
  async getSummary() {
    const res = await request('/analytics/summary');
    return res.data;
  },

  async getWeekly() {
    const res = await request('/analytics/weekly');
    return res.data;
  },

  async getPathsAnalytics() {
    const res = await request('/analytics/paths');
    return res.data;
  },

  async getTopicsAnalytics() {
    const res = await request('/analytics/topics');
    return res.data;
  },
};

export default analyticsService;
