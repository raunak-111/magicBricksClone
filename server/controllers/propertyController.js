const Property = require('../models/propertyModel');

// @desc    Create a new property
// @route   POST /api/properties
// @access  Private (Agent or Admin)
const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      status,
      price,
      area,
      bedrooms,
      bathrooms,
      furnishing,
      parking,
      amenities,
      address,
      coordinates
    } = req.body;

    // Create property
    const property = await Property.create({
      title,
      description,
      type,
      status,
      price,
      area,
      bedrooms,
      bathrooms,
      furnishing,
      parking,
      amenities,
      address,
      location: {
        type: 'Point',
        coordinates: coordinates || [0, 0]
      },
      owner: req.user._id,
      images: req.body.images || []
    });

    if (property) {
      res.status(201).json(property);
    } else {
      res.status(400).json({ message: 'Invalid property data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all properties with filters
// @route   GET /api/properties
// @access  Public
const getProperties = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.page) || 1;

    // Build filter object
    const filter = {};

    // Filter by type
    if (req.query.type) {
      filter.type = req.query.type;
    }

    // Filter by status (for-sale, for-rent)
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    // Filter by bedrooms
    if (req.query.bedrooms) {
      filter.bedrooms = { $gte: Number(req.query.bedrooms) };
    }

    // Filter by bathrooms
    if (req.query.bathrooms) {
      filter.bathrooms = { $gte: Number(req.query.bathrooms) };
    }

    // Filter by furnishing
    if (req.query.furnishing) {
      filter.furnishing = req.query.furnishing;
    }

    // Filter by city
    if (req.query.city) {
      filter['address.city'] = { $regex: req.query.city, $options: 'i' };
    }

    // Count total matching documents
    const count = await Property.countDocuments(filter);

    // Get properties with pagination
    const properties = await Property.find(filter)
      .populate('owner', 'name email phone')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      properties,
      page,
      pages: Math.ceil(count / pageSize),
      totalProperties: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get property by ID
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email phone');

    if (property) {
      // Increment views count
      property.views += 1;
      await property.save();
      
      res.json(property);
    } else {
      res.status(404).json({ message: 'Property not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Owner, Agent or Admin)
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is the owner or an admin
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this property' });
    }

    // Update fields
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json(updatedProperty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Owner, Agent or Admin)
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is the owner or an admin
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this property' });
    }

    await property.deleteOne();
    res.json({ message: 'Property removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
const getFeaturedProperties = async (req, res) => {
  try {
    const properties = await Property.find({ featured: true })
      .populate('owner', 'name')
      .limit(6);
    
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get nearby properties
// @route   GET /api/properties/nearby
// @access  Public
const getNearbyProperties = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Convert radius from kilometers to meters (required by MongoDB)
    const radiusInMeters = radius * 1000;

    // Find properties within the radius
    const properties = await Property.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radiusInMeters
        }
      }
    }).limit(12);

    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get properties by logged in user
// @route   GET /api/properties/user
// @access  Private
const getUserProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id })
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
  getNearbyProperties,
  getUserProperties
}; 