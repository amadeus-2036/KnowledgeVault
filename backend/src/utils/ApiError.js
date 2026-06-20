// src/utils/ApiError.js
// Custom error class that extends the built-in Error.
// Interview point: Centralizing errors lets us handle all failures uniformly
// in a single Express error-handling middleware instead of scattering try/catch everywhere.

class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
