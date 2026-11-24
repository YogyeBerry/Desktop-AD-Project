const resourceService = require('../services/resourceService');

class ResourceController {
  async getAllResources(req, res, next) {
    try {
      const resources = await resourceService.getAllResources();
      res.json({ success: true, data: resources });
    } catch (err) {
      next(err);
    }
  }

  async addResource(req, res, next) {
    try {
      const resource = await resourceService.addResource(req.params.id, req.body);
      res.status(201).json({ success: true, data: resource });
    } catch (err) {
      next(err);
    }
  }

  async updateResource(req, res, next) {
    try {
      const updated = await resourceService.updateResource(req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async deleteResource(req, res, next) {
    try {
      await resourceService.deleteResource(req.params.id);
      res.json({ success: true, message: 'Resource deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  async importBatch(req, res, next) {
    try {
      const result = await resourceService.importBatch(req.body.resources || req.body);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ResourceController();
