const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// Upload single file
router.post('/single', protect, upload.single('image'), (req, res) => {
  try {
    res.status(200).json({
      message: 'File uploaded successfully',
      filePath: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload multiple files (up to 5)
router.post('/multiple', protect, upload.array('images', 5), (req, res) => {
  try {
    const filePaths = req.files.map(file => `/uploads/${file.filename}`);
    
    res.status(200).json({
      message: 'Files uploaded successfully',
      filePaths
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 