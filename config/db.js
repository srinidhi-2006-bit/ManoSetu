/**
 * ManoSetu - MongoDB MongoDB Store (Mongoose)
 */

const mongoose = require('mongoose');
const Therapist = require('../models/Therapist');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/manosetu';

async function initDB() {
  try {
    mongoose.set('strictQuery', false);
    
    if(process.env.MOCK_DB === 'true') { console.log('⚠️ Running in MOCK DB MODE'); return; }
    await mongoose.connect(MONGO_URI);
    console.log(`\x1b[32m✅ MongoDB Connected: ${mongoose.connection.host}\x1b[0m`);

    // Seed Therapists if empty
    const count = await Therapist.countDocuments();
    if (count === 0) {
      await Therapist.insertMany([
        {
          name: 'Dr. Priya Sharma',
          specialization: 'Child & Adolescent Psychology',
          tags: ['Teens', 'Anxiety', 'CBT'],
          rating: 4.9,
          reviews: 127,
          avatar: '👩‍⚕️',
        },
        {
          name: 'Dr. Arjun Mehta',
          specialization: 'Cognitive Behavioral Therapy',
          tags: ['Depression', 'Stress', 'DBT'],
          rating: 4.8,
          reviews: 94,
          avatar: '👨‍⚕️',
        },
        {
          name: 'Dr. Meera Nair',
          specialization: 'Trauma & Family Therapy',
          tags: ['Trauma', 'Family', 'Hindi'],
          rating: 4.9,
          reviews: 203,
          avatar: '👩‍⚕️',
        }
      ]);
      console.log('✅ Seeded initial Therapists.');
    }
    
  } catch (error) {
    console.error(`\x1b[31m❌ MongoDB Connection Error:\x1b[0m`, error.message);
    console.log('⚠️ Falling back to MOCK MODE due to connection failure.'); // Exit if DB fails completely
  }
}

module.exports = { initDB };
