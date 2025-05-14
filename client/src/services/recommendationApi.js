// API service for recommendations

// Get auth token
const getToken = () => localStorage.getItem('token');

// Create headers with token if available
const createHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  const token = getToken();
  if (token) {
    headers['x-auth-token'] = token;
  }
  
  return headers;
};

// Get personalized recommendations
export const getRecommendations = async () => {
  try {
    const response = await fetch('/api/recommendations', {
      headers: createHeaders()
    });
    
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

// Get recommendations by category
export const getCategoryRecommendations = async (category) => {
  try {
    const response = await fetch(`/api/recommendations/category/${category}`, {
      headers: createHeaders()
    });
    
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

// Get destination details
export const getDestinationDetails = async (id) => {
  try {
    const response = await fetch(`/api/recommendations/destinations/${id}`, {
      headers: createHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch destination details');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching destination details:', error);
    throw error;
  }
};

// Add destination to wishlist
export const addToWishlist = async (destinationId) => {
  try {
    const response = await fetch('/api/recommendations/wishlist', {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ destinationId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to add to wishlist');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

// Get user preferences
export const getUserPreferences = async () => {
  try {
    const response = await fetch('/api/preferences', {
      headers: createHeaders()
    });
    
    if (response.status === 404) {
      return null; // No preferences found, which is fine
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch user preferences');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
};

// Update user preferences
export const updateUserPreferences = async (preferences) => {
  try {
    const response = await fetch('/api/preferences', {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(preferences)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update preferences');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
};
