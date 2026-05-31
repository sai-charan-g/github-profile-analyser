const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({ success: false, message: 'Too many requests. Try again later.' });
  },
});

const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({ success: false, message: 'Too many analyze requests. Slow down.' });
  },
});

module.exports = { apiLimiter, analyzeLimiter };
