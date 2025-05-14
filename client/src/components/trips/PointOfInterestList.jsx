import React from 'react';
import { FiPlus } from 'react-icons/fi';
import '../../styles/PointOfInterestList.css';

const PointOfInterestList = ({ pointsOfInterest, onSelect }) => {
  if (!pointsOfInterest || pointsOfInterest.length === 0) {
    return (
      <div className="poi-empty-state">
        <p>No recommendations available for this location.</p>
      </div>
    );
  }

  return (
    <div className="poi-list">
      {pointsOfInterest.map((poi, index) => (
        <div key={index} className="poi-item">
          {poi.images && poi.images.length > 0 && (
            <div className="poi-image">
              <img src={poi.images[0]} alt={poi.name} />
            </div>
          )}
          
          <div className="poi-details">
            <h4 className="poi-name">{poi.name}</h4>
            <div className="poi-meta">
              <span className="poi-category">{poi.category}</span>
              {poi.rating && <span className="poi-rating">★ {poi.rating}</span>}
            </div>
            {poi.description && (
              <p className="poi-description">{poi.description.substring(0, 100)}...</p>
            )}
          </div>
          
          <button 
            className="add-poi-button" 
            onClick={() => onSelect(poi)}
            title="Add to itinerary"
          >
            <FiPlus />
          </button>
        </div>
      ))}
    </div>
  );
};

export default PointOfInterestList;