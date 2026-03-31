const express = require('express');
const router = express.Router();
const Journal = require('../models/Journal');
const { protect } = require('../middleware/auth');

// Create journal entry
router.post('/', protect, async (req, res) => {
    try {
        const { content } = req.body;
        const entry = new Journal({ userId: req.user.id, content });
        await entry.save();
        res.json({ success: true, entry });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
