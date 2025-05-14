import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserTrips } from '../services/tripService';
import { 
  getDestinationRecommendations, 
  getTripRecommendations 
} from '../services/recommendationService';
import { updateUserProfile } from '../services/authService';
import InterestTagList from '../components/profile/InterestTagList';
import TravelHistoryMap from '../components/profile/TravelHistoryMap';
import RecommendationSlider from '../components/profile/RecommendationSlider';
import '../styles/EnhancedProfile.css';

const EnhancedProfile = () => {
  const { currentUser, userProfile } = useAuth();
  const [trips, setTrips] = useState([]);
  const [destinationRecs, setDestinationRecs] = useState([]);
  const [tripRecs, setTripRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    location: '',
    interests: []
  });
  
  const availableInterests = [
    'beach', 'mountains', 'city', 'cultural', 'adventure',
    'food', 'nightlife', 'shopping', 'luxury', 'budget',
    'family', 'solo', 'romantic', 'history', 'nature',
    'architecture', 'photography', 'art', 'sports', 'wildlife'
  ];

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Load user profile
        if (currentUser) {
          setProfileData({
            name: currentUser.displayName || '',
            bio: userProfile?.bio || '',
            location: userProfile?.location || '',
            interests: userProfile?.interests?.map(i => i.category) || []
          });
          
          // Load user trips
          const userTrips = await getUserTrips(currentUser.uid);
          setTrips(userTrips);
          
          // Load recommendations
          const destRecs = await getDestinationRecommendations(currentUser.uid);
          setDestinationRecs(destRecs);
          
          const userTripRecs = await getTripRecommendations(currentUser.uid);
          setTripRecs(userTripRecs);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading profile data:', err);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [currentUser, userProfile]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const interestsFormatted = profileData.interests.map(category => ({ category, weight: 1 }));
      
      await updateUserProfile(currentUser.uid, {
        displayName: profileData.name,
        bio: profileData.bio,
        location: profileData.location,
        interests: interestsFormatted
      });
      
      // Show success message
      setError('');
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile');
    }
  };
  
  const handleInterestToggle = (interest) => {
    setProfileData(prev => {
      if (prev.interests.includes(interest)) {
        return {
          ...prev,
          interests: prev.interests.filter(i => i !== interest)
        };
      } else {
        return {
          ...prev,
          interests: [...prev.interests, interest]
        };
      }
    });
  };
  
  // Calculate trip statistics
  const calculateTripStats = () => {
    if (!trips || trips.length === 0) {
      return { totalTrips: 0, countries: [], cities: [] };
    }
    
    const countries = new Set();
    const cities = new Set();
    
    trips.forEach(trip => {
      if (trip.destination.country) {
        countries.add(trip.destination.country);
      }
      if (trip.destination.city) {
        cities.add(trip.destination.city);
      }
    });
    
    return {
      totalTrips: trips.length,
      countries: Array.from(countries),
      cities: Array.from(cities)
    };
  };
  
  const tripStats = calculateTripStats();
  
  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="enhanced-profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {currentUser?.photoURL ? (
            <img src={currentUser.photoURL} alt={currentUser.displayName} />
          ) : (
            <div className="avatar-placeholder">
              {currentUser?.displayName?.charAt(0) || '?'}
            </div>
          )}
        </div>
        
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-value">{tripStats.totalTrips}</span>
            <span className="stat-label">Trips</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{tripStats.countries.length}</span>
            <span className="stat-label">Countries</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{tripStats.cities.length}</span>
            <span className="stat-label">Cities</span>
          </div>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="profile-content">
        <div className="profile-section">
          <h2>Profile Information</h2>
          <form className="profile-form" onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself as a traveler..."
                rows={3}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={profileData.location}
                onChange={handleInputChange}
                placeholder="Where are you based?"
              />
            </div>
            
            <div className="form-group">
              <label>Travel Interests</label>
              <InterestTagList 
                interests={availableInterests} 
                selectedInterests={profileData.interests}
                onToggleInterest={handleInterestToggle}
              />
            </div>
            
            <button type="submit" className="btn-primary">
              Save Profile
            </button>
          </form>
        </div>
        
        <div className="profile-section">
          <h2>Your Travel History</h2>
          <div className="travel-history-container">
            {trips.length === 0 ? (
              <div className="empty-history">
                <p>You haven't logged any trips yet.</p>
                <a href="/trips/create" className="btn-primary">Create Your First Trip</a>
              </div>
            ) : (
              <TravelHistoryMap trips={trips} />
            )}
          </div>
        </div>
        
        <div className="profile-section">
          <h2>Recommended Destinations</h2>
          <RecommendationSlider 
            items={destinationRecs} 
            isDestination={true}
          />
        </div>
        
        <div className="profile-section">
          <h2>Trip Inspirations</h2>
          <RecommendationSlider 
            items={tripRecs} 
            isDestination={false}
          />
        </div>
      </div>
    </div>
  );
};

export default EnhancedProfile;