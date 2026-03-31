/**
 * ManoSetu - Auth Middleware (Mongoose)
 */

const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const token = req.headers['x-session-token'];

    if (!token) {
      // Allow anonymous context
      req.user = { id: 'anonymous', ageGroup: 'teens' };
      return next();
    }

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
