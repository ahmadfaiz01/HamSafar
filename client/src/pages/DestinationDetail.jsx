import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDestinationDetails, addToWishlist } from '../services/recommendationApi';
import '../styles/DestinationDetail.css';

const DestinationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [addingToWishlist, setAddingToWishlist] = useState(false);

  useEffect(() => {
    const fetchDestination = async () => {
      setLoading(true);
      try {
        const data = await getDestinationDetails(id);
        setDestination(data);
        setError(null);
      } catch (err) {
        console.error('Error loading destination:', err);
        setError('Failed to load destination details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDestination();
    }
  }, [id]);

  const handleAddToWishlist = async () => {
    try {
      setAddingToWishlist(true);
      await addToWishlist(id);
      alert('Destination added to wishlist successfully!');
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      if (err.message.includes('401')) {
        alert('Please log in to add destinations to your wishlist.');
      } else {
        alert('Failed to add to wishlist. Please try again.');
      }
    } finally {
      setAddingToWishlist(false);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="destination-loading">
        <div className="spinner"></div>
        <p>Loading destination details...</p>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="destination-error">
        <h2>Something went wrong</h2>
        <p>{error || 'Destination not found'}</p>
        <button onClick={goBack}>Go Back</button>
      </div>
    );
  }

  // Format budget for display
  const formatBudget = (budget) => {
    switch (budget) {
      case 'budget':
        return 'Budget-friendly';
      case 'moderate':
        return 'Moderate';
      case 'luxury':
        return 'Luxury';
      default:
        return 'Not specified';
    }
  };

  return (
    <div className="destination-detail-container">
      <div className="destination-header">
        <h1>{destination.name}</h1>
        <p className="destination-location">
          {destination.location && (
            `${destination.location.city ? destination.location.city + ', ' : ''}${destination.location.province}`
          )}
        </p>
      </div>

      <div className="destination-gallery">
        <div className="main-image">
          {destination.images && destination.images.length > 0 ? (
            <img 
              src={destination.images[activeImage]} 
              alt={destination.name} 
            />
          ) : (
            <div className="placeholder-image">No image available</div>
          )}
        </div>
        
        {destination.images && destination.images.length > 1 && (
          <div className="thumbnail-gallery">
            {destination.images.map((image, index) => (
              <div 
                key={index} 
                className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                onClick={() => setActiveImage(index)}
              >
                <img src={image} alt={`${destination.name} view ${index + 1}`} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="destination-categories-bar">
        {destination.categories && destination.categories.map(category => (
          <span 
            key={category} 
            className={`category-badge ${category}`}
            onClick={() => navigate(`/category/${category}`)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </span>
        ))}
      </div>

      <div className="destination-actions">
        <button 
          className="add-wishlist-btn"
          onClick={handleAddToWishlist}
          disabled={addingToWishlist}
        >
          {addingToWishlist ? 'Adding...' : 'Add to Wishlist'}
        </button>
        <button 
          className="back-btn"
          onClick={goBack}
        >
          Back to Recommendations
        </button>
      </div>

      <div className="destination-description">
        <h2>About this Destination</h2>
        <p>
          {destination.description && (destination.description.full || destination.description)}
        </p>
      </div>

      {destination.activities && destination.activities.length > 0 && (
        <div className="destination-activities">
          <h2>Things to Do</h2>
          <ul>
            {destination.activities.map((activity, index) => (
              <li key={index}>{activity}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="destination-details-grid">
        <div className="detail-box">
          <h3>Best Time to Visit</h3>
          <p>
            {destination.bestSeasons && destination.bestSeasons.length > 0
              ? destination.bestSeasons.map(season => 
                  season.charAt(0).toUpperCase() + season.slice(1)
                ).join(', ')
              : 'All year round'}
          </p>
        </div>

        <div className="detail-box">
          <h3>Budget Category</h3>
          <p>{formatBudget(destination.budgetCategory)}</p>
        </div>

        <div className="detail-box">
          <h3>Popularity</h3>
          <div className="popularity-meter" style={{ 
            width: `${Math.min(100, destination.popularity || 75)}%` 
          }}></div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;
