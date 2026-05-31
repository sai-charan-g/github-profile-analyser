function errorHandler(err, req, res, next) {
  console.error(`${req.method} ${req.originalUrl} — ${err.message}`);

  if (err.message.includes('not found')) return res.status(404).json({ success: false, message: err.message });
  if (err.message.includes('rate limit')) return res.status(429).json({ success: false, message: err.message });
  if (err.message.includes('Invalid')) return res.status(400).json({ success: false, message: err.message });

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}

module.exports = errorHandler;
