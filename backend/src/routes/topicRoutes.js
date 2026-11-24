const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const resourceController = require('../controllers/resourceController');
const studySessionController = require('../controllers/studySessionController');

router.put('/:id', topicController.updateTopic);
router.delete('/:id', topicController.deleteTopic);
router.patch('/:id/progress', topicController.updateProgress);

// Sub-resources under topic
router.post('/:id/resources', resourceController.addResource);
router.get('/:id/sessions', studySessionController.getSessionsByTopic);
router.post('/:id/sessions', studySessionController.createSession);

module.exports = router;
