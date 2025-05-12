import React, { useState, useEffect, useRef } from 'react';
import { Tab, Nav } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Profile.css';

function Profile() {
  const { currentUser, userProfile, updateProfile, uploadProfileImage, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('preferences');
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
    // If auth is loaded (not loading) and no user, redirect to login
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, loading, navigate]);

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
      await updateProfile({ 
        preferences,
        location
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
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
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="profile-container">
        {/* Profile header with photo */}
        <div className="profile-header">
          <div className="profile-photo-container">
            <img 
              src={userProfile.profileImage || '/images/default-profile.png'} 
              alt={userProfile.name} 
              className="profile-photo"
            />
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
            <h2>{userProfile.name}</h2>
            <p>{userProfile.email}</p>
            {userProfile.createdAt && (
              <p>Member since {new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString()}</p>
            )}
            {userProfile.location && (
              <p><i className="fas fa-map-marker-alt"></i> {userProfile.location}</p>
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
              <form onSubmit={handleSubmit} className="preferences-form">
                {/* Location preferences */}
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title">Location</h5>
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
                </div>
                
                {/* All the preference cards */}
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title">Trip Types</h5>
                    <div className="d-flex flex-wrap">
                      {['beach', 'mountain', 'urban', 'rural', 'cultural', 'adventure'].map(type => (
                        <div key={type} className="form-check me-3 mb-2">
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
                </div>
                
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title">Activities</h5>
                    <div className="d-flex flex-wrap">
                      {['hiking', 'swimming', 'sightseeing', 'shopping', 'food', 'museums', 'nightlife', 'relaxation'].map(activity => (
                        <div key={activity} className="form-check me-3 mb-2">
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
                </div>
                
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title">Interests</h5>
                    <div className="d-flex flex-wrap">
                      {['history', 'architecture', 'nature', 'photography', 'local cuisine', 'art', 'music', 'sports', 'wildlife', 'wellness'].map(interest => (
                        <div key={interest} className="form-check me-3 mb-2">
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
                </div>
                
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title">Budget</h5>
                    <div className="d-flex">
                      {['budget', 'moderate', 'luxury'].map(budget => (
                        <div key={budget} className="form-check me-3">
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
                </div>
                
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title">Climate Preferences</h5>
                    <div className="d-flex flex-wrap">
                      {['warm', 'cold', 'tropical', 'desert', 'temperate', 'mediterranean'].map(climate => (
                        <div key={climate} className="form-check me-3 mb-2">
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
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Preferences'}
                </button>
              </form>
            </Tab.Pane>
            
            {/* Wishlist & Trips tabs - We'll implement these with Firebase in the next steps */}
            <Tab.Pane eventKey="wishlist">
              <div className="wishlist-container">
                <div className="empty-state">
                  <i className="fas fa-heart"></i>
                  <h5>Your wishlist functionality will be implemented next</h5>
                  <p>Come back soon to save your favorite hotels!</p>
                </div>
              </div>
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