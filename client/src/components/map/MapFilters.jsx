import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import '../../styles/MapFilters.css';

const CATEGORIES = [
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'hotel', label: 'Hotels' },
  { value: 'attraction', label: 'Attractions' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'transport', label: 'Transport' },
  { value: 'other', label: 'Other' }
];

const PRICE_RANGES = [
  { value: 'free', label: 'Free' },
  { value: '$', label: 'Inexpensive' },
  { value: '$$', label: 'Moderate' },
  { value: '$$$', label: 'Expensive' },
  { value: '$$$$', label: 'Very Expensive' }
];

const MapFilters = ({ filters, onApply, onClose }) => {
  const [tempFilters, setTempFilters] = useState({ ...filters });
  
  const handleCategoryChange = (category) => {
    const newCategories = [...tempFilters.categories];
    
    if (newCategories.includes(category)) {
      // Remove category if already selected
      const index = newCategories.indexOf(category);
      newCategories.splice(index, 1);
    } else {
      // Add category if not selected
      newCategories.push(category);
    }
    
    setTempFilters({
      ...tempFilters,
      categories: newCategories
    });
  };
  
  const handlePriceChange = (price) => {
    const newPrices = [...tempFilters.price];
    
    if (newPrices.includes(price)) {
      // Remove price if already selected
      const index = newPrices.indexOf(price);
      newPrices.splice(index, 1);
    } else {
      // Add price if not selected
      newPrices.push(price);
    }
    
    setTempFilters({
      ...tempFilters,
      price: newPrices
    });
  };
  
  const handleRatingChange = (e) => {
    setTempFilters({
      ...tempFilters,
      rating: parseInt(e.target.value, 10)
    });
  };
  
  const handleApply = () => {
    onApply(tempFilters);
  };
  
  const handleReset = () => {
    setTempFilters({
      categories: [],
      price: [],
      rating: 0
    });
  };
  
  return (
    <div className="map-filters">
      <div className="filter-header">
        <h3>Filters</h3>
        <button className="close-btn" onClick={onClose}>
          <FiX />
        </button>
      </div>
      
      <div className="filter-section">
        <h4>Categories</h4>
        <div className="category-filters">
          {CATEGORIES.map(category => (
            <div 
              key={category.value}
              className={`filter-chip ${tempFilters.categories.includes(category.value) ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.value)}
            >
              {category.label}
            </div>
          ))}
        </div>
      </div>
      
      <div className="filter-section">
        <h4>Price Range</h4>
        <div className="price-filters">
          {PRICE_RANGES.map(price => (
            <div 
              key={price.value}
              className={`filter-chip ${tempFilters.price.includes(price.value) ? 'active' : ''}`}
              onClick={() => handlePriceChange(price.value)}
            >
              {price.label}
            </div>
          ))}
        </div>
      </div>
      
      <div className="filter-section">
        <h4>Minimum Rating</h4>
        <div className="rating-filter">
          <input 
            type="range" 
            min="0" 
            max="5" 
            step="1" 
            value={tempFilters.rating} 
            onChange={handleRatingChange}
          />
          <div className="rating-value">{tempFilters.rating} / 5</div>
        </div>
      </div>
      
      <div className="filter-actions">
        <button className="btn-secondary" onClick={handleReset}>Reset</button>
        <button className="btn-primary" onClick={handleApply}>Apply Filters</button>
      </div>
    </div>
  );
};

export default MapFilters;