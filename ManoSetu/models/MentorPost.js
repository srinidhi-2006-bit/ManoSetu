const mongoose = require('mongoose');

const mentorPostSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true }, // Anonymous nickname
  title: { type: String, required: true },
  content: { type: String, required: true },
  isResolved: { type: Boolean, default: false },
  answers: [{
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    mentorName: { type: String },
    text: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('MentorPost', mentorPostSchema);
