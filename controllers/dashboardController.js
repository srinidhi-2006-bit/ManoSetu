/**
 * ManoSetu - Dashboard Controller (Mongoose)
 */

const Message = require('../models/Message');
const MoodLog = require('../models/MoodLog');
const SosAlert = require('../models/SosAlert');

// GET /api/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    // Total messages
    const totalMessages = await Message.countDocuments();
    
    // Total mood logs
    const totalMoodLogs = await MoodLog.countDocuments();
    
    // Active SOS alerts
    const activeSOS = await SosAlert.countDocuments({ status: 'ACTIVE' });

    // Mood distribution
    const moodRows = await MoodLog.aggregate([
      { $group: { _id: '$mood', count: { $sum: 1 } } }
    ]);
    const moodDistribution = {};
    moodRows.forEach(row => {
      moodDistribution[row._id] = row.count;
    });

    // Weekly trend (Sessions / Moods logged per day in the last 7 days)
    const weeklyTrend = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const count = await MoodLog.countDocuments({
        createdAt: { $gte: startOfDay, $lt: endOfDay }
      });
      
      weeklyTrend.push({ date: startOfDay.toISOString().split('T')[0], sessions: count });
    }

    // Recent SOS alerts (last 5)
    const recentAlertsRaw = await SosAlert.find().sort({ createdAt: -1 }).limit(5);
    const recentAlerts = recentAlertsRaw.map(a => ({
        id: a._id,
        userId: a.userId,
        type: a.type,
        status: a.status,
        timestamp: a.createdAt
    }));

    res.json({
      success: true,
      stats: {
        activeUsers: 12480, // Static demo figure
        averageWellbeingScore: 74, // Static demo figure
        highRisk: 23, // Static demo figure
        watchList: 147, // Static demo figure
        activeSOS,
        totalMessages,
        totalMoodLogs,
      },
      moodDistribution,
      weeklyTrend,
      recentAlerts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
