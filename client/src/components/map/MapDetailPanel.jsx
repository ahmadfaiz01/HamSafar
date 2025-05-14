import React from 'react';
import { FiX, FiStar, FiPhone, FiGlobe } from 'react-icons/fi';
import '../../styles/MapDetailPanel.css';

const MapDetailPanel = ({ point, onClose }) => {
  if (!point) return null;
  
  const formatPrice = (price) => {
    if (!price) return 'Not available';
    
    switch (price) {
      case 'free':
        return 'Free';
      case '$':
        return 'Inexpensive';
      case '$$':
        return 'Moderate';
      case '$$$':
        return 'Expensive';
      case '$$$$':
        return 'Very Expensive';
      default:
        return price;
    }
  };
  
  return (
    <div className="map-detail-panel">
      <div className="detail-header">
        <h3>{point.name}</h3>
        <button className="close-btn" onClick={onClose}>
          <FiX />
        </button>
      </div>
      
      {point.images && point.images.length > 0 && (
        <div className="detail-image">
          <img src={point.images[0]} alt={point.name} />
        </div>
      )}
      
      <div className="detail-content">
        <div className="detail-rating">
          <FiStar className="star-icon" />
          <span>{point.rating ? `${point.rating} / 5` : 'No ratings'}</span>
        </div>
        
        <div className="detail-category">
          <span className="category-badge">{point.category}</span>
          <span className="price">{formatPrice(point.price)}</span>
        </div>
        
        <p className="detail-description">{point.description}</p>
        
        <div className="detail-address">
          <strong>Address:</strong>
          <p>{point.address}</p>
          <p>{point.city}, {point.country}</p>
        </div>
        
        {point.openingHours && (
          <div className="detail-hours">
            <strong>Opening Hours:</strong>
            <p>{point.openingHours}</p>
          </div>
        )}
        
        <div className="detail-contact">
          {point.phone && (
            <a href={`tel:${point.phone}`} className="contact-link">
              <FiPhone /> {point.phone}
            </a>
          )}
          
          {point.website && (
            <a href={point.website} target="_blank" rel="noopener noreferrer" className="contact-link">
              <FiGlobe /> Website
            </a>
          )}
        </div>
        
        <div className="detail-actions">
          <button className="btn-primary">Add to Trip</button>
          <button className="btn-secondary">Save as Favorite</button>
        </div>
      </div>
    </div>
  );
};

export default MapDetailPanel;