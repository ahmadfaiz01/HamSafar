const Wishlist = require('../models/Wishlist');
const Hotel = require('../models/Hotel');

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    
    let wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      // Create a new wishlist if one doesn't exist
      wishlist = new Wishlist({
        userId,
        items: []
      });
      await wishlist.save();
    }
    
    res.status(200).json({
      success: true,
      data: wishlist.items
    });
  } catch (error) {
    console.error('Error retrieving wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Add item to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const { itemType, itemId, name, description, imageUrl, location, price, rating, notes } = req.body;
    
    if (!itemType || !itemId || !name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    let wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        userId,
        items: []
      });
    }
    
    // Check if item already exists in wishlist
    const itemExists = wishlist.items.some(item => 
      item.itemType === itemType && item.itemId === itemId
    );
    
    if (itemExists) {
      return res.status(400).json({
        success: false,
        error: 'Item already in wishlist'
      });
    }
    
    // Add to wishlist
    wishlist.items.push({
      itemType,
      itemId,
      name,
      description,
      imageUrl,
      location,
      price,
      rating,
      addedAt: new Date(),
      notes
    });
    
    wishlist.updatedAt = new Date();
    await wishlist.save();
    
    res.status(200).json({
      success: true,
      message: 'Item added to wishlist',
      data: wishlist.items
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Remove item from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    
    const wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        error: 'Wishlist not found'
      });
    }
    
    // Remove the item
    wishlist.items = wishlist.items.filter(item => item._id.toString() !== itemId);
    wishlist.updatedAt = new Date();
    
    await wishlist.save();
    
    res.status(200).json({
      success: true,
      message: 'Item removed from wishlist',
      data: wishlist.items
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Check if an item is in the user's wishlist
exports.checkWishlistItem = async (req, res) => {
  try {
    const { userId, itemType, itemId } = req.params;
    
    const wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      return res.status(200).json({
        success: true,
        inWishlist: false
      });
    }
    
    const itemExists = wishlist.items.some(item => 
      item.itemType === itemType && item.itemId === itemId
    );
    
    res.status(200).json({
      success: true,
      inWishlist: itemExists
    });
  } catch (error) {
    console.error('Error checking wishlist item:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
