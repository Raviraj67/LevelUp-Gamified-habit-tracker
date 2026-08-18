const mongoose = require('mongoose');
const { InMemoryUser, InMemoryQuest } = require('./inMemoryStore');

// Disable Mongoose global command buffering so operations fail fast / switch immediately
mongoose.set('bufferCommands', false);

let isMongoConnected = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/levelup';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongoConnected = true;
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    isMongoConnected = false;
    console.log(`[Database Notice] MongoDB instance offline (${error.message}).`);
    console.log(`[Database Notice] LevelUp is operating in Zero-Latency In-Memory Database Mode.`);
  }
};

const getUserModel = () => {
  if (isMongoConnected && mongoose.connection.readyState === 1) {
    return require('../models/User');
  }
  return InMemoryUser;
};

const getQuestModel = () => {
  if (isMongoConnected && mongoose.connection.readyState === 1) {
    return require('../models/Quest');
  }
  return InMemoryQuest;
};

module.exports = connectDB;
module.exports.getUserModel = getUserModel;
module.exports.getQuestModel = getQuestModel;
module.exports.isMongoConnected = () => isMongoConnected && mongoose.connection.readyState === 1;
