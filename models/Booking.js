const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctorName: { type: String },
  date: { type: Date, required: true },
  sessionType: { 
    type: String, 
    enum: ['Stress', 'Anxiety', 'General Talk', 'Other'],
    default: 'General Talk'
  },
  status: { type: String, default: 'pending', enum: ['pending', 'scheduled', 'completed', 'cancelled'] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
