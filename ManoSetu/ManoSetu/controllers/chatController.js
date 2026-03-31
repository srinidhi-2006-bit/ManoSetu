/**
 * ManoSetu - Chat Controller (Mongoose)
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Message = require('../models/Message');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemPrompt = `You are the ManoSetu AI companion, a supportive, warm, and highly empathetic assistant strictly designed for children, teens, and young adults. 
Your primary goal is to provide a safe listening ear, validate feelings, and offer brief, actionable advice like breathing exercises or grounding techniques. 
Keep your responses relatively short, conversational, easy to read, and use friendly emojis. 
CRITICAL: If a user ever expresses severe distress, self-harm, or abuse, you MUST gently urge them to use the SOS button on the dashboard immediately and speak to a trusted adult or professional.`;

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: systemPrompt
});

// POST /api/chat
const sendChatMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ success: false, error: 'Message cannot be empty.' });
    }

    const userId = req.user?.id || 'anonymous';

    // 1. Get previous messages for conversation context (limit 12 to save tokens)
    const previousMessages = await Message.find({ userId })
      .sort({ createdAt: 1 })
      .limit(10);

    const formattedHistory = previousMessages.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    // 2. Save new user message
    await Message.create({
      userId,
      role: 'user',
      text: message.trim()
    });

    // 3. Send context and new message to Gemini
    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(message.trim());
    const aiText = result.response.text();

    // 4. Save AI response
    await Message.create({
      userId,
      role: 'ai',
      text: aiText
    });

    res.json({ success: true, response: aiText });
  } catch (error) {
    console.error("Chatbot API Error:", error.message);
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
