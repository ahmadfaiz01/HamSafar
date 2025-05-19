import React, { useState } from 'react';

const ReliableImage = ({ src, alt, className, style, category = 'place' }) => {
  const [error, setError] = useState(false);
  
  // Generate a colored SVG placeholder when image fails to load
  const getBackupImage = () => {
    // Define colors and text based on category
    let color = '#e9ecef';
    let textColor = '#6c757d';
    
    switch(category?.toLowerCase()) {
      case 'restaurant':
        color = '#FF5722';
        break;
      case 'historical':
        color = '#9C27B0';
        break;
      case 'religious':
        color = '#FFC107';
        break;
      case 'testing':
        color = '#607D8B';
        break;
      default:
        color = '#2196F3';
    }
    
    // Create a data URI for the SVG
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='${color.replace('#', '%23')}'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='${textColor.replace('#', '%23')}'%3E${category || 'Image'}%3C/text%3E%3C/svg%3E`;
  };

  return (
    <img
      src={error ? getBackupImage() : src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setError(true)}
    />
  );
};

export default ReliableImage;