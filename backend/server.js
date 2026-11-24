const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./src/routes');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SkillPath API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', apiRoutes);

// Centralized error handler
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`SkillPath server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
