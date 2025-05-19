/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faCoffee, faTree, faLandmark, faShoppingBag, 
         faMapMarkerAlt, faTicketAlt, faUmbrellaBeach, faMountain, 
         faMonument, faQuestionCircle, faStar } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { 
  getCurrentLocation, 
  saveUserCoordinates, 
  getUserCoordinates, 
  getNearbyAttractions, 
  addToWishlist 
} from '../services/locationService';
import { getUserProfile } from '../services/userService';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../styles/Recommendations.css';

// Fix Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const Recommendations = () => {
  // State variables
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState(null);
  const [mapCenter, setMapCenter] = useState([33.6844, 73.0479]); // Default: Islamabad
  const [zoom, setZoom] = useState(12);
  const [recommendations, setRecommendations] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [savingToWishlist, setSavingToWishlist] = useState(false);
  
  // Hooks
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // City coordinates for quick selection
  const cityCoordinates = {
    islamabad: { latitude: 33.6844, longitude: 73.0479 },
    lahore: { latitude: 31.5204, longitude: 74.3587 },
    karachi: { latitude: 24.8607, longitude: 67.0011 },
    peshawar: { latitude: 34.0151, longitude: 71.5249 },
    quetta: { latitude: 30.1798, longitude: 66.9750 },
    multan: { latitude: 30.1575, longitude: 71.5249 }
  };

  // Get user location and recommendations on component mount
  useEffect(() => {
    const fetchUserProfileAndRecommendations = async () => {
      try {
        setLoading(true);
        
        // Step 1: Get user profile from Firestore if logged in
        let profile = null;
        if (currentUser) {
          try {
            profile = await getUserProfile(currentUser.uid);
            setUserProfile(profile);
          } catch (profileError) {
            console.error("Error loading profile:", profileError);
          }
        }

        // Step 2: Get user location (from profile or browser)
        let coords;
        
        // First, try to get stored coordinates from Firestore
        if (profile?.coordinates?.latitude && profile?.coordinates?.longitude) {
          coords = {
            latitude: profile.coordinates.latitude,
            longitude: profile.coordinates.longitude
          };
          console.log("Using stored coordinates:", coords);
          setUserCoords(coords);
          setMapCenter([coords.latitude, coords.longitude]);
        } else {
          // If no stored coordinates, check if we need to show location modal
          if (!currentUser) {
            // For non-logged in users, show location modal
            setLocationModalVisible(true);
          } else {
            // For logged in users without saved location, try to get current location
            try {
              coords = await getCurrentLocation();
              console.log("Got current location:", coords);
              setUserCoords(coords);
              setMapCenter([coords.latitude, coords.longitude]);
              
              // Save coordinates to Firestore
              if (currentUser) {
                await saveUserCoordinates(currentUser.uid, coords);
              }
            } catch (locationError) {
              console.error("Location error:", locationError);
              setLocationModalVisible(true);
            }
          }
        }

        // Step 3: Get recommendations based on location and preferences
        if (coords) {
          console.log("Getting attractions with coords:", coords);
          const interests = profile?.preferences?.interests || ['food', 'nature', 'shopping', 'history'];
          
          try {
            const attractions = await getNearbyAttractions(coords, interests);
            console.log("Got attractions:", attractions);
            setRecommendations(attractions);
          } catch (attractionsError) {
            console.error("Error getting attractions:", attractionsError);
            toast.error("Could not load recommendations. Using sample data instead.");
            
            // Fallback to static data if API call fails
            setRecommendations([
              {
                id: "sample1",
                name: "Faisal Mosque",
                category: "Religious",
                description: "The Faisal Mosque is the national mosque of Pakistan.",
                coordinates: { latitude: 33.7295, longitude: 73.0372 },
                rating: 4.8,
                imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Faisal_Mosque_%28full_view%29.jpg"
              },
              {
                id: "sample2",
                name: "Pakistan Monument",
                category: "Historical",
                description: "The Pakistan Monument is a national monument representing the nation's history.",
                coordinates: { latitude: 33.6936, longitude: 73.0666 },
                rating: 4.7,
                imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/89/Pakistan_Monument_at_Night.jpg"
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

  // Handle city selection
  const handleCitySelect = async (city) => {
    setSelectedCity(city);
    const coords = cityCoordinates[city];
    
    if (coords) {
      setUserCoords(coords);
      setMapCenter([coords.latitude, coords.longitude]);
      
      // Save coordinates to Firestore for logged in users
      if (currentUser) {
        await saveUserCoordinates(currentUser.uid, coords);
      }
      
      // Fetch recommendations for selected city
      try {
        setLoading(true);
        const interests = userProfile?.preferences?.interests || ['food', 'nature', 'shopping', 'history'];
        const attractions = await getNearbyAttractions(coords, interests);
        setRecommendations(attractions);
      } catch (error) {
        console.error("Error getting attractions for city:", error);
        toast.error("Could not load recommendations for this city");
      } finally {
        setLoading(false);
      }
      
      // Close the modal
      setLocationModalVisible(false);
    }
  };

  // Handle getting current location
  const handleGetCurrentLocation = async () => {
    try {
      setLoading(true);
      const coords = await getCurrentLocation();
      
      setUserCoords(coords);
      setMapCenter([coords.latitude, coords.longitude]);
      
      // Save coordinates to Firestore for logged in users
      if (currentUser) {
        await saveUserCoordinates(currentUser.uid, coords);
      }
      
      // Fetch recommendations
      const interests = userProfile?.preferences?.interests || ['food', 'nature', 'shopping', 'history'];
      const attractions = await getNearbyAttractions(coords, interests);
      setRecommendations(attractions);
      
      // Close the modal
      setLocationModalVisible(false);
    } catch (error) {
      console.error("Error getting current location:", error);
      toast.error("Could not get your current location");
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a place to wishlist
  const handleAddToWishlist = async (place) => {
    if (!currentUser) {
      toast.info('Please log in to save to your wishlist');
      navigate('/login');
      return;
    }
    
    try {
      setSavingToWishlist(true);
      await addToWishlist(currentUser.uid, place);
      toast.success(`Added ${place.name} to your wishlist!`);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Could not add to wishlist");
    } finally {
      setSavingToWishlist(false);
    }
  };

  // Create custom marker icon based on category
  const createCategoryIcon = (category = 'default') => {
    const iconColor = getCategoryColor(category);
    
    // Create an SVG directly in JavaScript - no external resources needed
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
          fill="${iconColor}" stroke="white" stroke-width="1.5"/>
        <circle cx="12" cy="9" r="3" fill="white"/>
      </svg>
    `;
    
    // Create a base64 encoded data URL from the SVG
    const encodedSVG = encodeURIComponent(svgString)
      .replace(/'/g, '%27')
      .replace(/"/g, '%22');
      
    const dataUri = `data:image/svg+xml,${encodedSVG}`;
    
    // Use the SVG as an icon
    return L.divIcon({
      html: `<img src="${dataUri}" alt="${category}" width="24" height="36">`,
      className: 'custom-marker-icon',
      iconSize: [24, 36],
      iconAnchor: [12, 36],
      popupAnchor: [0, -36]
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
      'religious': '#FFC107',
      'viewpoint': '#3F51B5'
    };
    
    return colorMap[category.toLowerCase()] || '#757575';
  }

  // Get icon component based on category
  function getCategoryIcon(category) {
    const iconMap = {
      'restaurant': faUtensils,
      'cafe': faCoffee,
      'park': faTree,
      'museum': faLandmark,
      'shopping': faShoppingBag,
      'attraction': faMapMarkerAlt,
      'entertainment': faTicketAlt,
      'beach': faUmbrellaBeach,
      'mountain': faMountain,
      'historical': faMonument,
      'religious': faLandmark,
      'viewpoint': faMountain
    };
    
    return iconMap[category.toLowerCase()] || faQuestionCircle;
  }

  // Render stars based on rating
  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FontAwesomeIcon key={i} icon={faStar} className="text-warning" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FontAwesomeIcon key={i} icon={faStar} className="text-warning" style={{ opacity: 0.5 }} />);
      } else {
        stars.push(<FontAwesomeIcon key={i} icon={faStar} className="text-muted" style={{ opacity: 0.3 }} />);
      }
    }
    
    return stars;
  };

  // Location selection modal
  const LocationModal = () => (
    <div className="location-modal-overlay" onClick={() => setLocationModalVisible(false)}>
      <div className="location-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Choose Your Location</h2>
        <p>We need your location to show you nearby recommendations.</p>
        
        <button className="btn btn-primary mb-3 w-100" onClick={handleGetCurrentLocation}>
          <i className="fas fa-location-arrow me-2"></i>
          Use My Current Location
        </button>
        
        <div className="text-center my-3">
          <span className="divider-text">OR SELECT A CITY</span>
        </div>
        
        <div className="city-grid">
          {Object.keys(cityCoordinates).map((city) => (
            <button
              key={city}
              className={`city-button ${selectedCity === city ? 'selected' : ''}`}
              onClick={() => handleCitySelect(city)}
            >
              {city.charAt(0).toUpperCase() + city.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Function to get a reliable image source
  const getReliableImageUrl = (place) => {
    // If the image URL is from placeholder.com, return a data URI instead
    if (place.imageUrl?.includes('placeholder.com')) {
      const color = getCategoryColor(place.category);
      return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='${encodeURIComponent(color)}'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='white'%3E${encodeURIComponent(place.category || 'Place')}%3C/text%3E%3C/svg%3E`;
    }
    
    // Return the original image URL or a fallback
    return place.imageUrl || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23e9ecef'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%236c757d'%3ENo Image%3C/text%3E%3C/svg%3E`;
  };

  return (
    <div className="recommendations-page">
      <div className="container py-4">
        <div className="row mb-4">
          <div className="col">
            <h1 className="mb-3">Nearby Recommendations</h1>
            
            <div className="d-flex align-items-center mb-4">
              <button
                className="btn btn-outline-primary me-3"
                onClick={() => setLocationModalVisible(true)}
              >
                <i className="fas fa-map-marker-alt me-2"></i>
                Change Location
              </button>
              
              {userProfile && (
                <div className="text-muted">
                  <small>
                    Recommendations based on your interests:
                    {userProfile.preferences?.interests?.map((interest, index) => (
                      <span key={index} className="badge bg-light text-dark ms-2">
                        {interest}
                      </span>
                    ))}
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="row">
          {/* Map column */}
          <div className="col-lg-6 mb-4">
            <div className="card shadow-sm">
              <div className="card-body p-0" style={{ height: "500px" }}>
                {loading ? (
                  <div className="loading-spinner">
                    <div className="spinner-border text-primary mb-3" role="status">
                      <span className="visually-hidden">Loading map...</span>
                    </div>
                    <p>Loading map and places...</p>
                  </div>
                ) : (
                  <MapContainer
                    center={mapCenter}
                    zoom={zoom}
                    style={{ height: "100%", width: "100%" }}
                    whenCreated={(map) => {
                      // When the map is created, we can add event listeners or other logic
                      console.log("Map created", map);
                    }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {/* User marker - simple div icon rather than an image */}
                    {userCoords && (
                      <Marker
                        position={[userCoords.latitude, userCoords.longitude]}
                        icon={L.divIcon({
                          html: `<div style="width:14px;height:14px;background:#2563eb;border-radius:50%;border:3px solid white;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>`,
                          className: 'custom-marker-icon',
                          iconSize: [20, 20],
                          iconAnchor: [10, 10]
                        })}
                      >
                        <Popup>Your Location</Popup>
                      </Marker>
                    )}
                    
                    {/* Recommendation markers - using pure SVG */}
                    {recommendations.map((place) => (
                      place.coordinates && 
                      typeof place.coordinates.latitude === 'number' && 
                      typeof place.coordinates.longitude === 'number' && (
                        <Marker
                          key={place.id}
                          position={[place.coordinates.latitude, place.coordinates.longitude]}
                          icon={createCategoryIcon(place.category)}
                        >
                          <Popup>
                            <div className="popup-content">
                              <h5>{place.name}</h5>
                              <p className="mb-1">
                                <span style={{ color: getCategoryColor(place.category) }}>●</span>
                                {' '}{place.category}
                              </p>
                              <div className="mb-2">
                                {renderRatingStars(place.rating)}
                                <span className="ms-2">({place.rating})</span>
                              </div>
                              <button
                                className="btn btn-sm btn-outline-primary mt-2"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleAddToWishlist(place);
                                }}
                              >
                                Save to Wishlist
                              </button>
                            </div>
                          </Popup>
                        </Marker>
                      )
                    ))}
                  </MapContainer>
                )}
              </div>
            </div>
          </div>
          
          {/* Recommendation cards column */}
          <div className="col-lg-6">
            <div className="recommendation-list">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading recommendations...</span>
                  </div>
                  <p className="mt-3">Finding the best places around you...</p>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="fas fa-map-marker-alt fa-3x text-muted"></i>
                  </div>
                  <h3>No recommendations found</h3>
                  <p className="text-muted">
                    We couldn't find any places near your location.
                    Try changing your location or interests.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setLocationModalVisible(true)}
                  >
                    Change Location
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mb-3">
                    <h3>Nearby Places ({recommendations.length})</h3>
                  </div>
                  {recommendations.map((place) => (
                    <div key={place.id} className="card place-card mb-3">
                      <div className="row g-0">
                        <div className="col-md-4">
                          <div className="place-image-container">
                            <div 
                              className="place-image" 
                              style={{ backgroundImage: `url(${getReliableImageUrl(place)})` }}
                            ></div>
                            <div className="category-badge" style={{ backgroundColor: getCategoryColor(place.category) }}>
                              <FontAwesomeIcon icon={getCategoryIcon(place.category)} className="me-2" />
                              {place.category}
                            </div>
                          </div>
                        </div>
                        <div className="col-md-8">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                              <h5 className="card-title">{place.name}</h5>
                              <div>{renderRatingStars(place.rating)}</div>
                            </div>
                            
                            <p className="card-text">{place.description}</p>
                            
                            {place.address && (
                              <p className="card-text small mb-2">
                                <i className="fas fa-map-marker-alt me-2 text-muted"></i>
                                {place.address}
                              </p>
                            )}
                            
                            {place.tags && place.tags.length > 0 && (
                              <div className="mb-3">
                                {place.tags.slice(0, 3).map((tag, index) => (
                                  <span key={index} className="badge bg-light text-dark me-1">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            <div className="d-flex justify-content-between align-items-center mt-2">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleAddToWishlist(place)}
                                disabled={savingToWishlist}
                              >
                                <i className="far fa-heart me-1"></i>
                                Save to Wishlist
                              </button>
                              
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => {
                                  setMapCenter([place.coordinates.latitude, place.coordinates.longitude]);
                                  setZoom(15);
                                }}
                              >
                                <i className="fas fa-map-marked-alt me-1"></i>
                                View on Map
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {locationModalVisible && <LocationModal />}
    </div>
  );
};

export default Recommendations;