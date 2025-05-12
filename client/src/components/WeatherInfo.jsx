// In client/src/components/Weather/WeatherInfo.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Spinner, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './WeatherInfo.css';

const WeatherInfo = ({ city }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city) return;
    
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/weather/${city}`);
        setWeatherData(response.data);
      } catch (err) {
        setError('Failed to fetch weather data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [city]);

  if (loading) return (
    <div className="text-center my-4">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading weather data...</span>
      </Spinner>
    </div>
  );
  
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!weatherData) return null;

  const { main, weather, name } = weatherData;
  
  return (
    <Card className="weather-card">
      <Card.Body>
        <Card.Title>Weather in {name}</Card.Title>
        <div className="weather-content">
          <div className="weather-icon">
            <img 
              src={`http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`} 
              alt={weather[0].description} 
            />
          </div>
          <div className="weather-info">
            <h2 className="temperature">{Math.round(main.temp)}°C</h2>
            <p className="description text-capitalize">{weather[0].description}</p>
            <div className="additional-info">
              <p>Humidity: {main.humidity}%</p>
              <p>Wind: {weatherData.wind.speed} m/s</p>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default WeatherInfo;