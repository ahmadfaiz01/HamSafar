// In server/services/weatherService.js
const axios = require('axios');

const API_KEY = 'your_openweathermap_api_key'; // Replace with your actual API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const getWeatherForCity = async (city) => {
  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric' // For Celsius
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

module.exports = { getWeatherForCity };