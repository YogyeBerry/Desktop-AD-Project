import { request } from './api';

export const activityService = {
  /**
   * Record a timer start
   * @param {string} [date] - YYYY-MM-DD
   */
  async recordStart(date) {
    const res = await request('/activity/start', {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
    return res.data;
  },

  /**
   * Get rolling calendar activity (default 365 days)
   * @param {number} [days=365]
   */
  async getCalendar(days = 365) {
    const res = await request(`/activity/calendar?days=${days}`);
    return res.data;
  },
};

export default activityService;
