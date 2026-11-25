const streakService = require('../services/streakService');

async function handleGetSummary(req, res) {
  try {
    const clientToday = req.query.today;
    const summary = await streakService.getStreakSummary(clientToday);
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    console.error('Error fetching streak summary:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch streak summary' });
  }
}

module.exports = {
  handleGetSummary,
};
