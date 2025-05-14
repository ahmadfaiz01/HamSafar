import React from 'react';
import { 
  FiFilter, 
  FiMapPin, 
  FiHome, 
  FiCoffee, 
  FiShoppingBag, 
  FiCamera,
  FiTruck
} from 'react-icons/fi';
import '../../styles/MapFilterPanel.css';

const MapFilterPanel = ({ activeFilters, onFilterChange }) => {
  const categories = [
    { id: 'restaurant', name: 'Restaurants', icon: <FiCoffee /> },
    { id: 'hotel', name: 'Hotels', icon: <FiHome /> },
    { id: 'attraction', name: 'Attractions', icon: <FiCamera /> },
    { id: 'shopping', name: 'Shopping', icon: <FiShoppingBag /> },
    { id: 'transport', name: 'Transport', icon: <FiTruck /> },
    { id: 'other', name: 'Other', icon: <FiMapPin /> }
  ];

  const toggleFilter = (categoryId) => {
    if (activeFilters.includes(categoryId)) {
      onFilterChange(activeFilters.filter(c => c !== categoryId));
    } else {
      onFilterChange([...activeFilters, categoryId]);
    }
  };
  
  const clearFilters = () => {
    onFilterChange([]);
  };

  return (
    <div className="map-filter-panel">
      <div className="filter-header">
        <FiFilter />
        <span>Filter</span>
        {activeFilters.length > 0 && (
          <button 
            className="clear-filters" 
            onClick={clearFilters}
          >
            Clear
          </button>
        )}
      </div>
      
      <div className="category-filters">
        {categories.map(category => (
          <div 
            key={category.id}
            className={`category-filter ${activeFilters.includes(category.id) ? 'active' : ''}`}
            onClick={() => toggleFilter(category.id)}
          >
            {category.icon}
            <span>{category.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapFilterPanel;