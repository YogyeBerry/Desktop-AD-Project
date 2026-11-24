const analyticsService = require('../services/analyticsService');

class AnalyticsController {
  async getSummary(req, res, next) {
    try {
      const summary = await analyticsService.getSummary();
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }

  async getWeekly(req, res, next) {
    try {
      const weekly = await analyticsService.getWeekly();
      res.json({ success: true, data: weekly });
    } catch (err) {
      next(err);
    }
  }

  async getPathsAnalytics(req, res, next) {
    try {
      const paths = await analyticsService.getPathsAnalytics();
      res.json({ success: true, data: paths });
    } catch (err) {
      next(err);
    }
  }

  async getTopicsAnalytics(req, res, next) {
    try {
      const topics = await analyticsService.getTopicsAnalytics();
      res.json({ success: true, data: topics });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AnalyticsController();
