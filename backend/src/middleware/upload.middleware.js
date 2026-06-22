// src/middleware/upload.middleware.js
// Multer configuration for file uploads.
// Interview points:
// - diskStorage lets us control exactly where files are saved and what they're named
// - fileFilter ensures only PDF and TXT files get through (security)
// - limits.fileSize caps uploads at 10MB to prevent abuse

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/ApiError');

// Configure where and how files are stored
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: userId-timestamp-originalname
    const uniqueSuffix = `${req.user._id}-${Date.now()}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// Only allow PDF and TXT files based on extension
const fileFilter = (req, file, cb) => {
  const allowedExts = ['.pdf', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only PDF and TXT files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
});

module.exports = { upload };
