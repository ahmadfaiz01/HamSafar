import React from 'react';
import { Link } from 'react-router-dom';

const HotelCard = ({ hotel, checkIn, checkOut, nights, formatDate }) => {
  // Get rating label
  const getRatingLabel = (rating) => {
    if (rating >= 9) return "Exceptional";
    if (rating >= 8) return "Excellent";
    if (rating >= 7) return "Very Good";
    if (rating >= 6) return "Good";
    return "Fair";
  };

  // Map amenities to icons
  const amenityIcons = {
    "Free Wi-Fi": "fas fa-wifi",
    "Parking": "fas fa-parking",
    "Pool": "fas fa-swimming-pool",
    "Fitness Center": "fas fa-dumbbell",
    "Restaurant": "fas fa-utensils",
    "Spa": "fas fa-spa",
    "Pet Friendly": "fas fa-paw",
    "Airport Shuttle": "fas fa-shuttle-van",
    "Room Service": "fas fa-concierge-bell",
    "Bar": "fas fa-glass-martini-alt",
    "Air Conditioning": "fas fa-snowflake",
    "Breakfast": "fas fa-coffee"
  };

  return (
    <div className="hotel-card">
      <div className="row g-0">
        <div className="col-md-4">
          <img
            src={hotel.mainImage}
            alt={hotel.name}
            className="hotel-card-img"
          />
        </div>
        <div className="col-md-5">
          <div className="hotel-card-body">
            <div className="hotel-name-rating">
              <h3 className="hotel-name">{hotel.name}</h3>
              <div className="hotel-stars">
                {Array(Math.floor(hotel.rating)).fill(0).map((_, i) => (
                  <i key={i} className="fas fa-star"></i>
                ))}
                {hotel.rating % 1 !== 0 && (
                  <i className="fas fa-star-half-alt"></i>
                )}
              </div>
            </div>
            <p className="hotel-location">
              <i className="fas fa-map-marker-alt"></i> {hotel.city}, {hotel.address}
            </p>
            <div className="hotel-features">
              {hotel.amenities.slice(0, 4).map((amenity, index) => (
                <span key={index} className="hotel-feature">
                  <i className={amenityIcons[amenity] || "fas fa-check"}></i> {amenity}
                </span>
              ))}
              {hotel.amenities.length > 4 && (
                <span className="hotel-feature more-amenities">
                  +{hotel.amenities.length - 4} more
                </span>
              )}
            </div>
            <div className="hotel-description">
              {hotel.description}
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="hotel-card-price">
            <div className="hotel-rating-score">
              <span className="score">{hotel.userRating.toFixed(1)}</span>
              <span className="score-label">
                {getRatingLabel(hotel.userRating)}
              </span>
              <span className="reviews">
                {hotel.reviewCount} reviews
              </span>
            </div>
            
            <div className="hotel-price">
              <div className="price-info">
                <span className="price">Rs. {hotel.price.toLocaleString()}</span>
                <span className="per-night">per night</span>
              </div>
              <div className="total-price">
                Rs. {(hotel.price * nights).toLocaleString()} total
                <span className="nights-count">
                  for {nights} night{nights !== 1 ? 's' : ''} 
                  ({formatDate(checkIn)} to {formatDate(checkOut)})
                </span>
              </div>
            </div>
            
            <Link to={`/hotels/${hotel._id}`} className="btn btn-primary view-deal-btn">
              View Deal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;