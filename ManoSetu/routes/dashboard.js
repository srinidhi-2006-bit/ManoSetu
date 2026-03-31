const express = require('express');
const router = express.Router();
const { getDashboardStats, getVolunteerStats } = require('../controllers/dashboardController');

// GET /api/dashboard - legacy doctor dashboard stats
router.get('/', getDashboardStats);

// GET /api/dashboard/volunteer - live volunteer stats (all starting from 0)
router.get('/volunteer', getVolunteerStats);

module.exports = router;
