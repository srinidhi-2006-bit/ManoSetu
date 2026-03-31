/**
 * ManoSetu - Auth Controller
 * Supports real MongoDB mode and in-memory MOCK_DB mode.
 */

const crypto = require('crypto');

// ── Shared in-memory store ──────────────────────────────────────────────────
const MOCK = process.env.MOCK_DB === 'true';
const store = require('../config/store');

function mockFindByUsername(username) {
  return store.users.get(username.trim().toLowerCase()) || null;
}

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { username, password, ageGroup, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required.' });
    }

    const safeUsername = username.trim();
    const token = crypto.randomBytes(32).toString('hex');

    if (MOCK) {
      const key = safeUsername.toLowerCase();
      if (store.users.has(key)) {
        return res.status(409).json({ success: false, error: 'That username is already taken. Try another!' });
      }
      const user = {
        _id: crypto.randomBytes(8).toString('hex'),
        username: safeUsername,
        password,
        ageGroup: ageGroup || 'teens',
        role: role || 'user',
        token,
        registeredAt: new Date(),
      };
      store.users.set(key, user);
      // Record a session event
      store.sessionEvents.push({ userId: user._id, ts: new Date() });
      return res.status(201).json({
        success: true,
        message: 'Welcome to ManoSetu!',
        user: { id: user._id, username: user.username, ageGroup: user.ageGroup, role: user.role },
        token,
      });
    }

    // ── Real DB path ──
    const User = require('../models/User');
    const existing = await User.findOne({ username: safeUsername });
    if (existing) {
      return res.status(409).json({ success: false, error: 'That username is already taken. Try another!' });
    }
    const user = await User.create({ username: safeUsername, password, ageGroup: ageGroup || 'teens', role: role || 'user', token });
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

    const newToken = crypto.randomBytes(32).toString('hex');

    if (MOCK) {
      const user = mockFindByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ success: false, error: 'Invalid username or password.' });
      }
      user.token = newToken;
      // Record a session event on each login
      store.sessionEvents.push({ userId: user._id, ts: new Date() });
      return res.json({
        success: true,
        message: 'Welcome back!',
        user: { id: user._id, username: user.username, ageGroup: user.ageGroup, role: user.role },
        token: newToken,
      });
    }

    // ── Real DB path ──
    const User = require('../models/User');
    const user = await User.findOne({ username: username.trim(), password });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid username or password.' });
    }
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

