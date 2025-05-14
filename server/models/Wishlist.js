const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WishlistItemSchema = new Schema({
  itemType: {
    type: String,
    enum: ['hotel', 'destination', 'trip', 'attraction'],
    required: true
  },
  itemId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  imageUrl: {
    type: String
  },
  location: {
    type: String
  },
  price: {
    type: Number
  },
  rating: {
    type: Number
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  }
});

const WishlistSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  items: [WishlistItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for efficient queries
WishlistSchema.index({ userId: 1, 'items.itemType': 1 });

module.exports = mongoose.model('Wishlist', WishlistSchema);
