const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/summary', analyticsController.getSummary);
router.get('/weekly', analyticsController.getWeekly);
router.get('/paths', analyticsController.getPathsAnalytics);
router.get('/topics', analyticsController.getTopicsAnalytics);

module.exports = router;
