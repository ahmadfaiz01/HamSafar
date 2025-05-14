const Hotel = require('../models/Hotel');

// Get all available cities
exports.getCities = async (req, res) => {
  try {
    const cities = await Hotel.distinct('city');
    res.status(200).json({ success: true, data: cities });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get popular destinations with counts
exports.getPopularDestinations = async (req, res) => {
  try {
    const destinations = await Hotel.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 }, image: { $first: '$mainImage' } } },
      { $sort: { count: -1 } },
      // Remove the $limit: 8 line or increase it to show more cities
      { $project: { _id: 0, name: '$_id', properties: '$count', imageUrl: '$image' } }
    ]);
    
    res.status(200).json({ success: true, data: destinations });
  } catch (error) {
    console.error('Error fetching popular destinations:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Search hotels
exports.searchHotels = async (req, res) => {
  try {
    const { destination, checkIn, checkOut, rooms, adults, children, 
           minPrice, maxPrice, rating, amenities } = req.query;
    
    // Basic query object
    const query = {};
    
    // Apply destination filter
    if (destination) {
      query.city = { $regex: new RegExp(destination, 'i') };
    }
    
    // Apply price filter if provided
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Apply star rating filter
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }
    
    // Apply amenities filter
    if (amenities) {
      const amenitiesList = amenities.split(',');
      query.amenities = { $all: amenitiesList };
    }
    
    // Execute search
    const hotels = await Hotel.find(query).sort({ userRating: -1 });
    
    res.status(200).json({ 
      success: true, 
      count: hotels.length,
      data: hotels 
    });
  } catch (error) {
    console.error('Error searching hotels:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get hotel by ID
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({ success: false, error: 'Hotel not found' });
    }
    
    res.status(200).json({ success: true, data: hotel });
  } catch (error) {
    console.error('Error fetching hotel:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get hotels by city
exports.getHotelsByCity = async (req, res) => {
  try {
    const { city } = req.params;
    
    const hotels = await Hotel.find({ city: { $regex: new RegExp(city, 'i') } });
    
    res.status(200).json({ 
      success: true, 
      count: hotels.length,
      data: hotels 
    });
  } catch (error) {
    console.error('Error fetching hotels by city:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};