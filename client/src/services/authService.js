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
  }
};

export default authService;