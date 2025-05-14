import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import recommendationService from '../../services/recommendationService';
import '../../styles/TravelRecommendations.css';

const TravelRecommendations = () => {
  const { currentUser } = useAuth();
  const [tripRecommendations, setTripRecommendations] = useState([]);
  const [destinationRecommendations, setDestinationRecommendations] = useState([]);
  const [poiRecommendations, setPoiRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch all recommendation types in parallel
        const [trips, destinations, pois] = await Promise.all([
          recommendationService.getTripRecommendations(currentUser.uid),
          recommendationService.getDestinationRecommendations(currentUser.uid),
          recommendationService.getPointsOfInterestRecommendations(currentUser.uid)
        ]);
        
        setTripRecommendations(trips);
        setDestinationRecommendations(destinations);
        setPoiRecommendations(pois);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentUser]);

  // Fallback recommendations if personalized ones are not available
  const fallbackRecommendations = [
    {
      id: 'beach',
      title: 'Beach Vacation',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
      description: 'Enjoy sun, sand, and surf at these beautiful beach destinations.'
    },
    {
      id: 'mountain',
      title: 'Mountain Retreat',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
      description: 'Escape to the mountains for fresh air, hiking, and stunning views.'
    },
    {
      id: 'city',
      title: 'City Exploration',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000',
      description: 'Discover the vibrant culture, food, and history of these amazing cities.'
    }
  ];

  if (loading) {
    return (
      <div className="recommendations-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading your personalized recommendations...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="recommendations-container">
        <div className="recommendations-login-prompt">
          <h3>Get Personalized Recommendations</h3>
          <p>Log in to receive travel recommendations tailored to your preferences.</p>
          <Link to="/login" className="btn btn-primary">Log In</Link>
        </div>
        <div className="generic-recommendations">
          <h3>Popular Destinations</h3>
          <div className="recommendation-cards">
            {fallbackRecommendations.map(rec => (
              <div key={rec.id} className="recommendation-card">
                <div className="recommendation-image" style={{ backgroundImage: `url(${rec.image})` }}></div>
                <div className="recommendation-content">
                  <h4>{rec.title}</h4>
                  <p>{rec.description}</p>
                  <Link to="/search" className="btn btn-outline-primary">Explore</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendations-error">
        <div className="alert alert-danger">{error}</div>
        <div className="generic-recommendations">
          <h3>Popular Destinations</h3>
          <div className="recommendation-cards">
            {fallbackRecommendations.map(rec => (
              <div key={rec.id} className="recommendation-card">
                <div className="recommendation-image" style={{ backgroundImage: `url(${rec.image})` }}></div>
                <div className="recommendation-content">
                  <h4>{rec.title}</h4>
                  <p>{rec.description}</p>
                  <Link to="/search" className="btn btn-outline-primary">Explore</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasPersonalizedRecommendations = 
    tripRecommendations.length > 0 || 
    destinationRecommendations.length > 0 || 
    poiRecommendations.length > 0;

  return (
    <div className="recommendations-container">
      <h2>Your Travel Recommendations</h2>
      
      {!hasPersonalizedRecommendations ? (
        <div className="no-recommendations">
          <p>We don't have enough information to provide personalized recommendations yet.</p>
          <p>Update your preferences or browse some destinations to help us understand your travel style.</p>
          <Link to="/profile" className="btn btn-primary">Update Preferences</Link>
          
          <div className="generic-recommendations mt-4">
            <h3>Popular Destinations</h3>
            <div className="recommendation-cards">
              {fallbackRecommendations.map(rec => (
                <div key={rec.id} className="recommendation-card">
                  <div className="recommendation-image" style={{ backgroundImage: `url(${rec.image})` }}></div>
                  <div className="recommendation-content">
                    <h4>{rec.title}</h4>
                    <p>{rec.description}</p>
                    <Link to="/search" className="btn btn-outline-primary">Explore</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Trip recommendations */}
          {tripRecommendations.length > 0 && (
            <div className="recommendations-section">
              <h3>Trip Recommendations</h3>
              <div className="recommendation-cards">
                {tripRecommendations.map(trip => (
                  <div key={trip._id} className="recommendation-card">
                    <div className="recommendation-image" style={{ 
                      backgroundImage: trip.coverImage 
                        ? `url(${trip.coverImage})` 
                        : 'url(https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1)' 
                    }}></div>
                    <div className="recommendation-content">
                      <h4>{trip.title}</h4>
                      <p>{trip.destination.city}, {trip.destination.country}</p>
                      <Link to={`/trips/${trip._id}`} className="btn btn-outline-primary">View Trip</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Destination recommendations */}
          {destinationRecommendations.length > 0 && (
            <div className="recommendations-section">
              <h3>Destination Recommendations</h3>
              <div className="recommendation-cards">
                {destinationRecommendations.map((dest, index) => (
                  <div key={index} className="recommendation-card">
                    <div className="recommendation-image" style={{ 
                      backgroundImage: `url(https://source.unsplash.com/featured/?${dest.city},travel)` 
                    }}></div>
                    <div className="recommendation-content">
                      <h4>{dest.city}</h4>
                      <p>{dest.country}</p>
                      <span className="popularity-badge">{dest.popularity} travelers visited</span>
                      <Link to={`/search?destination=${dest.city}`} className="btn btn-outline-primary">Explore</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* POI recommendations */}
          {poiRecommendations.length > 0 && (
            <div className="recommendations-section">
              <h3>Points of Interest</h3>
              <div className="recommendation-cards">
                {poiRecommendations.map(poi => (
                  <div key={poi._id} className="recommendation-card">
                    <div className="recommendation-image" style={{ 
                      backgroundImage: poi.images && poi.images.length > 0
                        ? `url(${poi.images[0]})` 
                        : `url(https://source.unsplash.com/featured/?${poi.name},attraction)` 
                    }}></div>
                    <div className="recommendation-content">
                      <h4>{poi.name}</h4>
                      <p>{poi.city}, {poi.country}</p>
                      <span className="category-badge">{poi.category}</span>
                      <Link to={`/map?poi=${poi._id}`} className="btn btn-outline-primary">View on Map</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TravelRecommendations;
