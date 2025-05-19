import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faStar } from '@fortawesome/free-solid-svg-icons';
import ReliableImage from '../components/common/ReliableImage';
import { getNearbyAttractions } from '../services/locationService';
import '../styles/Recommendations.css';

const BasicRecommendations = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadPlaces = async () => {
      try {
        setLoading(true);
        // Default coordinates (Islamabad)
        const coords = { latitude: 33.6844, longitude: 73.0479 };
        console.log("Fetching nearby attractions...");
        const data = await getNearbyAttractions(coords);
        console.log("Received places:", data);
        setPlaces(data || []);
      } catch (error) {
        console.error("Error loading places:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPlaces();
  }, []);
  
  // Create a simple rating stars renderer
  const renderRatingStars = (rating = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="text-warning">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="text-warning">☆</span>);
      } else {
        stars.push(<span key={i} className="text-muted">☆</span>);
      }
    }
    
    return stars;
  };
  
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading recommendations...</p>
      </div>
    );
  }
  
  return (
    <div className="container py-4">
      <h1 className="mb-4">Nearby Places ({places.length})</h1>
      
      {places.length === 0 ? (
        <div className="alert alert-info">
          No places found. Please try again later.
        </div>
      ) : (
        <div className="place-cards">
          {places.map(place => (
            <div key={place.id} className="card mb-4 place-card">
              <div className="row g-0">
                <div className="col-md-4 position-relative">
                  <div className="place-image-wrapper" style={{ height: '100%', minHeight: '180px' }}>
                    <ReliableImage
                      src={place.imageUrl}
                      alt={place.name}
                      className="img-fluid h-100"
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      category={place.category}
                    />
                    <span className="category-badge">
                      {place.category}
                    </span>
                  </div>
                </div>
                
                <div className="col-md-8">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <h5 className="card-title">{place.name}</h5>
                      <div className="place-rating">{renderRatingStars(place.rating)}</div>
                    </div>
                    
                    <p className="card-text place-description">
                      {place.description?.substring(0, 120) || "No description available"}
                      {place.description?.length > 120 ? '...' : ''}
                    </p>
                    
                    {place.address && (
                      <p className="card-text small mb-2">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1 text-muted" />
                        {place.address}
                      </p>
                    )}
                    
                    {place.tags && place.tags.length > 0 && (
                      <div className="place-tags mb-3">
                        {place.tags.map((tag, i) => (
                          <span key={i} className="badge bg-light text-dark me-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-2 d-flex justify-content-between">
                      <button className="btn btn-sm btn-outline-primary">
                        <FontAwesomeIcon icon={faStar} className="me-1" />
                        Save to Wishlist
                      </button>
                      
                      <Link 
                        to={`/destination/${place.id}`} 
                        className="btn btn-sm btn-outline-secondary"
                      >
                        View on Map
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BasicRecommendations;