const express = require('express');
const router = express.Router();
const { triggerSOS, getAllAlerts, resolveAlert } = require('../controllers/sosController');
const { protect } = require('../middleware/auth');

// POST /api/sos - Trigger a crisis alert
router.post('/', protect, triggerSOS);

// GET /api/sos/alerts - Get all active alerts (NGO dashboard)
router.get('/alerts', getAllAlerts);

// PATCH /api/sos/alerts/:id/resolve - Resolve an alert
router.patch('/alerts/:id/resolve', resolveAlert);

module.exports = router;
