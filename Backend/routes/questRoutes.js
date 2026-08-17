const express = require('express');
const router = express.Router();
const {
  getQuests,
  createQuest,
  completeQuest,
  deleteQuest,
} = require('../controllers/questController');
const { protect } = require('../middleware/authMiddleware');

// Secure all routes with JWT auth middleware
router.use(protect);

router.route('/')
  .get(getQuests)
  .post(createQuest);

router.patch('/:id/complete', completeQuest);
router.delete('/:id', deleteQuest);

module.exports = router;