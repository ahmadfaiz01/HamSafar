// In server/controllers/weatherController.js
const weatherService = require('../services/weatherService');

const getWeather = async (req, res) => {
  try {
    const { city } = req.params;
    const weatherData = await weatherService.getWeatherForCity(city);
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch weather data', error: error.message });
  }
};

module.exports = { getWeather };