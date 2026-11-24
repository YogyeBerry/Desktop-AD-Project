const pathService = require('../services/pathService');

class PathController {
  async getAllPaths(req, res, next) {
    try {
      const paths = await pathService.getAllPaths();
      res.json({ success: true, data: paths });
    } catch (err) {
      next(err);
    }
  }

  async getPathById(req, res, next) {
    try {
      const path = await pathService.getPathById(req.params.id);
      if (!path) {
        return res.status(404).json({ success: false, error: 'Learning path not found' });
      }
      res.json({ success: true, data: path });
    } catch (err) {
      next(err);
    }
  }

  async createPath(req, res, next) {
    try {
      const newPath = await pathService.createPath(req.body);
      res.status(201).json({ success: true, data: newPath });
    } catch (err) {
      next(err);
    }
  }

  async updatePath(req, res, next) {
    try {
      const updated = await pathService.updatePath(req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async deletePath(req, res, next) {
    try {
      await pathService.deletePath(req.params.id);
      res.json({ success: true, message: 'Learning path deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PathController();
