/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { getNearbyAttractions, addToWishlist } from '../services/locationService';
import { getUserProfile } from '../services/userService';
import { getAuth } from 'firebase/auth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Recommendations.css';

// Fix Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom icons for different categories
const createCategoryIcon = (category) => {
  const iconMap = {
    'restaurant': 'utensils',
    'cafe': 'coffee',
    'park': 'tree',
    'museum': 'landmark',
    'shopping': 'shopping-bag',
    'attraction': 'map-marker-alt',
    'entertainment': 'ticket-alt',
    'beach': 'umbrella-beach',
    'mountain': 'mountain',
    'historical': 'monument',
  };

  const iconName = iconMap[category.toLowerCase()] || 'map-pin';
  const iconColor = getCategoryColor(category);

  return L.divIcon({
    html: `<i class="fas fa-${iconName}" style="color: ${iconColor}; font-size: 24px; text-shadow: 2px 2px 3px rgba(0,0,0,0.3);"></i>`,
    className: 'custom-marker-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

// Get color based on category
function getCategoryColor(category) {
  const colorMap = {
    'restaurant': '#FF5722',
    'cafe': '#795548',
    'park': '#4CAF50',
    'museum': '#673AB7',
    'shopping': '#E91E63',
    'attraction': '#2196F3',
    'entertainment': '#FF9800',
    'beach': '#00BCD4',
    'mountain': '#607D8B',
    'historical': '#9C27B0',
  };

  return colorMap[category.toLowerCase()] || '#3F51B5';
}

const Recommendations = () => {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mapCenter, setMapCenter] = useState([33.6844, 73.0479]); // Default: Islamabad
  const [mapZoom, setMapZoom] = useState(13);
  const [userCoords, setUserCoords] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const cityCoordinates = {
    islamabad: { latitude: 33.6844, longitude: 73.0479 },
    rahimyarkhan: { latitude: 28.4212, longitude: 70.2989 },
    lahore: { latitude: 31.5204, longitude: 74.3587 },
    karachi: { latitude: 24.8607, longitude: 67.0011 }
  };

  useEffect(() => {
    const fetchUserProfileAndRecommendations = async () => {
      try {
        setLoading(true);
        
        // Step 1: Get user profile from Firestore (if logged in)
        let profile = null;
        if (currentUser) {
          try {
            profile = await getUserProfile(currentUser.uid);
            setUserProfile(profile);
          } catch (profileError) {
            console.error("Error loading profile:", profileError);
            // Continue even if profile loading fails
          }
        }

        // Step 2: Get user location (from profile or detect current)
        let coords;
        if (profile?.coordinates?.latitude && profile?.coordinates?.longitude) {
          // Use stored coordinates
          coords = {
            latitude: profile.coordinates.latitude,
            longitude: profile.coordinates.longitude
          };
          console.log("Using stored coordinates:", coords);
          setUserCoords(coords);
          setMapCenter([coords.latitude, coords.longitude]);
        } else {
          // Get current location if permission granted
          try {
            coords = await getCurrentLocation();
            console.log("Got current location:", coords);
          } catch (locationError) {
            console.error("Location error:", locationError);
            // getCurrentLocation already handles fallbacks
          }
        }

        // Step 3: Get recommendations based on location and preferences
        if (coords) {
          console.log("Getting attractions with coords:", coords);
          // Use default interests if none in profile
          const interests = profile?.preferences?.interests || ['food', 'nature', 'shopping', 'history'];
          try {
            // IMPORTANT: getNearbyAttractions is no longer async
            const attractions = getNearbyAttractions(coords, interests);
            console.log("Got attractions:", attractions);
            setRecommendations(attractions);
          } catch (attractionsError) {
            console.error("Error getting attractions:", attractionsError);
            toast.error("Could not load recommendations. Using sample data instead.");
            
            // If API call fails, use static mock data
            setRecommendations([
              {
                id: 'faisal-mosque',
                name: "Faisal Mosque",
                category: "Attraction",
                description: "The Faisal Mosque is the national mosque of Pakistan located in Islamabad.",
                coordinates: { latitude: 33.7295, longitude: 73.0372 },
                imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrn3_K9yyFkpcgCvLGH33BGS80-Qz2o7gMGA&s",
                distance: 5600
              },
              {
                id: 'pakistan-monument',
                name: "Pakistan Monument",
                category: "Historical",
                description: "Pakistan Monument is a national monument representing the nation's history.",
                coordinates: { latitude: 33.6936, longitude: 73.0666 },
                imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrn3_K9yyFkpcgCvLGH33BGS80-Qz2o7gMGA&s",
                distance: 1200
              }
            ]);
          }
        }
      } catch (error) {
        console.error('Error loading recommendations:', error);
        toast.error('Could not load recommendations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfileAndRecommendations();
  }, [currentUser]);

  // Get current location using the browser's geolocation API
  const getCurrentLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported by your browser');
        useDefaultLocation(resolve);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const coords = { latitude, longitude };
          setUserCoords(coords);
          setMapCenter([latitude, longitude]);
          console.log("Successfully got user location:", coords);
          resolve(coords);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Could not get your location. Using default location.');
          useDefaultLocation(resolve);
        },
        { 
          timeout: 10000, // 10 seconds
          enableHighAccuracy: true
        }
      );
    });
  };

  const useDefaultLocation = (resolve) => {
    // Use Islamabad as default location
    const defaultCoords = { latitude: 33.6844, longitude: 73.0479 };
    console.log("Using default location:", defaultCoords);
    setUserCoords(defaultCoords);
    setMapCenter([defaultCoords.latitude, defaultCoords.longitude]);
    resolve(defaultCoords);
  };

  // Handle adding a place to wishlist
  const handleAddToWishlist = async (place) => {
    try {
      if (!currentUser) {
        toast.error('Please log in to add to wishlist');
        return;
      }

      await addToWishlist(currentUser.uid, place);
      toast.success(`Added ${place.name} to your wishlist`);

      // Update the recommendations list to show it's in wishlist
      setRecommendations(prevRecs =>
        prevRecs.map(rec =>
          rec.id === place.id ? { ...rec, isInWishlist: true } : rec
        )
      );
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
    }
  };

  // Zoom to a specific recommendation on the map
  const focusOnPlace = (place) => {
    setSelectedPlace(place);
    setMapCenter([place.coordinates.latitude, place.coordinates.longitude]);
    setMapZoom(16);
  };

  // Reset map view to show all recommendations
  const resetMapView = () => {
    if (userCoords) {
      setMapCenter([userCoords.latitude, userCoords.longitude]);
      setMapZoom(13);
    }
    setSelectedPlace(null);
  };
  // Debug Firebase connection
  useEffect(() => {
    console.log("Firebase auth state:", !!currentUser);
    
    // Check if Firebase config is properly loaded
    try {
      const auth = getAuth();
      const authConfig = auth.app.options;
      console.log("Firebase app initialized:", !!authConfig);
    } catch (e) {
      console.error("Error checking Firebase config:", e);
    }
  }, [currentUser]);

  // Fetch recommendations for specific coordinates
  const fetchRecommendationsForCoords = async (coords) => {
    try {
      setLoading(true);
      
      // Get user interests if logged in
      const interests = userProfile?.preferences?.interests || ['food', 'history', 'nature'];
      
      // IMPORTANT: getNearbyAttractions is no longer async
      const attractions = getNearbyAttractions(coords, interests);
      console.log("Got attractions for", coords, ":", attractions);
      setRecommendations(attractions);
    } catch (error) {
      console.error("Error getting attractions:", error);
      toast.error("Could not load recommendations for this location");
    } finally {
      setLoading(false);
    }
  };

  // City selector component
  const CitySelector = () => (
    <div className="city-selector">
      <h3>Choose a city to explore</h3>
      <div className="city-buttons">
        {Object.entries(cityCoordinates).map(([city, coords]) => (
          <button 
            key={city}
            className={`city-button ${selectedCity === city ? 'active' : ''}`}
            onClick={() => {
              setSelectedCity(city);
              setUserCoords(coords);
              setMapCenter([coords.latitude, coords.longitude]);
              fetchRecommendationsForCoords(coords);
            }}
          >
            {city.charAt(0).toUpperCase() + city.slice(1)}
          </button>
        ))}
        <button 
          className={`city-button ${selectedCity === 'current' ? 'active' : ''}`}
          onClick={() => {
            setSelectedCity('current');
            getCurrentLocation();
          }}
        >
          <i className="fas fa-location-arrow"></i> Current Location
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="recommendations-loading-container">
        <LoadingSpinner />
        <h3>Finding places just for you...</h3>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="recommendations-container">
        <div className="recommendations-auth-notice">
          <i className="fas fa-user-lock"></i>
          <h3>Sign in to see personalized recommendations</h3>
          <p>Create an account or log in to discover places based on your interests and location.</p>
          <a href="/login" className="btn-accent">Log in or Sign up</a>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <h1>Places You'll Love</h1> 
        
        <div className="location-info">
          <div className="user-location">
            <i className="fas fa-map-marker-alt"></i>
            <span>{userProfile?.location || 'Using your current location'}</span>
          </div>
          
          <button 
            className="update-location-btn"
            onClick={getCurrentLocation}
          >
            <i className="fas fa-location-arrow"></i>
            Update Location
          </button>
        </div>
      </div>

      {/* Add City Selector */}
      <CitySelector />

      {/* Main content area - map and cards side by side */}
      <div className="recommendations-main-content">
        {/* Map Section - Now takes up the left side */}
        <div className="recommendations-map">
          {userCoords && (
            <>
              <MapContainer 
                center={mapCenter} 
                zoom={mapZoom} 
                style={{ height: '100%', width: '100%', borderRadius: '12px' }}
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* User location marker */}
                <Marker 
                  position={[userCoords.latitude, userCoords.longitude]}
                  icon={L.divIcon({
                    html: `<div class="user-location-marker"><i class="fas fa-user"></i></div>`,
                    className: '',
                    iconSize: [24, 24]
                  })}
                >
                  <Popup>
                    <div className="location-popup">
                      <h4>Your Location</h4>
                      <p>{userProfile?.location || 'Current location'}</p>
                    </div>
                  </Popup>
                </Marker>
                
                {/* Place markers */}
                {recommendations.map(place => (
                  <Marker 
                    key={place.id}
                    position={[place.coordinates.latitude, place.coordinates.longitude]}
                    icon={createCategoryIcon(place.category)}
                  >
                    <Popup>
                      <div className="place-popup">
                        <h3>{place.name}</h3>
                        <div className="place-category">
                          <i className={`fas fa-${getCategoryIcon(place.category)}`}></i>
                          {place.category}
                        </div>
                        <p className="place-description">{place.description.substring(0, 80)}...</p>
                        <div className="popup-actions">
                          <button 
                            className={`wishlist-btn-sm ${place.isInWishlist ? 'in-wishlist' : ''}`}
                            onClick={() => handleAddToWishlist(place)}
                            disabled={place.isInWishlist}
                          >
                            <i className={`${place.isInWishlist ? 'fas' : 'far'} fa-heart`}></i>
                          </button>
                          <button 
                            className="details-btn-sm" 
                            onClick={() => setSelectedPlace(place)}
                          >
                            <i className="fas fa-info-circle"></i>
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
              
              <div className="map-controls">
                <button className="map-control-btn" onClick={resetMapView}>
                  <i className="fas fa-expand-arrows-alt"></i>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Recommendations Cards - Now takes up the right side */}
        <div className="recommendations-list">
          <h2>Recommended Places</h2>
          
          {recommendations.length > 0 ? (
            <div className="recommendations-scroll">
              {recommendations.map(place => (
                <div 
                  key={place.id} 
                  className={`recommendation-card ${selectedPlace?.id === place.id ? 'selected' : ''}`}
                  onClick={() => focusOnPlace(place)}
                >
                  <div className="recommendation-image">
                    {place.imageUrl ? (
                      <img 
                        src={place.imageUrl}
                        alt={place.name}
                        onError={(e) => {
                          e.target.src = '/images/place-placeholder.jpg';
                          e.target.onerror = null;
                        }}
                      />
                    ) : (
                      <div className="placeholder-image">
                        <i className={`fas fa-${getCategoryIcon(place.category)}`}></i>
                      </div>
                    )}
                    <div className="category-badge" style={{ backgroundColor: getCategoryColor(place.category), height: '30px', width: '60px' }}>
                      {place.category}
                    </div>
                  </div>
                  <div className="recommendation-content">
                    <h4>{place.name}</h4>
                    <p className="place-distance">{formatDistance(place.distance)}</p>
                    <p className="place-description">{place.description.substring(0, 80)}...</p>
                    <div className="card-actions">
                      <button 
                        className={`wishlist-btn ${place.isInWishlist ? 'in-wishlist' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToWishlist(place);
                        }}
                        disabled={place.isInWishlist}
                      >
                        <i className={`${place.isInWishlist ? 'fas' : 'far'} fa-heart`}></i>
                        {place.isInWishlist ? 'Saved' : 'Add to Wishlist'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-recommendations">
              <i className="fas fa-map-marked-alt"></i>
              <h3>No places found</h3>
              <p>We couldn't find any recommendations based on your location and preferences.</p>
              <button className="try-again-btn" onClick={getCurrentLocation}>
                Update Location
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get icon for a category
function getCategoryIcon(category) {
  const categoryIcons = {
    'restaurant': 'utensils',
    'cafe': 'coffee',
    'park': 'tree',
    'museum': 'landmark',
    'shopping': 'shopping-bag',
    'attraction': 'map-marked-alt',
    'entertainment': 'ticket-alt',
    'beach': 'umbrella-beach',
    'mountain': 'mountain',
    'historical': 'monument',
  };
  
  return categoryIcons[category.toLowerCase()] || 'map-pin';
}

// Helper function to format distance
function formatDistance(meters) {
  if (meters < 1000) {
    return `${meters.toFixed(0)} meters away`;
  }
  const km = meters / 1000;
  return `${km.toFixed(1)} km away`;
}

export default Recommendations;