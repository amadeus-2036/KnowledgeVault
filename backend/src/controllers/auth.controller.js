// src/controllers/auth.controller.js
// Thin controller — validates input, calls model/service, returns response.
// Interview point: Controllers should NOT contain business logic.
// They are the bridge between HTTP and your service/model layer.

const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Helper to generate a signed JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '100y',
  });
};

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  res.status(201).json(
    new ApiResponse(201, {
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    }, 'Registration successful')
  );
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  // .select('+password') overrides the schema's select:false
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user._id);

  res.status(200).json(
    new ApiResponse(200, {
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    }, 'Login successful')
  );
});

// GET /api/auth/me  (protected)
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json(new ApiResponse(200, user, 'User fetched'));
});

// PUT /api/auth/me  (protected)
const updateMe = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const updated = await User.findByIdAndUpdate(
    req.user._id,
    { name },
    { new: true, runValidators: true }
  );
  res.status(200).json(new ApiResponse(200, updated, 'Profile updated'));
});

module.exports = { register, login, getMe, updateMe };
