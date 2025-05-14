/**
 * Simple API client for recommendations
 */
const fetchRecommendations = async () => {
  try {
    const response = await fetch('/api/recommendations');
    if (!response.ok) {
      throw new Error('Failed to fetch recommendations');
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};

const fetchCategoryRecommendations = async (category) => {
  try {
    const response = await fetch(`/api/recommendations/category/${category}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${category} recommendations`);
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Error fetching ${category} recommendations:`, error);
    return [];
  }
};

const addToWishlist = async (destinationId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/recommendations/wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ destinationId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to add to wishlist');
    }
    
    return true;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return false;
  }
};

export { fetchRecommendations, fetchCategoryRecommendations, addToWishlist };
