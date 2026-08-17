const User = require('../models/User');

let io = null;

/**
 * Fetches the top 20 users by cumulative XP to broadcast to connected clients.
 */
const getLeaderboardData = async () => {
  return await User.find({})
    .select('username xp level currentStreak longestStreak')
    .sort({ xp: -1 })
    .limit(20);
};

/**
 * Initialize leaderboard socket behavior
 * @param {Server} ioInstance - Socket.io Server instance
 */
const initLeaderboardSocket = (ioInstance) => {
  io = ioInstance;

  io.on('connection', async (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Send latest leaderboard state to the connecting client immediately
    try {
      const data = await getLeaderboardData();
      socket.emit('leaderboardUpdate', data);
    } catch (err) {
      console.error('Error sending initial leaderboard data:', err.message);
    }

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

/**
 * Broadcasts the updated leaderboard to all connected clients
 */
const emitLeaderboardUpdate = async () => {
  if (!io) {
    console.warn('Socket.io instance is not initialized yet.');
    return;
  }
  try {
    const data = await getLeaderboardData();
    io.emit('leaderboardUpdate', data);
  } catch (err) {
    console.error('Error broadcasting leaderboard update:', err.message);
  }
};

module.exports = {
  initLeaderboardSocket,
  emitLeaderboardUpdate,
};
