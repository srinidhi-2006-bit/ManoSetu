const express = require('express');
const router = express.Router();
const { logMood, getMoodHistory, getMoodStreak } = require('../controllers/moodController');
const { protect } = require('../middleware/auth');

// POST /api/mood - Log a mood entry
router.post('/', protect, logMood);

// GET /api/mood/history - Get mood history for current user
router.get('/history', protect, getMoodHistory);

// GET /api/mood/streak - Get current check-in streak
router.get('/streak', protect, getMoodStreak);

module.exports = router;
