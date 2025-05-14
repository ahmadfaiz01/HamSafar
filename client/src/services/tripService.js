import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Trip service for managing user trips
const tripService = {
  // Create a new trip
  createTrip: async (tripData) => {
    try {
      const response = await axios.post(`${API_URL}/trips`, tripData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating trip:', error);
      throw new Error(error.response?.data?.error || 'Failed to create trip');
    }
  },
  
  // Get trip by ID
  getTripById: async (tripId) => {
    try {
      const response = await axios.get(`${API_URL}/trips/${tripId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching trip:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch trip');
    }
  },
  
  // Update trip details
  updateTrip: async (tripId, tripData) => {
    try {
      const response = await axios.put(`${API_URL}/trips/${tripId}`, tripData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating trip:', error);
      throw new Error(error.response?.data?.error || 'Failed to update trip');
    }
  },
  
  // Delete a trip
  deleteTrip: async (tripId) => {
    try {
      await axios.delete(`${API_URL}/trips/${tripId}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete trip');
    }
  },
  
  // Get all trips for a user
  getUserTrips: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/trips/user/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user trips:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch user trips');
    }
  },
  
  // Export trip to PDF or other format
  exportTrip: async (tripId, format = 'pdf') => {
    try {
      const response = await axios.get(`${API_URL}/trips/${tripId}/export`, {
        params: { format },
        responseType: 'blob'
      });
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `trip-${tripId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting trip:', error);
      throw new Error(error.response?.data?.error || 'Failed to export trip');
    }
  },
  
  // Get trip statistics for a user
  getTripStatistics: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/trips/stats/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching trip statistics:', error);
      throw new Error(error.response?.data?.error || 'Failed to get trip statistics');
    }
  },
  
  // Add a place to trip itinerary
  addPlaceToTrip: async (tripId, dayIndex, place) => {
    try {
      const response = await axios.post(`${API_URL}/trips/${tripId}/activities`, {
        dayIndex,
        activity: place
      });
      return response.data.data;
    } catch (error) {
      console.error('Error adding place to trip:', error);
      throw new Error(error.response?.data?.error || 'Failed to add place to trip');
    }
  }
};

export default tripService;