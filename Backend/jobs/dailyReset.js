const cron = require('node-cron');
const User = require('../models/User');
const { emitLeaderboardUpdate } = require('../sockets/leaderboardSocket');

/**
 * Checks and resets streaks for users who did not complete any quest the previous day.
 * Runs every day at midnight (00:00).
 */
const startDailyResetJob = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily streak reset job...');
    try {
      // "Yesterday" is the calendar day before today.
      // If lastQuestCompletedDate is less than the beginning of yesterday, they missed yesterday entirely.
      const startOfYesterday = new Date();
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      startOfYesterday.setHours(0, 0, 0, 0);

      // Find all users who have an active streak (currentStreak > 0)
      // but have either never completed a quest, or their last quest completion was before yesterday.
      const result = await User.updateMany(
        {
          currentStreak: { $gt: 0 },
          $or: [
            { lastQuestCompletedDate: null },
            { lastQuestCompletedDate: { $lt: startOfYesterday } },
          ],
        },
        {
          $set: { currentStreak: 0 },
        }
      );

      console.log(`Daily streak reset job complete. Reset ${result.modifiedCount} users.`);

      // Broadcast updated rankings to all active sockets if users' streaks were modified
      if (result.modifiedCount > 0) {
        await emitLeaderboardUpdate();
      }
    } catch (error) {
      console.error('Error in daily streak reset job:', error.message);
    }
  });

  console.log('Daily streak reset cron job initialized.');
};

module.exports = startDailyResetJob;
