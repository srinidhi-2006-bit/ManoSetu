const express = require('express');
const router = express.Router();
const { sendChatMessage, getChatHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// POST /api/chat - Send a message to AI
router.post('/', protect, sendChatMessage);

// GET /api/chat/history - Get chat history for current user
router.get('/history', protect, getChatHistory);

module.exports = router;
