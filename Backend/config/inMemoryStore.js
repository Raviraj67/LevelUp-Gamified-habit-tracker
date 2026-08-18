const bcrypt = require('bcryptjs');

/**
 * LevelUp — In-Memory Database Fallback Store
 *
 * Provides seamless 0-latency fallback operations for User and Quest models
 * when MongoDB is not connected locally or on Atlas. Ensures the application
 * is 100% working out of the box.
 */

let userIdCounter = 1000;
let questIdCounter = 5000;

const memoryUsers = [];
const memoryQuests = [];

// Seed demo users if empty
function seedDemoData() {
  if (memoryUsers.length === 0) {
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('password123', salt);

    const demoUsers = [
      { _id: 'user_1', username: 'Valkyrie', email: 'valkyrie@levelup.sys', password: demoPasswordHash, xp: 2450, level: 25, currentStreak: 14, longestStreak: 18, lastQuestCompletedDate: new Date(), createdAt: new Date() },
      { _id: 'user_2', username: 'Cypher', email: 'cypher@levelup.sys', password: demoPasswordHash, xp: 1920, level: 20, currentStreak: 9, longestStreak: 12, lastQuestCompletedDate: new Date(), createdAt: new Date() },
      { _id: 'user_3', username: 'ShadowKnight', email: 'shadow@levelup.sys', password: demoPasswordHash, xp: 1400, level: 15, currentStreak: 5, longestStreak: 7, lastQuestCompletedDate: new Date(), createdAt: new Date() },
    ];

    demoUsers.forEach((u) => {
      u.matchPassword = async function (entered) {
        return bcrypt.compare(entered, this.password);
      };
      u.save = async function () {
        return this;
      };
      memoryUsers.push(u);
    });
  }
}

seedDemoData();

const InMemoryUser = {
  async findOne(query) {
    seedDemoData();
    if (query.$or) {
      const [{ email }, { username }] = query.$or;
      return memoryUsers.find(
        (u) => (email && u.email.toLowerCase() === String(email).toLowerCase()) ||
               (username && u.username === username)
      ) || null;
    }
    if (query.email) {
      return memoryUsers.find((u) => u.email.toLowerCase() === String(query.email).toLowerCase()) || null;
    }
    if (query.username) {
      return memoryUsers.find((u) => u.username === query.username) || null;
    }
    return null;
  },

  async findById(id) {
    seedDemoData();
    const user = memoryUsers.find((u) => String(u._id) === String(id));
    if (!user) return null;
    return {
      ...user,
      select: function () { return this; },
      save: async function () {
        const idx = memoryUsers.findIndex((u) => String(u._id) === String(id));
        if (idx !== -1) memoryUsers[idx] = { ...memoryUsers[idx], ...this };
        return this;
      },
    };
  },

  async create({ username, email, password }) {
    seedDemoData();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      _id: `user_${++userIdCounter}`,
      username,
      email: email.toLowerCase(),
      password: passwordHash,
      xp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastQuestCompletedDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      matchPassword: async function (entered) {
        return bcrypt.compare(entered, this.password);
      },
      save: async function () {
        const idx = memoryUsers.findIndex((u) => String(u._id) === String(this._id));
        if (idx !== -1) memoryUsers[idx] = { ...memoryUsers[idx], ...this };
        return this;
      },
    };

    memoryUsers.push(newUser);
    return newUser;
  },

  find() {
    seedDemoData();
    const list = [...memoryUsers];
    const chainable = {
      select: () => chainable,
      sort: (sortObj) => {
        if (sortObj.xp === -1) list.sort((a, b) => b.xp - a.xp);
        return chainable;
      },
      limit: (n) => list.slice(0, n),
      then: (resolve) => resolve(list),
    };
    return chainable;
  },
};

const InMemoryQuest = {
  find(query) {
    const userQuests = memoryQuests.filter((q) => String(q.userId) === String(query.userId));
    const chainable = {
      sort: () => chainable,
      then: (resolve) => resolve(userQuests),
    };
    return chainable;
  },

  async create({ userId, title, difficulty }) {
    const xpMap = { easy: 10, medium: 25, hard: 50 };
    const xpValue = xpMap[difficulty] || 10;

    const newQuest = {
      _id: `quest_${++questIdCounter}`,
      userId,
      title,
      difficulty: difficulty || 'easy',
      xpValue,
      completed: false,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      save: async function () {
        const idx = memoryQuests.findIndex((q) => String(q._id) === String(this._id));
        if (idx !== -1) memoryQuests[idx] = { ...memoryQuests[idx], ...this };
        return this;
      },
    };

    memoryQuests.push(newQuest);
    return newQuest;
  },

  async findOne(query) {
    return memoryQuests.find(
      (q) => String(q._id) === String(query._id) && String(q.userId) === String(query.userId)
    ) || null;
  },

  async findOneAndDelete(query) {
    const idx = memoryQuests.findIndex(
      (q) => String(q._id) === String(query._id) && String(q.userId) === String(query.userId)
    );
    if (idx !== -1) {
      const deleted = memoryQuests[idx];
      memoryQuests.splice(idx, 1);
      return deleted;
    }
    return null;
  },
};

module.exports = {
  InMemoryUser,
  InMemoryQuest,
};
