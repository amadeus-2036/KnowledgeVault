// src/utils/asyncHandler.js
// Higher-order function that wraps async route handlers.
// Interview point: Without this, every async controller needs its own try/catch.
// This pattern (a.k.a. "async wrapper") removes boilerplate and forwards all
// promise rejections to Express's centralized error middleware.

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
