import React, { useState, useEffect } from 'react';
import { fetchRecommendations, fetchCategoryRecommendations, addToWishlist } from '../utils/recommendationApi';
import '../styles/BasicRecommendations.css';

const BasicRecommendations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    const data = await fetchRecommendations();
    setDestinations(data);
    setLoading(false);
  };

  const handleCategoryClick = async (category) => {
    setLoading(true);
    setActiveCategory(category);
    
    if (category === 'all') {
      await loadRecommendations();
    } else {
      const data = await fetchCategoryRecommendations(category);
      setDestinations(data);
    }
    
    setLoading(false);
  };

  const handleAddToWishlist = async (id) => {
    const success = await addToWishlist(id);
    if (success) {
      alert('Added to wishlist successfully!');
    } else {
      alert('Failed to add to wishlist. Please try again or log in.');
    }
  };

  if (loading) {
    return <div className="rec-loading">Loading recommendations...</div>;
  }

  return (
    <div className="rec-container">
      <h1 className="rec-title">Discover Pakistan</h1>
      
      <div className="rec-categories">
        <button 
          className={`rec-category-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('all')}
        >
          All
        </button>
        <button 
          className={`rec-category-btn ${activeCategory === 'beach' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('beach')}
        >
          Beaches
        </button>
        <button 
          className={`rec-category-btn ${activeCategory === 'mountain' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('mountain')}
        >
          Mountains
        </button>
        <button 
          className={`rec-category-btn ${activeCategory === 'city' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('city')}
        >
          Cities
        </button>
        <button 
          className={`rec-category-btn ${activeCategory === 'historical' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('historical')}
        >
          Historical
        </button>
      </div>
      
      {destinations.length === 0 ? (
        <div className="rec-empty">
          <p>No destinations found. Try a different category.</p>
        </div>
      ) : (
        <div className="rec-grid">
          {destinations.map(dest => (
            <div key={dest._id} className="rec-card">
              <div className="rec-img-container">
                <img 
                  src={dest.images && dest.images.length > 0 ? dest.images[0] : 'https://via.placeholder.com/300x200?text=Pakistan'}
                  alt={dest.name}
                  className="rec-img"
                />
                {dest.categories && dest.categories.length > 0 && (
                  <div className="rec-tags">
                    {dest.categories.map(cat => (
                      <span key={cat} className={`rec-tag ${cat}`}>{cat}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="rec-content">
                <h3 className="rec-name">{dest.name}</h3>
                <p className="rec-location">
                  {dest.location ? dest.location.province : 'Pakistan'}
                </p>
                <p className="rec-description">
                  {dest.description ? 
                    (dest.description.short || dest.description.substring(0, 100) + '...') : 
                    'Discover this amazing destination in Pakistan'}
                </p>
                <div className="rec-actions">
                  <button 
                    className="rec-view-btn"
                    onClick={() => window.location.href = `/destination/${dest._id}`}
                  >
                    View Details
                  </button>
                  <button 
                    className="rec-wishlist-btn"
                    onClick={() => handleAddToWishlist(dest._id)}
                  >
                    + Wishlist
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BasicRecommendations;
