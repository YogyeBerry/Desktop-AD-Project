const studySessionService = require('../services/studySessionService');

class StudySessionController {
  async getSessionsByTopic(req, res, next) {
    try {
      const sessions = await studySessionService.getSessionsByTopic(req.params.id);
      res.json({ success: true, data: sessions });
    } catch (err) {
      next(err);
    }
  }

  async getAllSessions(req, res, next) {
    try {
      const sessions = await studySessionService.getAllSessions();
      res.json({ success: true, data: sessions });
    } catch (err) {
      next(err);
    }
  }

  async createSession(req, res, next) {
    try {
      const session = await studySessionService.createSession(req.params.id, req.body);
      res.status(201).json({ success: true, data: session });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new StudySessionController();
