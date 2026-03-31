/**
 * ManoSetu - SOS Controller (Mongoose)
 */

const SosAlert = require('../models/SosAlert');

// POST /api/sos
const triggerSOS = async (req, res, next) => {
  try {
    const { type, location } = req.body;
    const userId = req.user?.id || 'anonymous';

    const validTypes = ['AI_SUPPORT', 'HELPLINE', 'NGO_ALERT', 'GENERAL_PANIC'];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({ success: false, error: 'Invalid SOS type.' });
    }

    const alert = await SosAlert.create({
      userId,
      type,
      location: location || 'Unknown',
      status: 'ACTIVE'
    });

    console.log(`🚨 SOS ALERT [${type}] from user: ${userId}`);

    res.json({
      success: true,
      message: 'Your alert has been received. Help is on the way.',
      alertId: alert._id,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/sos/alerts
const getAllAlerts = async (req, res, next) => {
  try {
    const activeAlerts = await SosAlert.find({ status: 'ACTIVE' }).sort({ createdAt: -1 });
    
    const mapped = activeAlerts.map(a => ({
      id: a._id,
      userId: a.userId,
      type: a.type,
      status: a.status,
      timestamp: a.createdAt
    }));

    res.json({ success: true, count: mapped.length, alerts: mapped });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/sos/alerts/:id/resolve
const resolveAlert = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    const result = await SosAlert.findByIdAndUpdate(
      id,
      { status: 'RESOLVED', resolvedAt: new Date() }
    );

    if (!result) {
      return res.status(404).json({ success: false, error: 'Alert not found.' });
    }

    res.json({ success: true, message: 'Alert resolved.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { triggerSOS, getAllAlerts, resolveAlert };
