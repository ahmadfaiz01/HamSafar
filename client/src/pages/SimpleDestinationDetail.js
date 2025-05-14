import React, { useState, useEffect } from 'react';
import { addToWishlist } from '../utils/recommendationApi';
import '../styles/SimpleDestinationDetail.css';

const SimpleDestinationDetail = () => {
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDestination = async () => {
      // Extract ID from URL
      const path = window.location.pathname;
      const id = path.split('/').pop();
      
      if (!id) return;
      
      try {
        const response = await fetch(`/api/recommendations/destinations/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch destination');
        }
        
        const data = await response.json();
        setDestination(data.data);
      } catch (error) {
        console.error('Error fetching destination:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDestination();
  }, []);
  
  const handleAddToWishlist = async () => {
    if (!destination) return;
    
    const success = await addToWishlist(destination._id);
    if (success) {
      alert('Added to wishlist successfully!');
    } else {
      alert('Failed to add to wishlist. Please try again or log in.');
    }
  };
  
  if (loading) {
    return <div className="dest-loading">Loading destination details...</div>;
  }
  
  if (!destination) {
    return <div className="dest-error">Destination not found</div>;
  }
  
  return (
    <div className="dest-container">
      <div className="dest-header">
        <h1 className="dest-title">{destination.name}</h1>
        <p className="dest-location">
          {destination.location ? destination.location.province : 'Pakistan'}
        </p>
      </div>
      
      <div className="dest-image">
        {destination.images && destination.images.length > 0 ? (
          <img 
            src={destination.images[0]} 
            alt={destination.name} 
            className="dest-main-image"
          />
        ) : (
          <div className="dest-placeholder">No image available</div>
        )}
      </div>
      
      <div className="dest-categories">
        {destination.categories && destination.categories.map(category => (
          <span key={category} className={`dest-category ${category}`}>
            {category}
          </span>
        ))}
      </div>
      
      <div className="dest-buttons">
        <button className="dest-wishlist-btn" onClick={handleAddToWishlist}>
          Add to Wishlist
        </button>
        <button className="dest-back-btn" onClick={() => window.history.back()}>
          Back to Recommendations
        </button>
      </div>
      
      <div className="dest-description">
        <h2>About this Destination</h2>
        <p>{destination.description ? 
            (destination.description.full || destination.description) : 
            'No description available.'}
        </p>
      </div>
      
      {destination.activities && destination.activities.length > 0 && (
        <div className="dest-activities">
          <h2>Activities</h2>
          <ul>
            {destination.activities.map((activity, index) => (
              <li key={index}>{activity}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="dest-info-grid">
        <div className="dest-info-box">
          <h3>Best Seasons</h3>
          <p>
            {destination.bestSeasons && destination.bestSeasons.length > 0 
              ? destination.bestSeasons.join(', ') 
              : 'All year round'}
          </p>
        </div>
        
        <div className="dest-info-box">
          <h3>Budget</h3>
          <p>
            {destination.budgetCategory 
              ? destination.budgetCategory.charAt(0).toUpperCase() + destination.budgetCategory.slice(1) 
              : 'Varies'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleDestinationDetail;
