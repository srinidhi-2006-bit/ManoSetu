/**
 * ManoSetu - Main Express Server
 * ================================
 * Serves the frontend and provides a full REST API for:
 *  - AI chatbot  (/api/chat)
 *  - Auth        (/api/auth)
 *  - Mood tracker(/api/mood)
 *  - SOS alerts  (/api/sos)
 *  - Dashboard   (/api/dashboard)
 *  - Therapists  (/api/therapists)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Middleware
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

// Routes
const chatRoutes = require('./routes/chat');
const authRoutes = require('./routes/auth');
const moodRoutes = require('./routes/mood');
const sosRoutes = require('./routes/sos');
const dashboardRoutes = require('./routes/dashboard');
const therapistRoutes = require('./routes/therapists');
const communityRoutes = require('./routes/community');
const journalRoutes = require('./routes/journal');
const bookingRoutes = require('./routes/booking');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// ─── Static Frontend ──────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/chat',        chatRoutes);
app.use('/api/mood',        moodRoutes);
app.use('/api/sos',         sosRoutes);
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/therapists',  therapistRoutes);
app.use('/api/community',   communityRoutes);
app.use('/api/journal',     journalRoutes);
app.use('/api/booking',     bookingRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ManoSetu API',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()) + 's',
    timestamp: new Date().toISOString(),
  });
});

// ─── Catch-all → Serve Frontend ───────────────────────────────────────────────
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Centralized Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

const { initDB } = require('./config/db');

// ─── Start ────────────────────────────────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => {
    console.log('\n\x1b[35m╔══════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[35m║         🧠  ManoSetu Backend             ║\x1b[0m');
    console.log('\x1b[35m╚══════════════════════════════════════════╝\x1b[0m');
    console.log(`\n  🚀  Server   : \x1b[36mhttp://localhost:${PORT}\x1b[0m`);
    console.log(`  🔗  API Base : \x1b[36mhttp://localhost:${PORT}/api\x1b[0m`);
    console.log(`  💚  Health   : \x1b[36mhttp://localhost:${PORT}/api/health\x1b[0m`);
    console.log(`  📁  Env      : ${process.env.NODE_ENV || 'development'}`);
    console.log('\n\x1b[32m  ✔ All systems ready.\x1b[0m\n');
  });
});
