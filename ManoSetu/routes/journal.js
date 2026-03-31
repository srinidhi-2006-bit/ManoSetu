const express = require('express');
const router = express.Router();
const Journal = require('../models/Journal');
const { protect } = require('../middleware/auth');
const store = require('../config/store');

const IS_MOCK = process.env.MOCK_DB === 'true';

// Create journal entry
router.post('/', protect, async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.user.id;

        if (IS_MOCK) {
            const entry = { userId, content, ts: new Date().toISOString() };
            store.journalEntries.push(entry);
            return res.json({ success: true, entry });
        }

        const entry = new Journal({ userId, content });
        await entry.save();
        res.json({ success: true, entry });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Get user's journal entries
router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user.id;

        if (IS_MOCK) {
            const entries = store.journalEntries.filter(e => e.userId === userId).reverse();
            return res.json({ success: true, entries });
        }

        const entries = await Journal.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, entries });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;

