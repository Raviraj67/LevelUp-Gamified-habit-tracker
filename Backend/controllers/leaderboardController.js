const { getUserModel } = require('../config/db');

/**
 * @route   GET /api/leaderboard
 * @desc    Get top 20 users by XP (leaderboard)
 * @access  Public
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const User = getUserModel();
    const users = await User.find({})
      .select('username xp level currentStreak longestStreak')
      .sort({ xp: -1 })
      .limit(20);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching leaderboard', error: error.message });
  }
};
