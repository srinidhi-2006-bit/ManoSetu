/**
 * ManoSetu - Chat Controller
 * Activated with Google Gemini AI
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Message = require('../models/Message');
const store = require('../config/store');

const IS_MOCK = process.env.MOCK_DB === 'true';

// Initialize Gemini with safety check
let genAI;
try {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  console.log(`DEBUG: Initializing Gemini with key length: ${key.length}`);
  if (key) {
    genAI = new GoogleGenerativeAI(key);
  }
} catch (e) {
  console.error("CRITICAL: Failed to initialize Gemini SDK:", e);
}


const SYSTEM_PROMPTS = {
  kids: `You are 'Voice Buddy', a magical, friendly animal friend for children (ages 5-12). 
         Keep your language very simple, warm, and encouraging. Use many emojis (🧸, 🌈, 🎈, 🍭). 
         If a child is sad, offer a digital hug. If they are angry, suggest 3 deep breaths. 
         Keep responses short (1-3 sentences).`,
         
  teens: `You are 'ManoSetu Mentor', a cool, empathetic, and non-judgmental AI for teenagers (ages 13-19). 
          Use slightly casual but respectfull language. Use terms like 'valid', 'vibe', 'rough'. 
          Focus on academic stress, peer pressure, and social identity. 
          Encourage them without being 'preachy'. Use emojis sparingly (🎧, 🌱, 💙).`,
          
  adults: `You are 'ManoSetu Professional', a calm, supportive mindfulness guide for young adults and parents. 
           Focus on clarity, work-life balance, and constructive coping mechanisms. 
           Reference mindfulness, boundary setting, and self-care. 
           Professional but warm tone (🧘, 🌿, ✨).`
};

// POST /api/chat
const sendChatMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required.' });
    }

    if (!genAI) {
      return res.status(500).json({ success: false, error: 'AI SDK not initialized. Check GEMINI_API_KEY.' });
    }

    const userId = req.user?.id || 'anonymous';
    const ageGroup = req.user?.ageGroup || 'teens';
    const sysPrompt = SYSTEM_PROMPTS[ageGroup] || SYSTEM_PROMPTS.teens;

    // 1. Get Gemini Response with Fallback
    let aiText = '';
    try {
      console.log(`Using AI Model: gemini-1.5-flash-latest for ${ageGroup}`);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash-latest",
        systemInstruction: sysPrompt
      });
      const result = await model.generateContent(message);
      aiText = result.response.text().trim();
    } catch (e) {
      console.warn("Gemini 1.5 Flash failed, falling back to Gemini Pro...", e.message);
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(sysPrompt + "\n\nUser: " + message);
        aiText = result.response.text().trim();
      } catch (e2) {
        throw new Error("All AI models failed: " + e2.message);
      }
    }

    // 2. Save to DB or Store
    if (IS_MOCK) {
      store.messages.push({ userId, role: 'user', text: message, ts: new Date() });
      store.messages.push({ userId, role: 'ai', text: aiText, ts: new Date() });
    } else {
      await Message.create({ userId, role: 'user', text: message });
      await Message.create({ userId, role: 'ai', text: aiText });
    }

    res.json({ success: true, response: aiText });
  } catch (error) {
    console.error('Gemini Execution Error:', error);
    res.status(500).json({ 
        success: false, 
        error: error.message || 'AI service error',
        details: error.toString(),
        hint: "Check API Key billing/quota or model availability."
    });
  }
};




// GET /api/chat/history
const getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id || 'anonymous';
    
    if (IS_MOCK) {
      const history = store.messages
        .filter(m => m.userId === userId)
        .map(m => ({ role: m.role, text: m.text, timestamp: m.ts }));
      return res.json({ success: true, history });
    }

    const history = await Message.find({ userId })
      .select('role text createdAt -_id')
      .sort({ createdAt: 1 })
      .limit(50);
      
    const mappedHistory = history.map(h => ({
      role: h.role, text: h.text, timestamp: h.createdAt
    }));
      
    res.json({ success: true, history: mappedHistory });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendChatMessage, getChatHistory };

