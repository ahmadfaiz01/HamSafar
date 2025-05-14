const Trip = require('../models/Trip');
const User = require('../models/User');

// Create a new trip
exports.createTrip = async (req, res) => {
  try {
    const { userId, title, destination, startDate, endDate, days, totalBudget, categories } = req.body;
    
    const trip = new Trip({
      userId,
      title,
      destination,
      startDate,
      endDate,
      days: days || [],
      totalBudget,
      categories: categories || []
    });
    
    const savedTrip = await trip.save();
    
    // Update user interests based on trip categories
    if (categories && categories.length > 0) {
      await updateUserInterests(userId, categories);
    }
    
    res.status(201).json(savedTrip);
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ error: 'Failed to create trip' });
  }
};

// Get all trips for a user
exports.getUserTrips = async (req, res) => {
  try {
    const { userId } = req.params;
    const trips = await Trip.find({ userId }).sort({ startDate: 1 });
    res.status(200).json(trips);
  } catch (error) {
    console.error('Error fetching user trips:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
};

// Get a single trip by ID
exports.getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id);
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    res.status(200).json(trip);
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
};

// Update a trip
exports.updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Ensure the user owns this trip
    if (trip.userId !== req.body.userId) {
      return res.status(403).json({ error: 'Not authorized to update this trip' });
    }
    
    const updatedTrip = await Trip.findByIdAndUpdate(
      id,
      { ...updates, updated: Date.now() },
      { new: true }
    );
    
    // Update user interests if categories changed
    if (updates.categories && updates.categories.length > 0) {
      await updateUserInterests(trip.userId, updates.categories);
    }
    
    res.status(200).json(updatedTrip);
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ error: 'Failed to update trip' });
  }
};

// Delete a trip
exports.deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Ensure the user owns this trip
    if (trip.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this trip' });
    }
    
    await Trip.findByIdAndDelete(id);
    res.status(200).json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
};

// Update user interests based on trip categories
async function updateUserInterests(userId, categories) {
  try {
    const user = await User.findOne({ userId });
    if (!user) return;
    
    // Create a map of existing interests
    const interestMap = new Map();
    user.interests.forEach(interest => {
      interestMap.set(interest.category, interest.weight);
    });
    
    // Update weights for categories in this trip
    categories.forEach(category => {
      const currentWeight = interestMap.get(category) || 0;
      interestMap.set(category, currentWeight + 1);
    });
    
    // Convert back to array format
    const updatedInterests = Array.from(interestMap.entries()).map(([category, weight]) => ({
      category,
      weight
    }));
    
    // Update user
    await User.updateOne(
      { userId },
      { $set: { interests: updatedInterests } }
    );
  } catch (error) {
    console.error('Error updating user interests:', error);
  }
}