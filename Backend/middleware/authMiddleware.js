const jwt = require('jsonwebtoken');
const { getUserModel } = require('../config/db');

/**
 * Protect routes by verifying the JWT from the Authorization header.
 * Attaches the authenticated user (without password) to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      const User = getUserModel();
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'levelup_super_secret_jwt_key_2026');

      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized — user not found' });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized — invalid token' });
    }
  }

  return res.status(401).json({ message: 'Not authorized — no token provided' });
};

module.exports = { protect };
