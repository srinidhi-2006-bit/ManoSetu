/**
 * ManoSetu - Request Logger Middleware
 */

const logger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const color =
      res.statusCode >= 500 ? '\x1b[31m' // red
      : res.statusCode >= 400 ? '\x1b[33m' // yellow
      : res.statusCode >= 300 ? '\x1b[36m' // cyan
      : '\x1b[32m'; // green
    const reset = '\x1b[0m';
    console.log(
      `${color}[${timestamp}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)${reset}`
    );
  });

  next();
};

module.exports = logger;
