import React from 'react';

const HotelFilter = ({ filters, handleFilterChange, toggleAmenity }) => {
  const amenitiesList = [
    'Free Wi-Fi', 'Parking', 'Pool', 'Fitness Center', 
    'Restaurant', 'Spa', 'Air Conditioning', 'Room Service', 
    'Breakfast', 'Airport Shuttle', 'Bar'
  ];

  return (
    <div className="hotel-filters">
      <div className="filter-section">
        <h4>Price per night (PKR)</h4>
        <input 
          type="range" 
          min="0" 
          max="30000" 
          step="1000"
          value={filters.priceRange[1]} 
          onChange={(e) => handleFilterChange('priceRange', [0, parseInt(e.target.value)])}
          className="form-range"
        />
        <div className="price-range-display">
          <span>Rs. {filters.priceRange[0].toLocaleString()}</span>
          <span>Rs. {filters.priceRange[1].toLocaleString()}</span>
        </div>
      </div>
      
      <div className="filter-section">
        <h4>Star Rating</h4>
        <div className="star-rating-filter">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="form-check">
              <input
                id={`star-${star}`}
                className="form-check-input"
                type="radio"
                name="star-rating"
                checked={filters.rating === star}
                onChange={() => handleFilterChange('rating', star)}
              />
              <label htmlFor={`star-${star}`} className="form-check-label">
                {Array(star).fill(0).map((_, i) => (
                  <i key={i} className="fas fa-star text-warning"></i>
                ))}
                {star === 1 ? ' & up' : ' & up'}
              </label>
            </div>
          ))}
          {filters.rating > 0 && (
            <button 
              className="btn btn-sm btn-link p-0 mt-1"
              onClick={() => handleFilterChange('rating', 0)}
            >
              Clear rating filter
            </button>
          )}
        </div>
      </div>
      
      <div className="filter-section">
        <h4>Amenities</h4>
        {amenitiesList.map((amenity, index) => (
          <div key={index} className="form-check">
            <input
              id={`amenity-${index}`}
              className="form-check-input"
              type="checkbox"
              checked={filters.amenities.includes(amenity)}
              onChange={() => toggleAmenity(amenity)}
            />
            <label htmlFor={`amenity-${index}`} className="form-check-label">
              {amenity}
            </label>
          </div>
        ))}
        {filters.amenities.length > 0 && (
          <button 
            className="btn btn-sm btn-link p-0 mt-1"
            onClick={() => handleFilterChange('amenities', [])}
          >
            Clear amenities
          </button>
        )}
      </div>
    </div>
  );
};

export default HotelFilter;