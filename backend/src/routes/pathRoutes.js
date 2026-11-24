const express = require('express');
const router = express.Router();
const pathController = require('../controllers/pathController');
const topicController = require('../controllers/topicController');

router.get('/', pathController.getAllPaths);
router.get('/:id', pathController.getPathById);
router.post('/', pathController.createPath);
router.put('/:id', pathController.updatePath);
router.delete('/:id', pathController.deletePath);

// Sub-resource: add topic to path
router.post('/:id/topics', topicController.addTopic);

module.exports = router;
