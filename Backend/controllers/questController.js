const { getUserModel, getQuestModel } = require('../config/db');
const { emitLeaderboardUpdate } = require('../sockets/leaderboardSocket');

// Helper: Date normalization for streak calculations
const isSameDay = (d1, d2) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const isYesterday = (d1, d2) => {
  const yesterday = new Date(d2);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(d1, yesterday);
};

// @route   GET /api/quests
// @desc    Get user's quests for today
exports.getQuests = async (req, res) => {
  try {
    const Quest = getQuestModel();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const quests = await Quest.find({
      userId: req.user._id,
      createdAt: { $gte: startOfDay },
    });

    res.status(200).json(quests);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching quests', error: error.message });
  }
};

// @route   POST /api/quests
// @desc    Create a new quest
exports.createQuest = async (req, res) => {
  try {
    const Quest = getQuestModel();
    const { title, difficulty } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const quest = await Quest.create({
      userId: req.user._id,
      title,
      difficulty,
    });

    res.status(201).json(quest);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating quest', error: error.message });
  }
};

// @route   PATCH /api/quests/:id/complete
// @desc    Complete quest, award XP, update level and streak
exports.completeQuest = async (req, res) => {
  try {
    const Quest = getQuestModel();
    const User = getUserModel();

    const quest = await Quest.findOne({ _id: req.params.id, userId: req.user._id });

    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    if (quest.completed) {
      return res.status(400).json({ message: 'Quest is already completed' });
    }

    quest.completed = true;
    await quest.save();

    const user = await User.findById(req.user._id);

    // 1. Award XP and check level scaling (Level N requires N * 100 cumulative XP)
    user.xp += quest.xpValue;
    const calculatedLevel = Math.floor(user.xp / 100) + 1;
    const leveledUp = calculatedLevel > user.level;
    user.level = calculatedLevel;

    // 2. Streak Math
    const now = new Date();
    const lastDate = user.lastQuestCompletedDate ? new Date(user.lastQuestCompletedDate) : null;

    if (!lastDate) {
      user.currentStreak = 1;
    } else if (isYesterday(lastDate, now)) {
      user.currentStreak += 1;
    } else if (!isSameDay(lastDate, now)) {
      user.currentStreak = 1;
    }

    user.longestStreak = Math.max(user.longestStreak || 0, user.currentStreak);
    user.lastQuestCompletedDate = now;

    await user.save();

    // Trigger real-time leaderboard update broadcast
    emitLeaderboardUpdate();

    res.status(200).json({
      message: 'Quest completed successfully',
      quest,
      userProgress: {
        xp: user.xp,
        level: user.level,
        leveledUp,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error completing quest', error: error.message });
  }
};

// @route   DELETE /api/quests/:id
// @desc    Delete a quest
exports.deleteQuest = async (req, res) => {
  try {
    const Quest = getQuestModel();
    const quest = await Quest.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    res.status(200).json({ message: 'Quest deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting quest', error: error.message });
  }
};