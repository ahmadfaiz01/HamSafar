import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { saveUserLocation, getNearbyPointsOfInterest, getPointsInBounds } from '../services/mapService';
import MapFilterPanel from '../components/map/MapFilterPanel';
import MapDetailPanel from '../components/map/MapDetailPanel';
import MapControls from '../components/map/MapControls';
import '../styles/ExploreMap.css';

// Use environment variable with fallback token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

const ExploreMap = () => {
  const { currentUser } = useAuth();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(77.2090); // Default to Delhi coordinates
  const [lat, setLat] = useState(28.6139); // Default to Delhi coordinates
  const [zoom] = useState(13);
  const [pointsOfInterest, setPointsOfInterest] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapInitialized, setMapInitialized] = useState(false);

  // Store functions in refs to avoid circular dependencies
  const loadNearbyPointsRef = useRef(async (longitude, latitude) => {
    try {
      // Filter by category if active filters are set
      const category = activeFilters.length === 1 ? activeFilters[0] : null;
      
      console.log(`Fetching nearby points at ${longitude}, ${latitude}`);
      const nearby = await getNearbyPointsOfInterest(
        longitude, 
        latitude, 
        5000, // 5km radius
        category
      );
      
      console.log(`Found ${nearby.length} points of interest`);
      setPointsOfInterest(nearby);
    } catch (err) {
      console.error('Error loading nearby points:', err);
      setError('Failed to load points of interest');
    }
  });

  // Update the ref whenever activeFilters changes
  useEffect(() => {
    loadNearbyPointsRef.current = async (longitude, latitude) => {
      try {
        // Filter by category if active filters are set
        const category = activeFilters.length === 1 ? activeFilters[0] : null;
        
        console.log(`Fetching nearby points at ${longitude}, ${latitude}`);
        const nearby = await getNearbyPointsOfInterest(
          longitude, 
          latitude, 
          5000, // 5km radius
          category
        );
        
        console.log(`Found ${nearby.length} points of interest`);
        setPointsOfInterest(nearby);
      } catch (err) {
        console.error('Error loading nearby points:', err);
        setError('Failed to load points of interest');
      }
    };
  }, [activeFilters]);
  
  // Define getUserLocation using useCallback with console logs for debugging
  const getUserLocation = useCallback(() => {
    console.log("Getting user location");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log("Geolocation success:", position.coords);
          const { longitude, latitude } = position.coords;
          
          setLng(longitude);
          setLat(latitude);
          
          if (map.current) {
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: 13,
              essential: true // this animation is considered essential for the user experience
            });
          }
          
          // Save user location if logged in
          if (currentUser) {
            try {
              console.log("Saving user location to database");
              await saveUserLocation({
                userId: currentUser.uid,
                latitude: latitude,
                longitude: longitude,
                timestamp: new Date().toISOString()
              });
            } catch (err) {
              console.error('Error saving user location:', err);
            }
          }
          
          // Use the ref function to load nearby points
          console.log("Loading nearby points after location update");
          await loadNearbyPointsRef.current(longitude, latitude);
          
          setLoading(false);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError(`Failed to get your location: ${err.message}. Please enable location access.`);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds
          maximumAge: 0 // don't use cached position
        }
      );
    } else {
      console.error('Geolocation not supported');
      setError('Geolocation is not supported by your browser');
      setLoading(false);
    }
  }, [currentUser]); 

  // Initialize map when component mounts
  useEffect(() => {
    console.log("Map initialization effect running");
    
    if (!mapContainer.current || mapInitialized) return;
    
    console.log("Creating new map instance");
    // Create the map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom,
      attributionControl: false
    });

    // Add map controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.AttributionControl(), 'bottom-right');
    
    // Add geolocation control
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });
    
    map.current.addControl(geolocateControl, 'top-right');
    
    // Setup map event handlers
    map.current.on('load', () => {
      console.log("Map loaded");
      
      // Add points of interest source
      map.current.addSource('points-of-interest', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });
      
      // Add POI layer
      map.current.addLayer({
        id: 'poi-points',
        type: 'circle',
        source: 'points-of-interest',
        paint: {
          'circle-radius': 8,
          'circle-color': [
            'match',
            ['get', 'category'],
            'restaurant', '#FF5A5F',
            'hotel', '#007A87',
            'attraction', '#FFAF0F',
            'shopping', '#7B0051',
            'transport', '#00A699',
            '#4D5156' // default color
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });
      
      // Handle click on POI
      map.current.on('click', 'poi-points', (e) => {
        const feature = e.features[0];
        console.log("Clicked on feature:", feature);
        
        // Find the POI in our state
        const poi = pointsOfInterest.find(p => p._id === feature.properties.id);
        if (poi) {
          setSelectedPoint(poi);
        }
      });
      
      // Change cursor on hover
      map.current.on('mouseenter', 'poi-points', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });
      
      map.current.on('mouseleave', 'poi-points', () => {
        map.current.getCanvas().style.cursor = '';
      });
      
      // Load POIs on map move
      map.current.on('moveend', () => {
        const bounds = map.current.getBounds();
        loadPointsInView(bounds);
      });
      
      // Manually trigger geolocation after map is ready
      console.log("Calling getUserLocation after map load");
      getUserLocation();
      
      // Listen for when the geolocate control is triggered
      geolocateControl.on('geolocate', (e) => {
        console.log("Geolocate event triggered:", e);
        const { longitude, latitude } = e.coords;
        loadNearbyPointsRef.current(longitude, latitude);
      });
    });

    setMapInitialized(true);
    
    return () => {
      if (map.current) {
        console.log("Cleaning up map");
        map.current.remove();
      }
    };
  }, [getUserLocation, lng, lat, zoom, loadPointsInView, mapInitialized, pointsOfInterest]);
  
  // Update POIs on the map when pointsOfInterest state changes
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded() && pointsOfInterest.length > 0) {
      console.log(`Updating map with ${pointsOfInterest.length} points`);
      
      // Convert POIs to GeoJSON format
      const features = pointsOfInterest
        .filter(poi => activeFilters.length === 0 || activeFilters.includes(poi.category))
        .map(poi => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: poi.location.coordinates
          },
          properties: {
            id: poi._id,
            name: poi.name,
            category: poi.category,
            description: poi.description || '',
            rating: poi.rating || 0,
            price: poi.price || 0
          }
        }));
      
      // Update the source data
      const source = map.current.getSource('points-of-interest');
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features
        });
      }
    }
  }, [pointsOfInterest, activeFilters]);

  const loadPointsInView = useCallback(async (bounds) => {
    try {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      
      // Filter by category if active filters are set
      const category = activeFilters.length === 1 ? activeFilters[0] : null;
      
      console.log(`Loading points in view: SW(${sw.lng}, ${sw.lat}) NE(${ne.lng}, ${ne.lat})`);
      const points = await getPointsInBounds(
        sw.lng,
        sw.lat,
        ne.lng,
        ne.lat,
        category
      );
      
      console.log(`Found ${points.length} points in current view`);
      if (points.length > 0) {
        setPointsOfInterest(points);
      }
    } catch (err) {
      console.error('Error loading points in view:', err);
    }
  }, [activeFilters]);
  
  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };
  
  const handleCloseDetail = () => {
    setSelectedPoint(null);
  };
  
  const handleRefresh = () => {
    if (map.current) {
      const center = map.current.getCenter();
      console.log(`Refreshing map at: ${center.lng}, ${center.lat}`);
      loadNearbyPointsRef.current(center.lng, center.lat);
    }
  };

  return (
    <div className="explore-map-container">
      <MapFilterPanel 
        onFilterChange={handleFilterChange} 
        activeFilters={activeFilters}
      />
      
      <div ref={mapContainer} className="map-view" />
      
      <MapControls 
        onRefresh={handleRefresh}
        onGeolocate={getUserLocation}
      />
      
      {selectedPoint && (
        <MapDetailPanel 
          point={selectedPoint} 
          onClose={handleCloseDetail}
        />
      )}
      
      {loading && <div className="map-loading">Loading map...</div>}
      {error && <div className="map-error">{error}</div>}
    </div>
  );
};

export default ExploreMap;