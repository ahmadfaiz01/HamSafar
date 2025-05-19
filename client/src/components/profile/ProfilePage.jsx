import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tab, Nav, Row, Col, Button, Card } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import MyTrips from '../trip/MyTrips';
import MapView from '../map/MapView';
import TravelRecommendations from '../recommendations/TravelRecommendations';
import tripService from '../../services/tripService';
import mapService from '../../services/mapService';
import { toast } from 'react-toastify';
import './ProfilePage.css';
import SavedTrips from './SavedTrips';
import './ProfilePage.css';

const ProfilePage = () => {
  const { currentUser, userProfile, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    location: '',
    bio: '',
    preferences: {
      tripTypes: [],
      activities: [],
      interests: [],
      budget: 'moderate',
      climate: []
    }
  });
  const [tripStats, setTripStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    countriesVisited: 0
  });
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch user data when component mounts or user changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);

        // Populate form with user data
        if (userProfile) {
          setProfileData({
            displayName: userProfile.displayName || '',
            email: userProfile.email || '',
            location: userProfile.location || '',
            bio: userProfile.bio || '',
            preferences: userProfile.preferences || {
              tripTypes: [],
              activities: [],
              interests: [],
              budget: 'moderate',
              climate: []
            }
          });
        }

        // Fetch trip statistics
        const stats = await tripService.getTripStatistics(currentUser.uid);
        setTripStats(stats);

        // Fetch saved places
        const places = await mapService.getSavedPlaces(currentUser.uid);
        setSavedPlaces(places);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, userProfile, navigate]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle preference changes
  const handlePreferenceChange = (category, value) => {
    setProfileData(prev => {
      const currentValues = prev.preferences[category] || [];
      let updatedValues;

      if (currentValues.includes(value)) {
        // Remove value if already selected
        updatedValues = currentValues.filter(v => v !== value);
      } else {
        // Add value if not already selected
        updatedValues = [...currentValues, value];
      }

      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          [category]: updatedValues
        }
      };
    });
  };

  // Handle budget preference change
  const handleBudgetChange = (value) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        budget: value
      }
    }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      await updateProfile(profileData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Image upload logic would go here
    // This would usually call a function like updateProfileImage from the auth context
  };

  // If not logged in, show login prompt
  if (!currentUser && !isLoading) {
    return (
      <div className="container mt-5 text-center">
        <Card>
          <Card.Body>
            <Card.Title>Please Log In</Card.Title>
            <Card.Text>
              You need to be logged in to view your profile.
            </Card.Text>
            <Link to="/login" className="btn btn-primary">
              Go to Login
            </Link>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      <div className="profile-header">
        <div className="profile-image-container">
          <img 
            src={userProfile?.photoURL || '/images/default-profile.png'} 
            alt="Profile" 
            className="profile-image"
          />
          {isEditing && (
            <Button 
              variant="light" 
              className="edit-image-btn"
              onClick={() => fileInputRef.current.click()}
            >
              <i className="fas fa-camera"></i>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleImageUpload}
                accept="image/*"
              />
            </Button>
          )}
        </div>
        <div className="profile-info">
          <h2>{userProfile?.displayName || 'User'}</h2>
          <p className="text-muted">{userProfile?.email}</p>
          {userProfile?.location && (
            <p>
              <i className="fas fa-map-marker-alt"></i> {userProfile.location}
            </p>
          )}
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-value">{tripStats.total}</span>
              <span className="stat-label">Trips</span>
            </div>
            <div className="stat">
              <span className="stat-value">{tripStats.countriesVisited}</span>
              <span className="stat-label">Countries</span>
            </div>
            <div className="stat">
              <span className="stat-value">{savedPlaces.length}</span>
              <span className="stat-label">Saved Places</span>
            </div>
          </div>
        </div>
      </div>

      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Nav variant="tabs" className="profile-nav">
          <Nav.Item>
            <Nav.Link eventKey="profile">Profile</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="trips">My Trips</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="map">Maps & Places</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="recommendations">Recommendations</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="profile">
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3>Profile Information</h3>
                  {!isEditing ? (
                    <Button 
                      variant="outline-primary" 
                      onClick={() => setIsEditing(true)}
                    >
                      <i className="fas fa-edit"></i> Edit Profile
                    </Button>
                  ) : (
                    <div>
                      <Button 
                        variant="outline-secondary" 
                        className="me-2"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="primary" 
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  )}
                </div>

                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="displayName"
                          value={profileData.displayName}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p>{profileData.displayName}</p>
                      )}
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <p>{profileData.email}</p>
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label">Location</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="location"
                          value={profileData.location}
                          onChange={handleInputChange}
                          placeholder="Your city, country"
                        />
                      ) : (
                        <p>{profileData.location || 'Not specified'}</p>
                      )}
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label">Member Since</label>
                      <p>{userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </Col>
                </Row>

                <div className="mb-3">
                  <label className="form-label">Bio</label>
                  {isEditing ? (
                    <textarea
                      className="form-control"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Tell us a bit about yourself and your travel preferences..."
                    ></textarea>
                  ) : (
                    <p>{profileData.bio || 'No bio provided'}</p>
                  )}
                </div>

                {isEditing && (
                  <div className="preferences-section">
                    <h4 className="mb-3">Travel Preferences</h4>
                    
                    <div className="mb-4">
                      <h5>Trip Types</h5>
                      <div className="preferences-tags">
                        {['beach', 'mountain', 'city', 'cultural', 'adventure', 'relaxation'].map(type => (
                          <Button
                            key={type}
                            variant={profileData.preferences.tripTypes.includes(type) ? 'primary' : 'outline-primary'}
                            className="preference-tag"
                            onClick={() => handlePreferenceChange('tripTypes', type)}
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h5>Activities</h5>
                      <div className="preferences-tags">
                        {['hiking', 'swimming', 'sightseeing', 'shopping', 'dining', 'museums', 'nightlife', 'nature'].map(activity => (
                          <Button
                            key={activity}
                            variant={profileData.preferences.activities.includes(activity) ? 'primary' : 'outline-primary'}
                            className="preference-tag"
                            onClick={() => handlePreferenceChange('activities', activity)}
                          >
                            {activity}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h5>Interests</h5>
                      <div className="preferences-tags">
                        {['history', 'art', 'food', 'architecture', 'photography', 'wildlife', 'sports', 'music', 'local culture'].map(interest => (
                          <Button
                            key={interest}
                            variant={profileData.preferences.interests.includes(interest) ? 'primary' : 'outline-primary'}
                            className="preference-tag"
                            onClick={() => handlePreferenceChange('interests', interest)}
                          >
                            {interest}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h5>Budget Preference</h5>
                      <div className="budget-options">
                        {['budget', 'moderate', 'luxury'].map(budget => (
                          <div key={budget} className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="budget"
                              id={`budget-${budget}`}
                              checked={profileData.preferences.budget === budget}
                              onChange={() => handleBudgetChange(budget)}
                            />
                            <label className="form-check-label" htmlFor={`budget-${budget}`}>
                              {budget.charAt(0).toUpperCase() + budget.slice(1)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Tab.Pane>

          <Tab.Pane eventKey="trips">
            <div className="trips-tab-container">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>My Trips</h3>
                <Button 
                  variant="primary"
                  onClick={() => navigate('/itinerary-planner')}
                >
                  <i className="fas fa-plus me-2"></i>
                  Plan New Trip
                </Button>
              </div>
              
              <MyTrips 
                isProfileTab={true} 
                onTripsLoaded={(count) => {
                  setTripStats(prev => ({...prev, total: count}));
                }}
              />
            </div>
          </Tab.Pane>

          <Tab.Pane eventKey="map">
            <div className="map-tab-container">
              <h3 className="mb-3">Explore Places</h3>
              <p className="text-muted mb-4">
                Discover interesting places near you or at your next destination. 
                Save places to your favorites and add them to your trip itineraries.
              </p>
              <div className="map-container">
                <MapView />
              </div>
              
              <div className="saved-places mt-4">
                <h4>Your Saved Places</h4>
                {savedPlaces.length === 0 ? (
                  <p className="text-muted">
                    You haven't saved any places yet. Use the map to discover and save places you're interested in.
                  </p>
                ) : (
                  <div className="row">
                    {savedPlaces.map(place => (
                      <div key={place._id} className="col-md-4 mb-3">
                        <Card className="saved-place-card">
                          {place.photo && (
                            <Card.Img variant="top" src={place.photo} alt={place.name} />
                          )}
                          <Card.Body>
                            <Card.Title>{place.name}</Card.Title>
                            <Card.Text>{place.address}</Card.Text>
                            <div className="d-flex justify-content-between">
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => {
                                  // Navigate to map with this location
                                }}
                              >
                                <i className="fas fa-map-marker-alt"></i> View on Map
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await mapService.deleteSavedPlace(place._id);
                
                                    setSavedPlaces(prevSavedPlaces => prevSavedPlaces.filter(p => p._id !== place._id));
                                    toast.success('Place removed from favorites');
                                  } catch {
                                    toast.error('Failed to remove place');
                                  }
                                }}
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Tab.Pane>

          <Tab.Pane eventKey="recommendations">
            <TravelRecommendations />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default ProfilePage;
