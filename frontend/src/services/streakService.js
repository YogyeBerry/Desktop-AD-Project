import { request } from './api';

export const streakService = {
  /**
   * Get streak summary for user (optionally passing client's local date)
   * @param {string} [today] - YYYY-MM-DD
   */
  async getSummary(today) {
    const query = today ? `?today=${today}` : '';
    const res = await request(`/streak/summary${query}`);
    return res.data;
  },
};

export default streakService;
