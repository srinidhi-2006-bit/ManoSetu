/**
 * ManoSetu - Mood Controller
 * Supports real MongoDB mode and in-memory MOCK_DB mode.
 */

const MOCK = process.env.MOCK_DB === 'true';
const store = require('../config/store');
const crypto = require('crypto');

// POST /api/mood
const logMood = async (req, res, next) => {
  try {
    const { mood, notes } = req.body;
    if (!mood) return res.status(400).json({ success: false, error: 'Mood is required.' });

    const userId = req.user?.id || 'anonymous';

    if (MOCK) {
      const entry = { id: crypto.randomBytes(6).toString('hex'), userId, mood, notes: notes || '', ts: new Date() };
      store.moodLogs.push(entry);
      store.sessionEvents.push({ userId, ts: new Date() });
      return res.status(201).json({ success: true, message: 'Mood logged successfully.', entryId: entry.id });
    }

    const MoodLog = require('../models/MoodLog');
    const result = await MoodLog.create({ userId, mood, notes: notes ? String(notes).slice(0, 500) : '' });
    res.status(201).json({ success: true, message: 'Mood logged successfully.', entryId: result._id });
  } catch (error) { next(error); }
};

// GET /api/mood/history
const getMoodHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id || 'anonymous';

    if (MOCK) {
      const logs = store.moodLogs
        .filter(l => l.userId === userId)
        .sort((a, b) => new Date(b.ts) - new Date(a.ts))
        .slice(0, 30)
        .map(l => ({ id: l.id, mood: l.mood, notes: l.notes, timestamp: l.ts }));
      return res.json({ success: true, count: logs.length, logs });
    }

    const MoodLog = require('../models/MoodLog');
    const logs = await MoodLog.find({ userId }).sort({ createdAt: -1 }).limit(30);
    const mappedLogs = logs.map(l => ({ id: l._id, mood: l.mood, notes: l.notes, timestamp: l.createdAt }));
    res.json({ success: true, count: mappedLogs.length, logs: mappedLogs });
  } catch (error) { next(error); }
};

// GET /api/mood/streak
const getMoodStreak = async (req, res, next) => {
  try {
    const userId = req.user?.id || 'anonymous';

    if (MOCK) {
      const days = new Set(
        store.moodLogs.filter(l => l.userId === userId).map(l => new Date(l.ts).toISOString().split('T')[0])
      );
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        if (days.has(d.toISOString().split('T')[0])) streak++;
        else if (i > 0) break;
      }
      return res.json({ success: true, streak });
    }

    const MoodLog = require('../models/MoodLog');
    const logs = await MoodLog.find({ userId }).sort({ createdAt: -1 });
    const days = new Set(logs.map(l => l.createdAt.toISOString().split('T')[0]));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      if (days.has(d.toISOString().split('T')[0])) streak++;
      else if (i > 0) break;
    }
    res.json({ success: true, streak });
  } catch (error) { next(error); }
};

module.exports = { logMood, getMoodHistory, getMoodStreak };

