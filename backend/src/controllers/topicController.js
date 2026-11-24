const topicService = require('../services/topicService');

class TopicController {
  async addTopic(req, res, next) {
    try {
      const topic = await topicService.addTopicToPath(req.params.id, req.body);
      res.status(201).json({ success: true, data: topic });
    } catch (err) {
      next(err);
    }
  }

  async updateTopic(req, res, next) {
    try {
      const updated = await topicService.updateTopic(req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async deleteTopic(req, res, next) {
    try {
      await topicService.deleteTopic(req.params.id);
      res.json({ success: true, message: 'Topic deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  async updateProgress(req, res, next) {
    try {
      const updated = await topicService.updateTopicProgress(req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TopicController();
