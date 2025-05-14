import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecommendations, getUserPreferences } from '../services/recommendationApi';
import '../styles/RecommendationsPage.css';

const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user preferences if available
        const prefsData = await getUserPreferences();
        setPreferences(prefsData);
        
        // Get recommendations
        const recommData = await getRecommendations();
        setRecommendations(recommData);
        setError(null);
      } catch (err) {
        console.error('Error loading recommendations:', err);
        setError('Failed to load recommendations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const navigateToDestination = (id) => {
    navigate(`/destination/${id}`);
  };

  const exploreCategory = (category) => {
    navigate(`/category/${category}`);
  };

  // Placeholder image URLs for categories
  const categoryImages = {
    beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    mountain: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
    city: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df',
    historical: 'https://images.unsplash.com/photo-1563294723-fac9c0d4928f',
    rural: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef'
  };

  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <h1>Discover Pakistan</h1>
        <p>Explore amazing destinations based on your preferences</p>
      </div>

      {/* User preferences summary if available */}
      {preferences && (
        <div className="preferences-summary">
          <h3>Your Travel Preferences</h3>
          <div className="preferences-tags">
            {preferences.destinationTypes && preferences.destinationTypes.map(type => (
              <span key={type} className="preference-tag">{type}</span>
            ))}
            {preferences.travelStyles && preferences.travelStyles.map(style => (
              <span key={style} className="preference-tag">{style}</span>
            ))}
          </div>
          <button 
            className="update-preferences-btn"
            onClick={() => navigate('/preferences')}
          >
            Update Preferences
          </button>
        </div>
      )}

      {/* Recommended destinations */}
      <div className="recommendations-section">
        <h2>Recommended For You</h2>
        
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading recommendations...</p>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : recommendations.length === 0 ? (
          <div className="no-recommendations">
            <p>No recommendations found. Try exploring different categories below.</p>
            {!preferences && (
              <button 
                className="set-preferences-btn"
                onClick={() => navigate('/preferences')}
              >
                Set Your Preferences
              </button>
            )}
          </div>
        ) : (
          <div className="recommendations-grid">
            {recommendations.map(destination => (
              <div 
                key={destination._id} 
                className="destination-card"
                onClick={() => navigateToDestination(destination._id)}
              >
                <div className="destination-image">
                  <img 
                    src={destination.images && destination.images.length > 0 
                      ? destination.images[0] 
                      : `https://via.placeholder.com/300x200?text=${destination.name}`} 
                    alt={destination.name} 
                  />
                  <div className="destination-categories">
                    {destination.categories && destination.categories.map(cat => (
                      <span key={cat} className={`category-tag ${cat}`}>{cat}</span>
                    ))}
                  </div>
                </div>
                <div className="destination-details">
                  <h3>{destination.name}</h3>
                  <p className="destination-location">
                    {destination.location && (
                      `${destination.location.city ? destination.location.city + ', ' : ''}${destination.location.province}`
                    )}
                  </p>
                  <p className="destination-description">
                    {destination.description && (destination.description.short || destination.description)}
                  </p>
                  <div className="destination-budget">
                    {destination.budgetCategory === 'budget' ? '₱' : 
                     destination.budgetCategory === 'moderate' ? '₱₱' : '₱₱₱'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Explore by category */}
      <div className="categories-section">
        <h2>Explore by Category</h2>
        <div className="categories-grid">
          {['beach', 'mountain', 'city', 'historical', 'rural'].map(category => (
            <div 
              key={category} 
              className="category-card"
              onClick={() => exploreCategory(category)}
            >
              <img 
                src={categoryImages[category]} 
                alt={`${category} destinations`} 
              />
              <div className="category-overlay">
                <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                <button>Explore</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPage;
