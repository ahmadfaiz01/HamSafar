import api from './api';

const recommendationService = {
  // Get trip recommendations based on user preferences
  getTripRecommendations: async (userId) => {
    try {
      const response = await api.get(`/recommendations/trips/${userId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching trip recommendations:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch trip recommendations');
    }
  },
  
  // Get points of interest recommendations based on user interests
  getPointsOfInterestRecommendations: async (userId) => {
    try {
      const response = await api.get(`/recommendations/points-of-interest/${userId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching POI recommendations:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch POI recommendations');
    }
  },
  
  // Get destination recommendations
  getDestinationRecommendations: async (userId) => {
    try {
      const response = await api.get(`/recommendations/destinations/${userId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching destination recommendations:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch destination recommendations');
    }
  }
};

export default recommendationService;
