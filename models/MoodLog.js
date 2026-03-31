const mongoose = require('mongoose');

const moodLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  mood: { type: String, required: true },
  notes: { type: String, maxlength: 500 }
}, { timestamps: true });

module.exports = mongoose.model('MoodLog', moodLogSchema);
