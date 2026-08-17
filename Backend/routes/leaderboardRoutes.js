const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/leaderboardController');

// Public route to view top rankings
router.get('/', getLeaderboard);

module.exports = router;
