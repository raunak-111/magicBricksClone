const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  addToFavorites,
  removeFromFavorites,
  getUsers,
  getAgents
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/agents', getAgents);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/favorites', protect, addToFavorites);
router.delete('/favorites/:id', protect, removeFromFavorites);

// Admin routes
router.get('/', protect, admin, getUsers);

module.exports = router; 