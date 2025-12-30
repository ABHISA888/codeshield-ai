const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadController } = require('../controllers/uploadController');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/markdown'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.md')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Markdown files are allowed'));
    }
  }
});

router.post('/', upload.single('file'), uploadController);

module.exports = router;

