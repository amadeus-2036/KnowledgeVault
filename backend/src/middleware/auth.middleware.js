// src/middleware/auth.middleware.js
// Interview points:
// - JWT is stateless: no DB lookup needed to validate — just verify the signature
// - We attach req.user so every downstream controller knows who's making the request
// - Authorization header format: "Bearer <token>"

const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  // Verify token signature and decode payload
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Fetch the user from DB to ensure they still exist
  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    throw new ApiError(401, 'User not found');
  }

  req.user = user; // Attach user to request object
  next();
});

module.exports = { protect };
