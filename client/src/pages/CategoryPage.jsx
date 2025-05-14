import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategoryRecommendations } from '../services/recommendationApi';
import '../styles/CategoryPage.css';

const CategoryPage = () => {
  const { category } = useParams();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    province: '',
    budget: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoryDestinations = async () => {
      setLoading(true);
      try {
        const data = await getCategoryRecommendations(category);
        setDestinations(data);
        setError(null);
      } catch (err) {
        console.error(`Error loading ${category} destinations:`, err);
        setError('Failed to load destinations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchCategoryDestinations();
    }
  }, [category]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      province: '',
      budget: ''
    });
  };

  const navigateToDestination = (id) => {
    navigate(`/destination/${id}`);
  };

  // Apply filters
  const filteredDestinations = destinations.filter(dest => {
    if (filters.province && dest.location && dest.location.province !== filters.province) {
      return false;
    }
    if (filters.budget && dest.budgetCategory !== filters.budget) {
      return false;
    }
    return true;
  });

  // Get unique provinces for filter
  const provinces = [...new Set(destinations
    .filter(dest => dest.location && dest.location.province)
    .map(dest => dest.location.province))];

  // Category titles and descriptions
  const categoryInfo = {
    beach: {
      title: 'Beach Destinations',
      description: 'Discover the beautiful coastal areas of Pakistan'
    },
    mountain: {
      title: 'Mountain Destinations',
      description: 'Explore Pakistan\'s majestic mountains and valleys'
    },
    city: {
      title: 'City Destinations',
      description: 'Experience the vibrant urban culture of Pakistan'
    },
    historical: {
      title: 'Historical Sites',
      description: 'Journey through Pakistan\'s rich history and heritage'
    },
    rural: {
      title: 'Rural Retreats',
      description: 'Enjoy the peaceful countryside and village life'
    }
  };

  const currentCategoryInfo = categoryInfo[category] || {
    title: 'Destinations',
    description: 'Explore amazing places in Pakistan'
  };

  return (
    <div className="category-page-container">
      <div className={`category-header ${category}`}>
        <h1>{currentCategoryInfo.title}</h1>
        <p>{currentCategoryInfo.description}</p>
      </div>

      <div className="category-content">
        <div className="filter-sidebar">
          <h3>Filter Destinations</h3>
          
          <div className="filter-group">
            <label>Province</label>
            <select 
              name="province" 
              value={filters.province} 
              onChange={handleFilterChange}
            >
              <option value="">All Provinces</option>
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Budget</label>
            <select 
              name="budget" 
              value={filters.budget} 
              onChange={handleFilterChange}
            >
              <option value="">Any Budget</option>
              <option value="budget">Budget</option>
              <option value="moderate">Moderate</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>
          
          <button 
            className="reset-filters-btn"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>

        <div className="destinations-content">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading destinations...</p>
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : filteredDestinations.length === 0 ? (
            <div className="no-destinations">
              <p>No destinations found matching your filters.</p>
              <button 
                className="reset-filters-btn"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="destinations-grid">
              {filteredDestinations.map(destination => (
                <div 
                  key={destination._id} 
                  className="destination-card"
                  onClick={() => navigateToDestination(destination._id)}
                >
                  <div className="destination-image">
                    <img 
                      src={destination.images && destination.images.length > 0 
                        ? destination.images[0] 
                        : `https://via.placeholder.com/300x200?text=${destination.name}`} 
                      alt={destination.name} 
                    />
                    <div className="destination-categories">
                      {destination.categories && destination.categories.map(cat => (
                        <span key={cat} className={`category-tag ${cat}`}>{cat}</span>
                      ))}
                    </div>
                  </div>
                  <div className="destination-details">
                    <h3>{destination.name}</h3>
                    <p className="destination-location">
                      {destination.location && (
                        `${destination.location.city ? destination.location.city + ', ' : ''}${destination.location.province}`
                      )}
                    </p>
                    <p className="destination-description">
                      {destination.description && (destination.description.short || destination.description)}
                    </p>
                    <div className="destination-budget">
                      {destination.budgetCategory === 'budget' ? '₱' : 
                       destination.budgetCategory === 'moderate' ? '₱₱' : '₱₱₱'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
