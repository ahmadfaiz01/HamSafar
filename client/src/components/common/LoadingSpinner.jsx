import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-overlay">
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p>Hang On...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;