/**
 * ManoSetu - Chat Controller (Mongoose)
 */

const Message = require('../models/Message');

const AI_RESPONSES = [
  "I hear you 💙 Can you tell me more about what's been feeling heavy?",
  "Let's try a quick breathing exercise — inhale for 4 counts, hold for 4, exhale for 6.",
  "You're doing so well by talking about this. Sometimes just naming what we feel helps.",
  "Thousands of young people feel exactly like you do right now. You are not alone.",
  "I'm here as long as you need. 🌸",
  "It takes courage to reach out. I'm glad you did.",
];

let aiResponseIndex = 0;

// POST /api/chat
const sendChatMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ success: false, error: 'Message cannot be empty.' });
    }

    const userId = req.user?.id || 'anonymous';

    // Insert user message
    await Message.create({
      userId,
      role: 'user',
      text: message.trim()
    });

    // Mock AI delay & response
    const aiText = AI_RESPONSES[aiResponseIndex % AI_RESPONSES.length];
    aiResponseIndex++;
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Insert AI response
    await Message.create({
      userId,
      role: 'ai',
      text: aiText
    });

    res.json({ success: true, response: aiText });
  } catch (error) {
    next(error);
  }
};

// GET /api/chat/history
const getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id || 'anonymous';
    
    // Get last 50 messages
    const history = await Message.find({ userId })
      .select('role text createdAt -_id')
      .sort({ createdAt: 1 })
      .limit(50);
      
    // Map 'createdAt' to 'timestamp' for frontend compatibility
    const mappedHistory = history.map(h => ({
      role: h.role, text: h.text, timestamp: h.createdAt
    }));
      
    res.json({ success: true, history: mappedHistory });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendChatMessage, getChatHistory };
