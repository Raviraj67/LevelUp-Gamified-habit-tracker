const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('dns');

// Set public Google DNS servers to resolve MongoDB Atlas SRV records reliably
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

connectDB();

const app = express();

// CORS configured for local dev and Vercel deployment (via CLIENT_URL env var).
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LevelUp API is running' });
});

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize Socket.io Server
const { Server } = require('socket.io');
const { initLeaderboardSocket } = require('./sockets/leaderboardSocket');

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initLeaderboardSocket(io);

// Mount API routes
app.use('/api/quests', require('./routes/questRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));


// Initialize Daily Reset Cron Job
const startDailyResetJob = require('./jobs/dailyReset');
startDailyResetJob();

module.exports = { app, server };


