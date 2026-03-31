const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');

// GET /api/dashboard - NGO dashboard stats
router.get('/', getDashboardStats);

module.exports = router;
