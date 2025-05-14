const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');

// Get user's wishlist
router.get('/:userId', wishlistController.getWishlist);

// Add item to wishlist
router.post('/:userId', wishlistController.addToWishlist);

// Remove item from wishlist
router.delete('/:userId/items/:itemId', wishlistController.removeFromWishlist);

// Check if item is in wishlist
router.get('/:userId/check/:itemType/:itemId', wishlistController.checkWishlistItem);

module.exports = router;
