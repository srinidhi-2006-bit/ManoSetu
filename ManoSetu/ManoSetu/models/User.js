const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: false }, // Optional for under-15 privacy
  password: { type: String, required: true },
  ageGroup: { type: String, default: 'teens' },
  role: { type: String, default: 'user', enum: ['user', 'doctor', 'admin', 'guardian'] },
  token: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
