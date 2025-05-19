import axios from 'axios';

// Simplify the API URL configuration
const API_URL = 'http://localhost:5000';

// Get popular destinations
export const getPopularDestinations = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/hotels/popular-destinations`);
    console.log('Popular destinations response:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching popular destinations:', error);
    // Return fallback data on error
    return [
      { name: 'Islamabad', properties: 3 },
      { name: 'Lahore', properties: 3 },
      { name: 'Karachi', properties: 3 },
      { name: 'Murree', properties: 1 },
      { name: 'Swat', properties: 1 },
      { name: 'Naran', properties: 1 }
    ];
  }
};

/**
 * Search for hotels based on criteria
 * @param {Object} searchData - Search parameters
 * @returns {Promise<Object>} - Search results
 */
export const searchHotels = async (searchData) => {
  try {
    console.log('Searching hotels with params:', searchData);
    
    // Format dates properly for API and handle potentially undefined values
    const formattedData = {
      destination: searchData.destination || '',
      // Handle undefined or null dates
      checkIn: searchData.checkIn instanceof Date 
        ? searchData.checkIn.toISOString().split('T')[0]
        : (searchData.checkIn || new Date().toISOString().split('T')[0]),
      checkOut: searchData.checkOut instanceof Date
        ? searchData.checkOut.toISOString().split('T')[0]
        : (searchData.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0]),
      adults: searchData.adults || 2,
      children: searchData.children || 0,
      rooms: searchData.rooms || 1
    };
    
    // Make the API request
    const response = await axios.get(`${API_URL}/api/hotels/search`, { 
      params: formattedData 
    });
    
    console.log('Hotel search response:', response);
    return response.data || [];
  } catch (error) {
    console.error('Error searching hotels:', error.response?.data || error.message);
    return [];
  }
};

/**
 * Get hotel details by ID
 * @param {string} hotelId - Hotel ID
 * @returns {Promise<Object>} - Hotel details
 */
export const getHotelById = async (hotelId) => {
  try {
    console.log(`Getting hotel details for ID: ${hotelId}`);
    const response = await axios.get(`${API_URL}/api/hotels/${hotelId}`);
    console.log('Hotel details response:', response);
    return response.data;
  } catch (error) {
    console.error('Error getting hotel details:', error.response?.data || error.message);
    // Don't throw error, return null instead
    return null;
  }
};

/**
 * Get all available cities
 * @returns {Promise<Array>} - List of cities
 */
export const getCities = async () => {
  try {
    console.log('Getting all cities with hotels');
    const response = await axios.get(`${API_URL}/api/hotels/cities`);
    console.log('Cities response:', response);
    return response.data;
  } catch (error) {
    console.error('Error getting cities:', error.response?.data || error.message);
    // Return fallback data on error
    return [
      { name: 'Islamabad', properties: 3 },
      { name: 'Lahore', properties: 3 },
      { name: 'Karachi', properties: 3 },
      { name: 'Murree', properties: 1 },
      { name: 'Swat', properties: 1 },
      { name: 'Naran', properties: 1 },
      { name: 'Hunza', properties: 1 },
      { name: 'Skardu', properties: 1 },
      { name: 'Peshawar', properties: 1 },
      { name: 'Multan', properties: 1 }
    ];
  }
};

/**
 * Get all hotels
 * @returns {Promise<Array>} - List of hotels
 */
export const getAllHotels = async () => {
  try {
    console.log('Getting all hotels');
    const response = await axios.get(`${API_URL}/api/hotels`);
    console.log('All hotels response:', response);
    return response.data;
  } catch (error) {
    console.error('Error getting all hotels:', error.response?.data || error.message);
    return [];
  }
};