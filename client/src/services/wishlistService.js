import api from './api';

const wishlistService = {
  // Get all items in a user's wishlist
  getWishlist: async (userId) => {
    try {
      const response = await api.get(`/wishlist/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch wishlist');
    }
  },
  
  // Add an item to the wishlist
  addToWishlist: async (userId, item) => {
    try {
      const response = await api.post(`/wishlist/${userId}`, item);
      return response.data;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw new Error(error.response?.data?.error || 'Failed to add to wishlist');
    }
  },
  
  // Remove an item from the wishlist
  removeFromWishlist: async (userId, itemId) => {
    try {
      const response = await api.delete(`/wishlist/${userId}/items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw new Error(error.response?.data?.error || 'Failed to remove from wishlist');
    }
  },
  
  // Check if an item is in the wishlist
  checkWishlistItem: async (userId, itemType, itemId) => {
    try {
      const response = await api.get(`/wishlist/${userId}/check/${itemType}/${itemId}`);
      return response.data.inWishlist;
    } catch (error) {
      console.error('Error checking wishlist item:', error);
      return false;
    }
  }
};

export default wishlistService;
