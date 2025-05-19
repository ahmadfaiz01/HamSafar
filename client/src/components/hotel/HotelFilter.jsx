import React from 'react';

const HotelFilter = ({ filters, handleFilterChange, toggleAmenity }) => {
  const amenitiesList = [
    'Free Wi-Fi', 'Parking', 'Pool', 'Fitness Center', 
    'Restaurant', 'Spa', 'Air Conditioning', 'Room Service', 
    'Breakfast', 'Airport Shuttle', 'Bar'
  ];

  return (
    <div className="hotel-filter">
      <h4 className="filter-heading">Filters</h4>
      
      {/* Price Range Filter */}
      <div className="filter-section">
        <h5 className="filter-title">Price Range</h5>
        <div className="price-range">
          <div className="price-slider">
            <input
              type="range"
              min="0"
              max="50000"
              step="1000"
              value={filters.priceRange[1]}
              onChange={(e) => handleFilterChange('priceRange', [0, parseInt(e.target.value)])}
              className="form-range"
            />
          </div>
          <div className="price-inputs d-flex justify-content-between">
            <span>Rs. 0</span>
            <span>Rs. {filters.priceRange[1]}</span>
          </div>
        </div>
      </div>
      
      {/* Rating Filter - FIX HERE */}
      <div className="filter-section">
        <h5 className="filter-title">Rating</h5>
        <div className="rating-options">
          {/* Add d-flex to make stars display horizontally */}
          <div className="rating-option d-flex align-items-center" onClick={() => handleFilterChange('rating', 4)}>
            <input
              type="radio"
              id="rating-4"
              name="rating"
              checked={filters.rating === 4}
              onChange={() => {}}
              className="me-2"
            />
            <label htmlFor="rating-4" className="d-flex align-items-center">
              <div className="stars d-flex">
                {[1, 2, 3, 4].map((star) => (
                  <i key={star} className="fas fa-star text-warning"></i>
                ))}
                <i className="far fa-star text-warning"></i>
                <span className="ms-2">& up</span>
              </div>
            </label>
          </div>
          
          <div className="rating-option d-flex align-items-center" onClick={() => handleFilterChange('rating', 3)}>
            <input
              type="radio"
              id="rating-3"
              name="rating"
              checked={filters.rating === 3}
              onChange={() => {}}
              className="me-2"
            />
            <label htmlFor="rating-3" className="d-flex align-items-center">
              <div className="stars d-flex">
                {[1, 2, 3].map((star) => (
                  <i key={star} className="fas fa-star text-warning"></i>
                ))}
                {[1, 2].map((star) => (
                  <i key={star} className="far fa-star text-warning"></i>
                ))}
                <span className="ms-2">& up</span>
              </div>
            </label>
          </div>
          
          <div className="rating-option d-flex align-items-center" onClick={() => handleFilterChange('rating', 2)}>
            <input
              type="radio"
              id="rating-2"
              name="rating"
              checked={filters.rating === 2}
              onChange={() => {}}
              className="me-2"
            />
            <label htmlFor="rating-2" className="d-flex align-items-center">
              <div className="stars d-flex">
                {[1, 2].map((star) => (
                  <i key={star} className="fas fa-star text-warning"></i>
                ))}
                {[1, 2, 3].map((star) => (
                  <i key={star} className="far fa-star text-warning"></i>
                ))}
                <span className="ms-2">& up</span>
              </div>
            </label>
          </div>
          
          <div className="rating-option d-flex align-items-center" onClick={() => handleFilterChange('rating', 0)}>
            <input
              type="radio"
              id="rating-any"
              name="rating"
              checked={filters.rating === 0}
              onChange={() => {}}
              className="me-2"
            />
            <label htmlFor="rating-any">Any Rating</label>
          </div>
        </div>
      </div>
      
      {/* Amenities Filter */}
      <div className="filter-section">
        <h5 className="filter-title">Amenities</h5>
        <div className="amenities-list">
          {["Free Wifi", "Pool", "Gym", "Restaurant", "Parking", "Room Service"].map((amenity) => (
            <div key={amenity} className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id={`amenity-${amenity}`}
                checked={filters.amenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
              />
              <label className="form-check-label" htmlFor={`amenity-${amenity}`}>
                {amenity}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HotelFilter;