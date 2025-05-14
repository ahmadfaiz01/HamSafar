import React, { useEffect, useState } from 'react';
import '../../styles/ItineraryMap.css';

const ItineraryMap = ({ destinations }) => {
  // Removed unused 'days' parameter
  const [mapUrl, setMapUrl] = useState('');
  
  useEffect(() => {
    // Generate a map URL for the destinations
    if (destinations && destinations.length > 0) {
      // This would ideally use a mapping API like Google Maps or Mapbox
      // For this example, we'll use a placeholder image
      generateMapUrl();
    }
  }, [destinations]);
  
  const generateMapUrl = () => {
    // In a real implementation, you would generate a map with the route between destinations
    // For now, we'll use a placeholder map image of Pakistan
    setMapUrl('https://geology.com/world/pakistan-satellite-image.jpg');
    
    // For actual implementation with Google Maps:
    // const baseUrl = 'https://www.google.com/maps/embed/v1/directions';
    // const apiKey = 'YOUR_API_KEY';
    // const origin = `${destinations[0].name}, Pakistan`;
    // const destination = `${destinations[destinations.length - 1].name}, Pakistan`;
    // const waypoints = destinations.slice(1, -1).map(d => d.name + ', Pakistan').join('|');
    // 
    // const url = `${baseUrl}?key=${apiKey}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&waypoints=${encodeURIComponent(waypoints)}&mode=driving`;
    // setMapUrl(url);
  };
  
  if (!destinations || destinations.length === 0) {
    return (
      <div className="empty-map">
        <h3>No Destinations Added</h3>
        <p>Add destinations to your itinerary to see them on the map.</p>
      </div>
    );
  }
  
  return (
    <div className="itinerary-map-container">
      <div className="map-header">
        <h2>Trip Map</h2>
        <p>Route: {destinations.map(d => d.name).join(' → ')}</p>
      </div>
      
      <div className="map-view">
        {mapUrl ? (
          <img 
            src={mapUrl} 
            alt="Trip Map" 
            className="map-image" 
          />
        ) : (
          <div className="map-loading">Loading map...</div>
        )}
      </div>
      
      <div className="destinations-list">
        <h3>Destinations</h3>
        <div className="map-destinations">
          {destinations.map((dest, index) => (
            <div key={index} className="map-destination-item">
              <span className="destination-number">{index + 1}</span>
              <div className="destination-details">
                <div className="destination-name">{dest.name}</div>
                <div className="destination-location">{dest.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* In a real implementation, you would include an interactive map here */}
      <div className="map-disclaimer">
        <p>Note: This is a placeholder map. In a real implementation, this would be an interactive map showing the route between destinations.</p>
      </div>
    </div>
  );
};

export default ItineraryMap;
