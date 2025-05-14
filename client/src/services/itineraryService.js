/**
 * Service for interacting with the itinerary API endpoints
 */

// Get auth token from localStorage
const getToken = () => localStorage.getItem('token');

// Create headers with auth token
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

/**
 * Get all itineraries for the authenticated user
 */
export const getUserItineraries = async () => {
  try {
    const response = await fetch('/api/itineraries', {
      headers: createHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch itineraries');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    throw error;
  }
};

/**
 * Create a new itinerary
 */
export const createItinerary = async (itineraryData) => {
  try {
    const response = await fetch('/api/itineraries', {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(itineraryData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create itinerary');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating itinerary:', error);
    throw error;
  }
};

/**
 * Get a specific itinerary by ID
 */
export const getItineraryById = async (itineraryId) => {
  try {
    const response = await fetch(`/api/itineraries/${itineraryId}`, {
      headers: createHeaders()
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Itinerary not found');
      }
      throw new Error('Failed to fetch itinerary');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    throw error;
  }
};

/**
 * Update an existing itinerary
 */
export const updateItinerary = async (itineraryId, updates) => {
  try {
    const response = await fetch(`/api/itineraries/${itineraryId}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update itinerary');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating itinerary:', error);
    throw error;
  }
};

/**
 * Delete an itinerary
 */
export const deleteItinerary = async (itineraryId) => {
  try {
    const response = await fetch(`/api/itineraries/${itineraryId}`, {
      method: 'DELETE',
      headers: createHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete itinerary');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting itinerary:', error);
    throw error;
  }
};

/**
 * Generate AI-powered itinerary recommendations
 */
export const generateAIItinerary = async (itineraryId) => {
  try {
    const response = await fetch(`/api/itineraries/${itineraryId}/generate-ai-itinerary`, {
      method: 'POST',
      headers: createHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate AI itinerary');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error generating AI itinerary:', error);
    throw error;
  }
};

/**
 * Get destination recommendations based on preferences
 */
export const getRecommendedDestinations = async (preferences) => {
  try {
    const response = await fetch('/api/itineraries/recommend-destinations', {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(preferences)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get destination recommendations');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting destination recommendations:', error);
    throw error;
  }
};
