const express = require('express');
const router = express.Router();
const {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
  getNearbyProperties,
  getUserProperties
} = require('../controllers/propertyController');
const { protect, agentOrAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/nearby', getNearbyProperties);

// Protected routes
router.post('/', protect, agentOrAdmin, createProperty);
router.get('/user/properties', protect, getUserProperties);
router.put('/:id', protect, updateProperty);
router.delete('/:id', protect, deleteProperty);

// Must be last as it will match any /something
router.get('/:id', getPropertyById);

module.exports = router; 