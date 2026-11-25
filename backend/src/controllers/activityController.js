const activityService = require('../services/activityService');

async function handleRecordStart(req, res) {
  try {
    const { date } = req.body;
    const result = await activityService.recordTimerStart(date);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error recording timer start:', error);
    res.status(500).json({ error: 'Failed to record timer start' });
  }
}

async function handleGetCalendar(req, res) {
  try {
    const days = parseInt(req.query.days, 10) || 365;
    const result = await activityService.getRollingActivity(days);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error getting activity calendar:', error);
    res.status(500).json({ error: 'Failed to retrieve activity calendar' });
  }
}

module.exports = {
  handleRecordStart,
  handleGetCalendar,
};
