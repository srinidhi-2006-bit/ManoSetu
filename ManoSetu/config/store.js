/**
 * ManoSetu - In-Memory Store (shared across all controllers in MOCK_DB mode)
 * 
 * All controllers import from here so stats stay consistent without MongoDB.
 */

const store = {
  // Users registered this session
  users: new Map(), // username.toLowerCase() → user object

  // Mood logs: [ { userId, mood, notes, ts } ]
  moodLogs: [],

  // SOS alerts: [ { id, userId, type, status, ts } ]
  sosAlerts: [],

  // Chat messages: [ { userId, role, text, ts } ]
  messages: [],

  // Session events: [ { userId, ts } ] — used for weekly trend
  sessionEvents: [],

  // Community posts: [ { id, authorIcon, authorName, text, hugsCount, replies: [], ts } ]
  communityPosts: [
    { 
      id: 'p1', 
      authorIcon: '🦊', 
      authorName: 'Anonymous Fox', 
      text: "I've been feeling incredibly overwhelmed with school lately. Does anyone else get so stressed they just can't start their assignments? How do you break the cycle?",
      hugsCount: 12,
      replies: [],
      ts: new Date(Date.now() - 7200000).toISOString() 
    },
    { 
      id: 'p2', 
      authorIcon: '🦉', 
      authorName: 'Anonymous Owl', 
      text: "Just finished my first session with a therapist from the platform. I was so nervous but it actually feels really good to talk about things out loud. Highly recommend taking the step!",
      hugsCount: 34,
      replies: [],
      ts: new Date(Date.now() - 18000000).toISOString() 
    }
  ],

  // Journal entries: [ { userId, content, ts } ]
  journalEntries: [],
};

module.exports = store;
