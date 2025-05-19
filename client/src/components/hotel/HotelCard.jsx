import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './HotelCard.css';

const HotelCard = ({ hotel, checkIn, checkOut, nights, formatDate }) => {
  const [showContact, setShowContact] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Get images for the card
  const hotelImages = hotel.images && hotel.images.length > 0 
    ? hotel.images 
    : ['https://via.placeholder.com/500x300?text=No+Image+Available'];
  
  // Display only first 4 amenities
  const displayAmenities = hotel.amenities && hotel.amenities.length > 0 
    ? hotel.amenities.slice(0, 4) 
    : ['No amenities listed'];
  
  // Toggle contact info display
  const toggleContactInfo = () => {
    setShowContact(!showContact);
  };
  
  // Handle image navigation
  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => 
      prevIndex === hotelImages.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? hotelImages.length - 1 : prevIndex - 1
    );
  };
  
  return (
    <div className="hotel-card">
      <div className="hotel-image">
        <img src={hotelImages[currentImageIndex]} alt={hotel.name} />
        
        {/* Add image navigation if there are multiple images */}
        {hotelImages.length > 1 && (
          <>
            <div className="image-dots">
              {hotelImages.map((_, index) => (
                <span 
                  key={index} 
                  className={`image-dot ${index === currentImageIndex ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                ></span>
              ))}
            </div>
          </>
        )}
      </div>
      
      <div className="hotel-details">
        <h3 className="hotel-name">{hotel.name}</h3>
        <p className="hotel-location">
          <i className="fas fa-map-marker-alt"></i> {hotel.address}, {hotel.city}
        </p>
        
        <div className="hotel-amenities">
          {displayAmenities.map((amenity, index) => (
            <span key={index} className="amenity-tag">
              {amenity}
            </span>
          ))}
          {hotel.amenities && hotel.amenities.length > 4 && (
            <span className="amenity-tag more">
              +{hotel.amenities.length - 4} more
            </span>
          )}
        </div>
        
        <div className="hotel-rating">
          <span className="rating-score">{hotel.rating?.toFixed(1) || '?'}</span>
          <span className="rating-text">
            {hotel.rating >= 4.5 ? 'Excellent' : 
             hotel.rating >= 4.0 ? 'Very Good' : 
             hotel.rating >= 3.5 ? 'Good' : 
             hotel.rating >= 3.0 ? 'Average' : 'Fair'}
          </span>
        </div>
      </div>
      
      <div className="hotel-price">
        <span className="price">Rs. {hotel.pricePerNight || hotel.price}</span>
        <span className="per-night">per night</span>
        
        {/* Contact info button */}
        <div className="hotel-card-actions">
          <button 
            className="btn-contact-hotel"
            onClick={toggleContactInfo}
          >
            <i className={`fas ${showContact ? 'fa-chevron-up' : 'fa-info-circle'} me-2`}></i>
            {showContact ? 'Hide Contact' : 'Show Contact Info'}
          </button>
        </div>
      </div>
      
      {/* Contact Information Section */}
      {showContact && hotel.contactInfo && (
        <div className="hotel-contact-info">
          <div className="contact-info-container">
            <h4>Contact Information</h4>
            <div className="contact-item">
              <i className="fas fa-phone"></i>
              <span className='contactdetail'>{hotel.contactInfo.phone || 'Phone number not available'}</span>
            </div>
            
            <div className="contact-item">
              <i className="fas fa-envelope"></i>
              <span className='contactdetail'>{hotel.contactInfo.email || 'Email not available'}</span>
            </div>
            
            {hotel.contactInfo.website && (
              <div className="contact-item">
                <i className="fas fa-globe"></i>
                <a 
                  href={hotel.contactInfo.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Visit Website
                </a>
              </div>
            )}
            
            <div className="about-container">
              <h5>About</h5>
              <p className="hotel-description">{hotel.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelCard;