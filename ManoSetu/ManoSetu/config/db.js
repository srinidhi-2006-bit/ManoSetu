/**
 * ManoSetu - MongoDB Store (Mongoose)
 * Uses mongodb-memory-server as fallback when no MONGO_URI is configured.
 */

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

async function initDB() {
  try {
    mongoose.set('strictQuery', false);
    mongoose.set('debug', true);

    if (process.env.MOCK_DB === 'true') {
      console.log('⚠️ Running in MOCK DB MODE');
      return;
    }

    let uri = MONGO_URI;

    // If no MONGO_URI is set, spin up an in-memory MongoDB
    if (!uri) {
      console.log('\x1b[33m⚠️  No MONGO_URI found – starting in-memory MongoDB …\x1b[0m');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log(`\x1b[32m✅ In-memory MongoDB started: ${uri}\x1b[0m`);
    }

    await mongoose.connect(uri);

    // Wait for the connection to be fully ready
    await mongoose.connection.asPromise();
    console.log(`\x1b[32m✅ MongoDB Connected: ${mongoose.connection.host}\x1b[0m`);
    console.log(`   Connection state: ${mongoose.connection.readyState}`);

    // Seed Therapists AFTER connection is fully ready
    try {
      const Therapist = require('../models/Therapist');
      const count = await Therapist.countDocuments();
      console.log(`   Therapist count: ${count}`);
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
    } catch (seedErr) {
      console.warn('⚠️ Could not seed Therapists:', seedErr.message);
    }

  } catch (error) {
    console.error(`\x1b[31m❌ MongoDB Connection Error:\x1b[0m`, error.message);
    console.log('⚠️ Server will continue, but database features will not work.');
  }
}

module.exports = { initDB };
