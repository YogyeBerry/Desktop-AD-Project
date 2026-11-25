const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

router.post('/start', activityController.handleRecordStart);
router.get('/calendar', activityController.handleGetCalendar);

module.exports = router;
