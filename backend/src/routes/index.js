const express = require('express');
const router = express.Router();

const pathRoutes = require('./pathRoutes');
const topicRoutes = require('./topicRoutes');
const resourceRoutes = require('./resourceRoutes');
const studySessionRoutes = require('./studySessionRoutes');
const analyticsRoutes = require('./analyticsRoutes');

router.use('/paths', pathRoutes);
router.use('/topics', topicRoutes);
router.use('/resources', resourceRoutes);
router.use('/sessions', studySessionRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
