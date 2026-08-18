const jwt = require('jsonwebtoken');
const { getUserModel } = require('../config/db');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'levelup_super_secret_jwt_key_2026', {
    expiresIn: '30d',
  });
};

/** Shape the user object returned to the client (never include password). */
const formatUserResponse = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  xp: user.xp,
  level: user.level,
  currentStreak: user.currentStreak,
  longestStreak: user.longestStreak,
  lastQuestCompletedDate: user.lastQuestCompletedDate,
});

/**
 * POST /api/auth/signup
 * Register a new user and return a JWT.
 */
const signup = async (req, res) => {
  try {
    const User = getUserModel();
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'Please provide username, email, and password',
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      const field =
        existingUser.email === email.toLowerCase() ? 'Email' : 'Username';
      return res.status(400).json({ message: `${field} already in use` });
    }

    const user = await User.create({ username, email, password });

    res.status(201).json({
      ...formatUserResponse(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Username or email already in use' });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/auth/login
 * Authenticate credentials and return a JWT.
 */
const login = async (req, res) => {
  try {
    const User = getUserModel();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      ...formatUserResponse(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/auth/me
 * Return the currently authenticated user (protected route).
 */
const getMe = async (req, res) => {
  res.json(formatUserResponse(req.user));
};

module.exports = {
  signup,
  login,
  getMe,
};
