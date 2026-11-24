const express = require('express');
const router = express.Router();
const studySessionController = require('../controllers/studySessionController');

router.get('/', studySessionController.getAllSessions);

module.exports = router;
