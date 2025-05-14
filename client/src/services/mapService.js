import api from './api';

const mapService = {
  // Save user location
  saveUserLocation: async (locationData) => {
    try {
      console.log("Saving location data:", locationData);
      const response = await api.post('/locations', locationData);
      return response.data;
    } catch (error) {
      console.error('Error saving location:', error);
      throw new Error(error.response?.data?.error || 'Failed to save location');
    }
  },
  
  // Get nearby points of interest - method used in ExploreMap.jsx
  getNearbyPointsOfInterest: async (longitude, latitude, maxDistance = 5000, category = null) => {
    try {
      console.log(`Fetching nearby POIs: ${longitude}, ${latitude}, ${maxDistance}m, category: ${category}`);
      const params = { longitude, latitude, maxDistance };
      if (category) params.category = category;
      
      const response = await api.get('/locations/nearby', { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching nearby points:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch nearby points');
    }
  },
  
  // Get points within map bounds - used in ExploreMap.jsx
  getPointsInBounds: async (sw_lng, sw_lat, ne_lng, ne_lat, category = null) => {
    try {
      const params = { sw_lng, sw_lat, ne_lng, ne_lat };
      if (category) params.category = category;
      
      const response = await api.get('/locations/bounds', { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching points in bounds:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch points');
    }
  },
  
  // Get user's saved locations - backwards compatibility for MapView.jsx
  getUserLocations: async (userId) => {
    try {
      const response = await api.get(`/locations/user/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user locations:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch locations');
    }
  },
  
  // Backwards compatibility method for MapView.jsx
  getNearbyPoints: async (params) => {
    try {
      return await mapService.getNearbyPointsOfInterest(
        params.longitude,
        params.latitude,
        params.maxDistance
      );
    } catch (error) {
      console.error('Error fetching nearby points:', error);
      throw error;
    }
  },
  
  // Save a place to user's favorites
  savePlace: async (placeData) => {
    try {
      const response = await api.post('/locations/saved-places', placeData);
      return response.data;
    } catch (error) {
      console.error('Error saving place:', error);
      throw new Error(error.response?.data?.error || 'Failed to save place');
    }
  },
  
  // Get user's saved places
  getSavedPlaces: async (userId) => {
    try {
      const response = await api.get(`/locations/saved-places/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching saved places:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch saved places');
    }
  },
  
  // Delete a saved place
  deleteSavedPlace: async (placeId) => {
    try {
      const response = await api.delete(`/locations/saved-places/${placeId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting saved place:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete saved place');
    }
  },
  
  // Get location based recommendations
  getLocationRecommendations: async (params) => {
    try {
      const response = await api.get('/locations/recommendations', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching location recommendations:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch recommendations');
    }
  }
};

export default mapService;
