import React from 'react';
import { FiRefreshCw, FiCrosshair } from 'react-icons/fi';
import '../../styles/MapControls.css';

const MapControls = ({ onRefresh, onGeolocate }) => {
  return (
    <div className="map-controls-container">
      <button 
        className="map-control-btn refresh-btn" 
        onClick={onRefresh}
        title="Refresh points of interest"
      >
        <FiRefreshCw />
      </button>
      
      <button 
        className="map-control-btn geolocate-btn" 
        onClick={onGeolocate}
        title="Go to my location"
      >
        <FiCrosshair />
      </button>
    </div>
  );
};

export default MapControls;
