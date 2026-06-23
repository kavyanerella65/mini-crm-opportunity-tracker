/**
 * Catches requests that didn't match any route and forwards a 404 into
 * the error handler below, so unmatched routes still produce a consistent
 * JSON error shape instead of Express's default HTML error page.
 */
const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found - ${req.method} ${req.originalUrl}`));
};

/**
 * Single place where every thrown/forwarded error in the app is turned
 * into a JSON response with an appropriate HTTP status code.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Internal Server Error';

  // Malformed MongoDB ObjectId (e.g. a bad :id param)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Duplicate key (e.g. registering with an email that already exists)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || { field: 'value' })[0];
    message = `An account with this ${field} already exists`;
  }

  // Mongoose schema validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Centralized logging — every error is logged server-side with a timestamp,
  // regardless of whether it's exposed to the client.
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${statusCode}: ${err.stack || message}`);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
