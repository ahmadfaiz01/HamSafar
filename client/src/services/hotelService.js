import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get all available cities for hotel search
export const getCities = async () => {
  try {
    const response = await axios.get(`${API_URL}/hotels/cities`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
};

// Get popular destinations
export const getPopularDestinations = async () => {
  try {
    const response = await axios.get(`${API_URL}/hotels/popular-destinations`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching popular destinations:', error);
    throw error;
  }
};

// Search hotels based on filters
export const searchHotels = async (params) => {
  try {
    const response = await axios.get(`${API_URL}/hotels/search`, { params });
    return response.data;
  } catch (error) {
    console.error('Error searching hotels:', error);
    throw error;
  }
};

// Get hotel by ID
export const getHotelById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/hotels/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching hotel details:', error);
    throw error;
  }
};

// Get hotels by city
export const getHotelsByCity = async (city) => {
  try {
    const response = await axios.get(`${API_URL}/hotels/city/${city}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching hotels by city:', error);
    throw error;
  }
};