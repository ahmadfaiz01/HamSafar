import api from './api';

const authService = {
  syncUserWithDatabase: async (user) => {
    try {
      const userData = {
        userId: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        preferences: {
          travelStyle: 'moderate',
          tripTypes: [],
          activities: [],
          budget: 'moderate',
          climate: [],
          interests: []
        }
      };

      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error syncing user:', error);
      throw error;
    }
  },

  updateProfile: async (userId, data) => {
    try {
      const response = await api.put(`/users/${userId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  // New method specifically for updating profile photo
  updateProfilePhoto: async (userId, photoURL) => {
    try {
      const response = await api.patch(`/users/${userId}/photo`, { photoURL });
      return response.data;
    } catch (error) {
      console.error('Error updating profile photo:', error);
      throw error;
    }
  },
  
  // Get user profile including photo
  getUserProfile: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
};

export default authService;