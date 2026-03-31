const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, required: true },
  location: { type: String, default: 'Unknown' },
  status: { type: String, default: 'ACTIVE', enum: ['ACTIVE', 'RESOLVED'] },
  resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('SosAlert', sosAlertSchema);
