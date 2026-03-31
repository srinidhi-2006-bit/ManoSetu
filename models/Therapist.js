const mongoose = require('mongoose');

const thermostatSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  tags: { type: [String], required: true },
  rating: { type: Number, default: 4.5 },
  reviews: { type: Number, default: 0 },
  avatar: { type: String, default: '👨‍⚕️' }
});

module.exports = mongoose.model('Therapist', thermostatSchema);
