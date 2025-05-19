const Hotel = require('../models/Hotel');

// Get popular destinations
exports.getPopularDestinations = async (req, res) => {
  try {
    console.log('Getting popular destinations');
    
    // Aggregate hotels by city and count them
    const destinations = await Hotel.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
      { $project: { _id: 0, name: '$_id', properties: '$count' } }
    ]);
    
    console.log(`Found ${destinations.length} popular destinations`);
    res.json(destinations);
  } catch (error) {
    console.error('Error getting popular destinations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all cities
exports.getCities = async (req, res) => {
  try {
    console.log('Getting all cities with hotels');
    
    // Group by city and count properties in each city
    const cities = await Hotel.aggregate([
      { $group: { _id: '$city', properties: { $sum: 1 } } },
      { $project: { _id: 0, name: '$_id', properties: 1 } },
      { $sort: { properties: -1 } }
    ]);
    
    console.log(`Found ${cities.length} cities with hotels`);
    res.json(cities);
  } catch (error) {
    console.error('Error getting cities:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Search hotels based on various criteria
 */
exports.searchHotels = async (req, res) => {
  try {
    console.log('Searching hotels with query:', req.query);
    const {
      destination,
      checkIn,
      checkOut,
      guests = 2,
      rooms = 1,
      minPrice,
      maxPrice,
      amenities,
      rating
    } = req.query;
    
    // Build search query
    const query = {};
    
    // Location search
    if (destination) {
      // Try to match city name directly first
      const cityRegex = new RegExp(destination, 'i');
      query.$or = [
        { city: cityRegex },
        { $text: { $search: destination } } // Fall back to text search if needed
      ];
    }
    
    // Price range
    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }
    
    // Rating
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }
    
    // Amenities
    if (amenities) {
      const amenitiesList = amenities.split(',').map(a => a.trim());
      if (amenitiesList.length > 0) {
        query.amenities = { $all: amenitiesList };
      }
    }
    
    console.log('Final MongoDB query:', JSON.stringify(query));
    
    // Execute the query
    const hotels = await Hotel.find(query).limit(20);
    
    console.log(`Found ${hotels.length} hotels matching the criteria`);
    res.json(hotels);
  } catch (error) {
    console.error('Error searching hotels:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get hotel by ID
 */
exports.getHotelById = async (req, res) => {
  try {
    console.log(`Getting hotel with ID: ${req.params.id}`);
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      console.log(`Hotel with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'Hotel not found' });
    }
    
    console.log(`Found hotel: ${hotel.name}`);
    res.json(hotel);
  } catch (error) {
    console.error('Error getting hotel by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get all hotels
 */
exports.getAllHotels = async (req, res) => {
  try {
    console.log('Getting all hotels');
    const hotels = await Hotel.find().limit(20);
    console.log(`Found ${hotels.length} hotels`);
    res.json(hotels);
  } catch (error) {
    console.error('Error getting all hotels:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create a new hotel (admin function)
 */
exports.createHotel = async (req, res) => {
  try {
    const hotel = new Hotel(req.body);
    await hotel.save();
    res.status(201).json(hotel);
  } catch (error) {
    console.error('Error creating hotel:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update an existing hotel (admin function)
 */
exports.updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    
    res.json(hotel);
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete a hotel (admin function)
 */
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    
    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};