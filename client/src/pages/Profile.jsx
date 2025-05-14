import React, { useState, useEffect, useRef } from 'react';
import { Tab, Nav } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Profile.css';
import Wishlist from '../components/wishlist/Wishlist';

function Profile() {
  const { currentUser, userProfile, updateProfile, uploadProfileImage, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('preferences');
  const [isEditing, setIsEditing] = useState(false);
  const [preferences, setPreferences] = useState({
    tripTypes: [],
    activities: [],
    budget: 'moderate',
    climate: [],
    interests: []
  });
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  const navigate = useNavigate();
  
  // Initialize preferences and location when user profile is available
  useEffect(() => {
    if (userProfile) {
      setPreferences(userProfile.preferences || {
        tripTypes: [],
        activities: [],
        budget: 'moderate',
        climate: [],
        interests: []
      });
      
      setLocation(userProfile.location || '');
    }
  }, [userProfile]);

  // Check authentication status
  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, loading, navigate]);

  // Format list of items for display
  const formatList = (items) => {
    if (!items || !items.length) return 'None selected';
    return items.map(item => item.charAt(0).toUpperCase() + item.slice(1)).join(', ');
  };

  // Handle checkbox change for preferences
  const handleCheckboxChange = (category, value) => {
    setPreferences(prev => {
      const categoryValues = prev[category] || [];
      if (categoryValues.includes(value)) {
        return {
          ...prev,
          [category]: categoryValues.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [category]: [...categoryValues, value]
        };
      }
    });
  };
  
  // Handle budget radio change
  const handleBudgetChange = (value) => {
    setPreferences(prev => ({
      ...prev,
      budget: value
    }));
  };
  
  // Save preferences and location
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      // Create the data object to send
      const profileData = {
        preferences: {
          ...preferences,
        },
        location: location
      };
      
      await updateProfile(profileData);
      setIsEditing(false);
      toast.success('Preferences updated successfully');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, or JPG)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    try {
      setIsLoading(true);
      await uploadProfileImage(file);
      toast.success('Profile image updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to format date properly
  const formatCreationDate = (createdAt) => {
    if (!createdAt) return 'N/A';
    
    // Handle Firebase timestamp format which has seconds and nanoseconds
    if (createdAt.seconds) {
      return new Date(createdAt.seconds * 1000).toLocaleDateString();
    }
    
    // Handle regular date string or timestamp
    try {
      return new Date(createdAt).toLocaleDateString();
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'N/A';
    }
  };
  
  // Show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Only show content if user is logged in
  if (!currentUser) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-warning">
          <h4>Please log in to view your profile</h4>
          <Link to="/login" className="btn btn-primary mt-3">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container-wrapper">
      <div className="profile-container">
        {/* Profile header with photo */}
        <div className="profile-header">
          <div className="profile-photo-container">
            {userProfile?.photoURL ? (
              <img 
                src={userProfile.photoURL}
                alt={userProfile?.displayName || 'User'} 
                className="profile-image"
                onError={(e) => {
                  console.log('Image failed to load:', e.target.src);
                  e.target.src = '/images/default-profile.png';
                  e.target.onerror = null;
                }}
              />
            ) : (
              <img 
                src="/images/default-profile.png"
                alt="Default profile" 
                className="profile-image"
              />
            )}
            <button 
              className="photo-edit-btn"
              onClick={() => fileInputRef.current.click()}
              disabled={isLoading}
            >
              <i className="fas fa-camera"></i>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/jpeg, image/png, image/jpg" 
              onChange={handlePhotoUpload}
            />
          </div>
          <div className="profile-info">
            <h2>{userProfile?.displayName || 'User'}</h2>
            <p>{userProfile?.email}</p>
            {userProfile && (
              <p>Member since {formatCreationDate(userProfile.createdAt)}</p>
            )}
            {location && (
              <p><i className="fas fa-map-marker-alt"></i> {location}</p>
            )}
          </div>
        </div>
        
        {/* Tabs for preferences, wishlist, trips */}
        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Nav variant="tabs" className="profile-nav">
            <Nav.Item>
              <Nav.Link eventKey="preferences">Preferences</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="wishlist">Wishlist</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="trips">My Trips</Nav.Link>
            </Nav.Item>
          </Nav>
          
          <Tab.Content>
            {/* Preferences Tab */}
            <Tab.Pane eventKey="preferences">
              <div className="preferences-container">
                <div className="preferences-header">
                  <h3>Travel Preferences</h3>
                  {!isEditing ? (
                    <button 
                      className="btn btn-primary"
                      onClick={() => setIsEditing(true)}
                    >
                      <i className="fas fa-edit me-2"></i>Edit Preferences
                    </button>
                  ) : null}
                </div>
                
                {!isEditing ? (
                  /* Display Mode - Show current preferences */
                  <div className="preferences-display">
                    <div className="preference-card">
                      <h4><i className="fas fa-map-marker-alt"></i> Location</h4>
                      <p>{location || 'No location set'}</p>
                    </div>
                    
                    <div className="preference-card">
                      <h4><i className="fas fa-route"></i> Trip Types</h4>
                      <p>{formatList(preferences.tripTypes)}</p>
                      <div className="preference-tags">
                        {preferences.tripTypes?.map(type => (
                          <span key={type} className="preference-tag">{type}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="preference-card">
                      <h4><i className="fas fa-hiking"></i> Activities</h4>
                      <p>{formatList(preferences.activities)}</p>
                      <div className="preference-tags">
                        {preferences.activities?.map(activity => (
                          <span key={activity} className="preference-tag">{activity}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="preference-card">
                      <h4><i className="fas fa-heart"></i> Interests</h4>
                      <p>{formatList(preferences.interests)}</p>
                      <div className="preference-tags">
                        {preferences.interests?.map(interest => (
                          <span key={interest} className="preference-tag">{interest}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="preference-card">
                      <h4><i className="fas fa-wallet"></i> Budget</h4>
                      <p>{preferences.budget ? preferences.budget.charAt(0).toUpperCase() + preferences.budget.slice(1) : 'Not specified'}</p>
                    </div>
                    
                    <div className="preference-card">
                      <h4><i className="fas fa-cloud-sun"></i> Climate</h4>
                      <p>{formatList(preferences.climate)}</p>
                      <div className="preference-tags">
                        {preferences.climate?.map(climate => (
                          <span key={climate} className="preference-tag">{climate}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Edit Mode - Edit preferences form */
                  <form onSubmit={handleSubmit} className="preferences-form">
                    {/* Location preferences */}
                    <div className="preference-edit-card">
                      <h4>Location</h4>
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter your location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                        <small className="form-text text-muted">
                          This helps us recommend destinations near you
                        </small>
                      </div>
                    </div>
                    
                    {/* Trip Types */}
                    <div className="preference-edit-card">
                      <h4>Trip Types</h4>
                      <div className="checkbox-group">
                        {['beach', 'mountain', 'urban', 'rural', 'cultural', 'adventure'].map(type => (
                          <div key={type} className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`tripType-${type}`}
                              checked={preferences.tripTypes?.includes(type)}
                              onChange={() => handleCheckboxChange('tripTypes', type)}
                            />
                            <label className="form-check-label" htmlFor={`tripType-${type}`}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Activities */}
                    <div className="preference-edit-card">
                      <h4>Activities</h4>
                      <div className="checkbox-group">
                        {['hiking', 'swimming', 'sightseeing', 'shopping', 'food', 'museums', 'nightlife', 'relaxation'].map(activity => (
                          <div key={activity} className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`activity-${activity}`}
                              checked={preferences.activities?.includes(activity)}
                              onChange={() => handleCheckboxChange('activities', activity)}
                            />
                            <label className="form-check-label" htmlFor={`activity-${activity}`}>
                              {activity.charAt(0).toUpperCase() + activity.slice(1)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Interests */}
                    <div className="preference-edit-card">
                      <h4>Interests</h4>
                      <div className="checkbox-group">
                        {['history', 'architecture', 'nature', 'photography', 'local cuisine', 'art', 'music', 'sports', 'wildlife', 'wellness'].map(interest => (
                          <div key={interest} className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`interest-${interest}`}
                              checked={preferences.interests?.includes(interest)}
                              onChange={() => handleCheckboxChange('interests', interest)}
                            />
                            <label className="form-check-label" htmlFor={`interest-${interest}`}>
                              {interest.charAt(0).toUpperCase() + interest.slice(1)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Budget */}
                    <div className="preference-edit-card">
                      <h4>Budget</h4>
                      <div className="radio-group">
                        {['budget', 'moderate', 'luxury'].map(budget => (
                          <div key={budget} className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="budget"
                              id={`budget-${budget}`}
                              value={budget}
                              checked={preferences.budget === budget}
                              onChange={() => handleBudgetChange(budget)}
                            />
                            <label className="form-check-label" htmlFor={`budget-${budget}`}>
                              {budget.charAt(0).toUpperCase() + budget.slice(1)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Climate */}
                    <div className="preference-edit-card">
                      <h4>Climate Preferences</h4>
                      <div className="checkbox-group">
                        {['warm', 'cold', 'tropical', 'desert', 'temperate', 'mediterranean'].map(climate => (
                          <div key={climate} className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`climate-${climate}`}
                              checked={preferences.climate?.includes(climate)}
                              onChange={() => handleCheckboxChange('climate', climate)}
                            />
                            <label className="form-check-label" htmlFor={`climate-${climate}`}>
                              {climate.charAt(0).toUpperCase() + climate.slice(1)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="preferences-actions">
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : 'Save Preferences'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </Tab.Pane>
            
            {/* Wishlist & Trips tabs */}
            <Tab.Pane eventKey="wishlist">
              <Wishlist />
            </Tab.Pane>
            
            <Tab.Pane eventKey="trips">
              <div className="trips-container">
                <div className="trips-header">
                  <h4>My Trips</h4>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/itinerary-planner')}
                  >
                    <i className="fas fa-plus"></i> Create New Trip
                  </button>
                </div>
                
                <div className="empty-state">
                  <i className="fas fa-plane"></i>
                  <h5>Trip planning functionality will be implemented next</h5>
                  <p>Come back soon to plan your adventures!</p>
                </div>
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
    </div>
  );
}

export default Profile;