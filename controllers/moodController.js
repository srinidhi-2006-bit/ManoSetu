/**
 * ManoSetu - Mood Controller (Mongoose)
 */

const MoodLog = require('../models/MoodLog');

// POST /api/mood
const logMood = async (req, res, next) => {
  try {
    const { mood, notes } = req.body;

    if (!mood) {
      return res.status(400).json({ success: false, error: 'Mood is required.' });
    }

    const userId = req.user?.id || 'anonymous';

    const result = await MoodLog.create({
      userId,
      mood,
      notes: notes ? String(notes).slice(0, 500) : ''
    });

    res.status(201).json({ 
      success: true, 
      message: 'Mood logged successfully.', 
      entryId: result._id 
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/mood/history
const getMoodHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id || 'anonymous';
    
    const logs = await MoodLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(30);

    // Map `createdAt` to `timestamp`
    const mappedLogs = logs.map(l => ({
      id: l._id,
      mood: l.mood,
      notes: l.notes,
      timestamp: l.createdAt
    }));

    res.json({ success: true, count: mappedLogs.length, logs: mappedLogs });
  } catch (error) {
    next(error);
  }
};

// GET /api/mood/streak
const getMoodStreak = async (req, res, next) => {
  try {
    const userId = req.user?.id || 'anonymous';
    
    const logs = await MoodLog.find({ userId }).sort({ createdAt: -1 });

    const days = new Set(logs.map((l) => l.createdAt.toISOString().split('T')[0]));
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (days.has(key)) streak++;
      else if (i > 0) break; 
    }

    res.json({ success: true, streak });
  } catch (error) {
    next(error);
  }
};

module.exports = { logMood, getMoodHistory, getMoodStreak };
