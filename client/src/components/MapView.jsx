// In client/src/components/Map/MapView.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapView.css';

// Fix for default marker icon in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapView = ({ destinations = [] }) => {
  // Default center if no destinations (New Delhi)
  const defaultCenter = [28.6139, 77.2090];
  const zoom = 10;
  
  // If no destinations are provided, add a default one
  const mapDestinations = destinations.length > 0 
    ? destinations 
    : [{ name: 'New Delhi', lat: defaultCenter[0], lng: defaultCenter[1], description: 'Capital of India' }];
  
  return (
    <div className="map-container">
      <MapContainer 
        center={mapDestinations[0].lat && mapDestinations[0].lng 
          ? [mapDestinations[0].lat, mapDestinations[0].lng] 
          : defaultCenter} 
        zoom={zoom} 
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {mapDestinations.map((destination, index) => (
          destination.lat && destination.lng ? (
            <Marker key={index} position={[destination.lat, destination.lng]}>
              <Popup>
                <div>
                  <h5>{destination.name}</h5>
                  <p>{destination.description}</p>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;