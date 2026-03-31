/**
 * ManoSetu - Dashboard Controller
 * Supports real MongoDB mode and in-memory MOCK_DB mode.
 * All statistics start at 0 and only reflect actual user activity.
 */

const MOCK = process.env.MOCK_DB === 'true';
const store = require('../config/store');

// Helper: mood → numeric wellbeing score
const MOOD_SCORES = {
  'Very Happy': 100,
  'Happy': 75,
  'Neutral': 50,
  'Sad': 25,
  'Angry': 20,
};

// GET /api/dashboard/volunteer  (volunteer-facing stats)
const getVolunteerStats = (req, res) => {
  if (!MOCK) {
    return res.status(503).json({ success: false, error: 'Real DB mode not yet implemented for this endpoint.' });
  }

  const now = new Date();

  // ── Basic counts ───────────────────────────────────────────────────────────
  const allUsers       = Array.from(store.users.values());
  const youthCount     = allUsers.filter(u => u.role === 'user').length;
  const volunteerCount = allUsers.filter(u => u.role === 'volunteer').length;

  // SOS / Alerts
  const activeSOS      = store.sosAlerts.filter(a => a.status === 'ACTIVE').length;
  const totalSOS       = store.sosAlerts.length;

  // Mood logs
  const moodLogs       = store.moodLogs;
  const totalMoodLogs  = moodLogs.length;

  // ── Wellbeing index (average score of all mood logs, 0 if none) ────────────
  let wellbeingIndex = 0;
  if (totalMoodLogs > 0) {
    const total = moodLogs.reduce((acc, l) => acc + (MOOD_SCORES[l.mood] || 50), 0);
    wellbeingIndex = Math.round(total / totalMoodLogs);
  }

  // ── Mood distribution ──────────────────────────────────────────────────────
  const moodDistribution = {};
  moodLogs.forEach(l => {
    moodDistribution[l.mood] = (moodDistribution[l.mood] || 0) + 1;
  });

  // ── Wellbeing trend: last 30 days (daily avg score) ───────────────────────
  const trend = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const dateStr = day.toISOString().split('T')[0];

    const dayLogs = moodLogs.filter(l => {
      const d = new Date(l.ts);
      return d.toISOString().split('T')[0] === dateStr;
    });

    const avgScore = dayLogs.length > 0
      ? Math.round(dayLogs.reduce((s, l) => s + (MOOD_SCORES[l.mood] || 50), 0) / dayLogs.length)
      : null;

    trend.push({ date: dateStr, score: avgScore, sessions: dayLogs.length });
  }

  // ── Weekly session trend (last 7 days, for bar chart) ─────────────────────
  const weeklyTrend = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const dateStr = day.toISOString().split('T')[0];

    const count = store.sessionEvents.filter(e => {
      return new Date(e.ts).toISOString().split('T')[0] === dateStr;
    }).length;

    weeklyTrend.push({ label: days[day.getDay()], count });
  }

  // ── Recent alerts ──────────────────────────────────────────────────────────
  const recentAlerts = store.sosAlerts
    .slice()
    .sort((a, b) => new Date(b.ts) - new Date(a.ts))
    .slice(0, 5)
    .map(a => ({
      id: a.id,
      userId: a.userId,
      type: a.type,
      status: a.status,
      timestamp: a.ts,
    }));

  res.json({
    success: true,
    stats: {
      youthImpacted:   youthCount,
      highRiskCases:   totalSOS,          // Every SOS = high-risk case
      activeAlerts:    activeSOS,
      wellbeingIndex,
      totalMoodLogs,
      volunteerCount,
    },
    moodDistribution,
    trend,           // 30-day
    weeklyTrend,     // 7-day bar chart
    recentAlerts,
  });
};

// Legacy endpoint (keep for doctor dashboard)
const getDashboardStats = (req, res) => {
  if (MOCK) {
    const allUsers = Array.from(store.users.values());
    return res.json({
      success: true,
      stats: {
        activeUsers:           allUsers.filter(u => u.role === 'user').length,
        averageWellbeingScore: 0,
        highRisk:              store.sosAlerts.filter(a => a.status === 'ACTIVE').length,
        watchList:             0,
        activeSOS:             store.sosAlerts.filter(a => a.status === 'ACTIVE').length,
        totalMessages:         store.messages.length,
        totalMoodLogs:         store.moodLogs.length,
      },
      moodDistribution: {},
      weeklyTrend: [],
      recentAlerts: [],
    });
  }

  // Real DB path
  const Message  = require('../models/Message');
  const MoodLog  = require('../models/MoodLog');
  const SosAlert = require('../models/SosAlert');

  Promise.all([
    Message.countDocuments(),
    MoodLog.countDocuments(),
    SosAlert.countDocuments({ status: 'ACTIVE' }),
  ]).then(([totalMessages, totalMoodLogs, activeSOS]) => {
    res.json({
      success: true,
      stats: { activeUsers: 0, averageWellbeingScore: 0, highRisk: 0, watchList: 0, activeSOS, totalMessages, totalMoodLogs },
      moodDistribution: {},
      weeklyTrend: [],
      recentAlerts: [],
    });
  }).catch(err => res.status(500).json({ success: false, error: err.message }));
};

module.exports = { getDashboardStats, getVolunteerStats };

