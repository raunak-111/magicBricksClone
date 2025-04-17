const express = require('express');
const router = express.Router();
const {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
  getNearbyProperties
} = require('../controllers/propertyController');
const { protect, agentOrAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/nearby', getNearbyProperties);
router.get('/:id', getPropertyById);

// Protected routes
router.post('/', protect, agentOrAdmin, createProperty);
router.put('/:id', protect, updateProperty);
router.delete('/:id', protect, deleteProperty);

module.exports = router; 