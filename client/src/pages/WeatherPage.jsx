import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { FiSearch, FiMapPin, FiDroplet, FiWind, FiSun, FiSunrise, FiSunset } from 'react-icons/fi';
import '../styles/WeatherPage.css';

const WeatherPage = () => {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  // Weather API key
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || 'YOUR_API_KEY';
  const API_URL = 'https://api.openweathermap.org/data/2.5';

  // Get user's location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Fetch weather for user's location when it's available
  const fetchWeatherByCoords = useCallback(async (lat, lon) => {
    setLoading(true);
    setError('');
    
    try {
      // Current weather
      const weatherResponse = await axios.get(`${API_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric'
        }
      });
      
      setWeather(weatherResponse.data);
      setLocation(weatherResponse.data.name);
      
      // Forecast data
      const forecastResponse = await axios.get(`${API_URL}/forecast`, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric'
        }
      });
      
      // Process forecast data (group by day)
      const dailyForecasts = processForecastData(forecastResponse.data.list);
      setForecast(dailyForecasts);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Unable to fetch weather data. Please try again.');
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  }, [API_KEY, API_URL, processForecastData]);

  useEffect(() => {
    if (userLocation) {
      fetchWeatherByCoords(userLocation.lat, userLocation.lon);
    }
  }, [userLocation, fetchWeatherByCoords]);

  // Handle search submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (location.trim()) {
      fetchWeatherByCity(location);
    }
  };

  // Fetch weather by city name
  const fetchWeatherByCity = async (city) => {
    setLoading(true);
    setError('');
    
    try {
      // Current weather
      const weatherResponse = await axios.get(`${API_URL}/weather`, {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric'
        }
      });
      
      setWeather(weatherResponse.data);
      
      // Forecast data
      const forecastResponse = await axios.get(`${API_URL}/forecast`, {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric'
        }
      });
      
      // Process forecast data (group by day)
      const dailyForecasts = processForecastData(forecastResponse.data.list);
      setForecast(dailyForecasts);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('City not found. Please try another location.');
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather by coordinates
  // Removed duplicate fetchWeatherByCoords function

  // Process 3-hour forecast data into daily forecasts
  const processForecastData = (forecastList) => {
    const dailyData = {};
    
    forecastList.forEach((item) => {
      // Get date (without time)
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      
      // Skip if it's today
      if (date === new Date().toISOString().split('T')[0]) {
        return;
      }
      
      // Initialize day data if not exists
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          temperatures: [],
          weatherIcons: [],
          descriptions: []
        };
      }
      
      // Collect data for averaging later
      dailyData[date].temperatures.push(item.main.temp);
      dailyData[date].weatherIcons.push(item.weather[0].icon);
      dailyData[date].descriptions.push(item.weather[0].description);
    });
    
    // Convert to array and compute average/mode values
    return Object.values(dailyData).map(day => {
      // Calculate average temperature
      const avgTemp = day.temperatures.reduce((sum, temp) => sum + temp, 0) / day.temperatures.length;
      
      // Get most common icon
      const iconCounts = {};
      day.weatherIcons.forEach(icon => {
        iconCounts[icon] = (iconCounts[icon] || 0) + 1;
      });
      
      const mostCommonIcon = Object.entries(iconCounts)
        .sort((a, b) => b[1] - a[1])[0][0];
      
      // Get most common description
      const descriptionCounts = {};
      day.descriptions.forEach(desc => {
        descriptionCounts[desc] = (descriptionCounts[desc] || 0) + 1;
      });
      
      const mostCommonDescription = Object.entries(descriptionCounts)
        .sort((a, b) => b[1] - a[1])[0][0];
      
      return {
        date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        temp: Math.round(avgTemp),
        icon: mostCommonIcon,
        description: mostCommonDescription
      };
    }).slice(0, 5); // Limit to 5 days
  };

  // Format time from unix timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Container className="weather-container my-5">
      <h1 className="text-center mb-4">Weather Forecast</h1>
      
      <Row className="justify-content-center mb-4">
        <Col md={6}>
          <Form onSubmit={handleSubmit}>
            <div className="weather-search-bar">
              <Form.Control
                type="text"
                placeholder="Enter city name"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={loading}
              />
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : <FiSearch />}
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
      
      {error && (
        <Row className="justify-content-center mb-4">
          <Col md={6}>
            <div className="alert alert-danger text-center">{error}</div>
          </Col>
        </Row>
      )}
      
      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading weather data...</p>
        </div>
      )}
      
      {weather && !loading && (
        <>
          <Row className="justify-content-center mb-4">
            <Col md={8}>
              <Card className="weather-card current-weather">
                <Card.Body>
                  <div className="current-weather-header">
                    <div>
                      <h2>{weather.name}, {weather.sys.country}</h2>
                      <p className="location-info">
                        <FiMapPin /> {weather.coord.lat.toFixed(2)}°N, {weather.coord.lon.toFixed(2)}°E
                      </p>
                    </div>
                    <div className="weather-icon-large">
                      <img 
                        src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} 
                        alt={weather.weather[0].description} 
                      />
                    </div>
                  </div>
                  
                  <div className="current-weather-main">
                    <div className="temperature-display">
                      <h1>{Math.round(weather.main.temp)}°C</h1>
                      <p>Feels like {Math.round(weather.main.feels_like)}°C</p>
                    </div>
                    <div className="weather-description">
                      <h4>{weather.weather[0].main}</h4>
                      <p>{weather.weather[0].description}</p>
                    </div>
                  </div>
                  
                  <div className="weather-details">
                    <div className="detail-item">
                      <FiDroplet />
                      <span>Humidity: {weather.main.humidity}%</span>
                    </div>
                    <div className="detail-item">
                      <FiWind />
                      <span>Wind: {Math.round(weather.wind.speed * 3.6)} km/h</span>
                    </div>
                    <div className="detail-item">
                      <FiSun />
                      <span>UV Index: Moderate</span>
                    </div>
                    <div className="detail-item">
                      <FiSunrise />
                      <span>Sunrise: {formatTime(weather.sys.sunrise)}</span>
                    </div>
                    <div className="detail-item">
                      <FiSunset />
                      <span>Sunset: {formatTime(weather.sys.sunset)}</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <h3 className="text-center mb-3">5-Day Forecast</h3>
          <Row className="justify-content-center">
            <Col md={10}>
              <div className="forecast-container">
                {forecast.map((day, index) => (
                  <Card key={index} className="forecast-day-card">
                    <Card.Body>
                      <h5>{day.date}</h5>
                      <img 
                        src={`http://openweathermap.org/img/wn/${day.icon}@2x.png`} 
                        alt={day.description} 
                      />
                      <h4>{day.temp}°C</h4>
                      <p>{day.description}</p>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Col>
          </Row>
          
          <div className="weather-travel-tips mt-5">
            <h3 className="text-center mb-3">Travel Tips Based on Current Weather</h3>
            <Row className="justify-content-center">
              <Col md={8}>
                <Card>
                  <Card.Body>
                    <h5>What to Pack</h5>
                    <ul>
                      {weather.main.temp < 10 && (
                        <>
                          <li>A warm coat or jacket</li>
                          <li>Gloves and a hat</li>
                          <li>Layered clothing</li>
                        </>
                      )}
                      {weather.main.temp >= 10 && weather.main.temp < 20 && (
                        <>
                          <li>A light jacket or sweater</li>
                          <li>Long-sleeved shirts</li>
                          <li>Comfortable pants</li>
                        </>
                      )}
                      {weather.main.temp >= 20 && (
                        <>
                          <li>Light, breathable clothing</li>
                          <li>Sunscreen and sunglasses</li>
                          <li>A hat for sun protection</li>
                        </>
                      )}
                      {weather.weather[0].main.toLowerCase().includes('rain') && (
                        <>
                          <li>Umbrella or raincoat</li>
                          <li>Waterproof shoes</li>
                        </>
                      )}
                    </ul>
                    
                    <h5>Activity Recommendations</h5>
                    <ul>
                      {weather.main.temp >= 20 && !weather.weather[0].main.toLowerCase().includes('rain') && (
                        <>
                          <li>Perfect weather for outdoor sightseeing</li>
                          <li>Visit local parks or beaches</li>
                          <li>Enjoy outdoor dining</li>
                        </>
                      )}
                      {weather.weather[0].main.toLowerCase().includes('rain') && (
                        <>
                          <li>Explore indoor attractions like museums and galleries</li>
                          <li>Enjoy local cafes or restaurants</li>
                          <li>Visit shopping centers or local markets</li>
                        </>
                      )}
                      {weather.main.temp < 10 && (
                        <>
                          <li>Visit indoor attractions and museums</li>
                          <li>Enjoy local cuisine at restaurants</li>
                          <li>Check out shopping districts</li>
                        </>
                      )}
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        </>
      )}
    </Container>
  );
};

export default WeatherPage;
