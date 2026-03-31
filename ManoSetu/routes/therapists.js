const express = require('express');
const router = express.Router();
const { getTherapists, getTherapistById, bookSession } = require('../controllers/therapistController');
const { protect } = require('../middleware/auth');

// GET /api/therapists - List all therapists (supports ?tag= and ?search= query params)
router.get('/', getTherapists);

// GET /api/therapists/:id - Get a single therapist
router.get('/:id', getTherapistById);

// POST /api/therapists/:id/book - Book a session
router.post('/:id/book', protect, bookSession);

module.exports = router;
