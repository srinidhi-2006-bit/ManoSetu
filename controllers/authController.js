/**
 * ManoSetu - Auth Controller (Mongoose)
 */

const crypto = require('crypto');
const User = require('../models/User');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { username, password, ageGroup, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required.' });
    }

    const safeUsername = username.trim();
    const existing = await User.findOne({ username: safeUsername });
    
    if (existing) {
      return res.status(409).json({ success: false, error: 'That username is already taken. Try another!' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    
    const user = await User.create({
      username: safeUsername,
      password: password, 
      ageGroup: ageGroup || 'teens',
      role: role || 'user',
      token
    });

    res.status(201).json({
      success: true,
      message: 'Welcome to ManoSetu!',
      user: { id: user._id, username: user.username, ageGroup: user.ageGroup, role: user.role },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required.' });
    }

    const user = await User.findOne({ username: username.trim(), password });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid username or password.' });
    }

    // Rotate token on login for better security
    const newToken = crypto.randomBytes(32).toString('hex');
    user.token = newToken;
    await user.save();

    res.json({
      success: true,
      message: 'Welcome back!',
      user: { id: user._id, username: user.username, ageGroup: user.ageGroup, role: user.role },
      token: newToken,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = (req, res) => {
  const user = req.user;
  if (!user || user.id === 'anonymous') {
    return res.json({ success: true, user: null, anonymous: true });
  }
  res.json({ success: true, user });
};

module.exports = { register, login, getMe };
