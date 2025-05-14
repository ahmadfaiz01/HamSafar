import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { FiCrosshair, FiFilter } from 'react-icons/fi';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/MapView.css';
import { getNearbyPointsOfInterest, saveUserLocation } from '../../services/mapService';
import MapDetailPanel from './MapDetailPanel';
import MapFilters from './MapFilters';
import { useAuth } from '../../context/AuthContext';

/* eslint-disable react-hooks/exhaustive-deps */

// Fix for marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Create custom markers for different POI categories
const createCategoryIcon = (category) => {
  let color = '#3388FF'; // default blue
  
  switch (category) {
    case 'restaurant': color = '#E74C3C'; break; // red
    case 'hotel': color = '#8E44AD'; break; // purple
    case 'attraction': color = '#2ECC71'; break; // green
    case 'shopping': color = '#F39C12'; break; // orange
    case 'transport': color = '#3498DB'; break; // light blue
    default: color = '#3388FF'; break;
  }
  
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="background-color: ${color}"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

// Component to handle map location and events
const MapController = ({ onLocationFound, onBoundsChange }) => {
  const map = useMap();
  
  // Center map on user's location
  const handleGetCurrentLocation = () => {
    map.locate({ setView: true, maxZoom: 16 });
  };
  
  useEffect(() => {
    map.on('locationfound', (e) => {
      if (onLocationFound) {
        onLocationFound([e.latlng.lng, e.latlng.lat]);
      }
    });
    
    map.on('locationerror', (e) => {
      console.error('Error getting location:', e.message);
      alert('Unable to access your location. Please check your permissions.');
    });
    
    map.on('moveend', () => {
      const bounds = map.getBounds();
      if (onBoundsChange) {
        onBoundsChange({
          sw_lng: bounds.getSouthWest().lng,
          sw_lat: bounds.getSouthWest().lat,
          ne_lng: bounds.getNorthEast().lng,
          ne_lat: bounds.getNorthEast().lat,
        });
      }
    });
    
    // Initial location request
    handleGetCurrentLocation();
    
    return () => {
      map.off('locationfound');
      map.off('locationerror');
      map.off('moveend');
    };
  }, [map, onLocationFound, onBoundsChange]);
  
  return (
    <div className="map-controls">
      <button 
        className="location-btn" 
        onClick={handleGetCurrentLocation}
        title="Get current location"
      >
        <FiCrosshair />
      </button>
    </div>
  );
};

const MapView = () => {
  const { currentUser } = useAuth();
  const [points, setPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [filters, setFilters] = useState({
    categories: [],
    price: [],
    rating: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const handleLocationFound = async (coordinates) => {
    try {
      // Save user location to database
      if (currentUser) {
        await saveUserLocation({
          userId: currentUser.uid,
          latitude: coordinates[1],  // Latitude
          longitude: coordinates[0], // Longitude
          timestamp: new Date().toISOString()
        });
      }
      
      // Fetch nearby points - update to use correct function name
      const nearbyPoints = await getNearbyPointsOfInterest(
        coordinates[0], // Longitude
        coordinates[1], // Latitude
        5000 // 5km radius
      );
      
      setPoints(nearbyPoints);
    } catch (error) {
      console.error('Error handling location:', error);
    }
  };
  
  const handleBoundsChange = async (bounds) => {
    try {
      // Get points within current map bounds
      const pointsInBounds = await getNearbyPointsOfInterest({
        ...bounds,
        ...getActiveFilters()
      });
      
      setPoints(pointsInBounds);
    } catch (error) {
      console.error('Error fetching points in bounds:', error);
    }
  };
  
  const getActiveFilters = () => {
    const activeFilters = {};
    
    if (filters.categories.length > 0) {
      activeFilters.category = filters.categories;
    }
    
    if (filters.price.length > 0) {
      activeFilters.price = filters.price;
    }
    
    if (filters.rating > 0) {
      activeFilters.rating = filters.rating;
    }
    
    return activeFilters;
  };
  
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setShowFilters(false);
    
    // Refresh points with new filters
    const map = document.querySelector('.leaflet-container')?._leaflet_map;
    if (map) {
      const bounds = map.getBounds();
      handleBoundsChange({
        sw_lng: bounds.getSouthWest().lng,
        sw_lat: bounds.getSouthWest().lat,
        ne_lng: bounds.getNorthEast().lng,
        ne_lat: bounds.getNorthEast().lat,
      });
    }
  };
  
  return (
    <div className="map-container">
      <MapContainer
        center={[0, 0]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController
          onLocationFound={handleLocationFound}
          onBoundsChange={handleBoundsChange}
        />
        
        {points.map((point) => (
          <Marker
            key={point._id}
            position={[point.location.coordinates[1], point.location.coordinates[0]]}
            icon={createCategoryIcon(point.category)}
            eventHandlers={{
              click: () => setSelectedPoint(point)
            }}
          >
            <Popup>
              <div>
                <h4>{point.name}</h4>
                <p>{point.category}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <button 
        className="filter-toggle" 
        onClick={() => setShowFilters(!showFilters)}
      >
        <FiFilter /> Filters
      </button>
      
      {showFilters && (
        <MapFilters 
          filters={filters} 
          onApply={handleApplyFilters} 
          onClose={() => setShowFilters(false)}
        />
      )}
      
      {selectedPoint && (
        <MapDetailPanel 
          point={selectedPoint} 
          onClose={() => setSelectedPoint(null)}
        />
      )}
    </div>
  );
};

export default MapView;