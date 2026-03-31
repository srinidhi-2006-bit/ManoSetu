/**
 * ManoSetu - Auth Middleware (Mongoose)
 */

const User = require('../models/User');

const IS_MOCK = process.env.MOCK_DB === 'true';
const store = require('../config/store');

const protect = async (req, res, next) => {
  try {
    const token = req.headers['x-session-token'];

    if (!token) {
      // Allow anonymous context
      req.user = { id: 'anonymous', ageGroup: 'teens' };
      return next();
    }

    if (IS_MOCK) {
      // Find user by token in the shared store
      const user = Array.from(store.users.values()).find(u => u.token === token);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid or expired session token.' });
      }
      req.user = { id: user._id, username: user.username, ageGroup: user.ageGroup };
      return next();
    }

    // ── Real DB path ──
    const User = require('../models/User');
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired session token.' });
    }

    req.user = { id: user._id.toString(), username: user.username, ageGroup: user.ageGroup };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, error: 'Authentication failed.' });
  }
};

module.exports = { protect };
