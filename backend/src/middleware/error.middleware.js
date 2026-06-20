// src/middleware/error.middleware.js
// Centralized error handler — Express calls this when next(error) is invoked.
// Interview points:
// - Having ONE place for error handling keeps controllers clean
// - Different error types (JWT, Mongoose, custom) are normalized to a consistent shape
// - Stack traces only shown in development

const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', err);
  }

  // Mongoose bad ObjectId (e.g., /notes/not-a-valid-id)
  if (err.name === 'CastError') {
    error = new ApiError(404, 'Resource not found');
  }

  // Mongoose duplicate key (e.g., duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ApiError(409, `${field} already exists`);
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, messages.join(', '));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token');
  }
  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired');
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
