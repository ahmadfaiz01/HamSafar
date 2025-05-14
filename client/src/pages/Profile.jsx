import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  getUserProfile, 
  updateUserProfile, 
  uploadProfilePhoto,
  getUserPreferences,
  updateUserPreferences,
  getUserWishlist,
  getUserTrips
} from '../services/userService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SavedTrips from '../components/profile/SavedTrips';
import './Profile.css';
import profilePicture from '../assets/pfp.jpg';

function Profile() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [imageFile, setImageFile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [trips, setTrips] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [editedPreferences, setEditedPreferences] = useState({});
  const fileInputRef = useRef(null);

  // Array of interests for selection
  const interestOptions = [
    'Beach', 'Mountains', 'City', 'History', 'Art', 'Food', 
    'Adventure', 'Nature', 'Shopping', 'Nightlife', 'Wildlife', 
    'Photography', 'Architecture', 'Museums', 'Hiking'
  ];

  // Array of travel styles for selection
  const travelStyleOptions = [
    'Budget', 'Luxury', 'Family', 'Solo', 'Group', 'Romantic',
    'Backpacking', 'Road Trip', 'Business', 'Weekend Getaway'
  ];

  useEffect(() => {
    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

  const fetchUserData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      console.log('Fetching user data for:', currentUser.uid);
      
      // Fetch basic profile info
      const userProfile = await getUserProfile(currentUser.uid);
      
      // Ensure we have proper profile data structure
      const profileData = {
        name: userProfile?.name || currentUser.displayName || 'User',
        email: userProfile?.email || currentUser.email || '',
        photoURL: userProfile?.photoURL || currentUser.photoURL || '',
        phone: userProfile?.phone || '',
        bio: userProfile?.bio || ''
      };
      
      setProfile(profileData);
      setEditedProfile({ ...profileData });
      
      try {
        // Fetch user preferences
        const userPreferences = await getUserPreferences(currentUser.uid);
        setPreferences(userPreferences);
        setEditedPreferences(userPreferences);
      } catch (prefError) {
        console.error("Error loading preferences:", prefError);
        toast.error("Failed to load your preferences");
        // Set default preferences
        setPreferences({
          interests: [],
          travelStyle: [],
          budgetRange: 'medium',
          notificationPreferences: { email: true, push: true }
        });
      }
      
      try {
        // Fetch wishlist items
        const userWishlist = await getUserWishlist(currentUser.uid);
        setWishlist(userWishlist);
      } catch (wishlistError) {
        console.error("Error loading wishlist:", wishlistError);
        setWishlist([]);
      }
      
      try {
        // Fetch user trips
        const userTrips = await getUserTrips(currentUser.uid);
        setTrips(userTrips);
      } catch (tripsError) {
        console.error("Error loading trips:", tripsError);
        setTrips([]);
        // Don't show error toast for trips since we're handling it gracefully
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Could not load your profile information');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (type, value) => {
    setEditedPreferences(prev => {
      if (type === 'interest') {
        // Toggle interest selection
        const updatedInterests = prev.interests.includes(value)
          ? prev.interests.filter(i => i !== value)
          : [...prev.interests, value];
        
        return { ...prev, interests: updatedInterests };
      } else if (type === 'travelStyle') {
        // Toggle travel style selection
        const updatedStyles = prev.travelStyle.includes(value)
          ? prev.travelStyle.filter(s => s !== value)
          : [...prev.travelStyle, value];
        
        return { ...prev, travelStyle: updatedStyles };
      } else if (type === 'budgetRange') {
        // Update budget range
        return { ...prev, budgetRange: value };
      } else if (type === 'notification') {
        // Update notification preferences
        return { 
          ...prev, 
          notificationPreferences: {
            ...prev.notificationPreferences,
            [value]: !prev.notificationPreferences[value]
          }
        };
      }
      
      return prev;
    });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Upload image if selected
      let photoURL = profile?.photoURL; // Keep existing URL by default
      
      if (imageFile) {
        photoURL = await uploadProfilePhoto(currentUser.uid, imageFile);
        setImageFile(null);
      }
      
      // Combine everything into one profile update
      const updatedProfileData = {
        ...editedProfile,
        photoURL
      };
      
      // Update profile information
      await updateUserProfile(currentUser.uid, updatedProfileData);
      
      // Update preferences separately
      await updateUserPreferences(currentUser.uid, editedPreferences);
      
      // Show success message
      toast.success('Profile updated successfully!');
      setEditing(false);
      
      // Update local state with the new profile data
      setProfile(prev => ({
        ...prev,
        ...updatedProfileData
      }));
      
      // No need to call fetchUserData() as we've already updated local state
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Could not update your profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
      
      // Preview the selected image immediately
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfile(prev => ({ ...prev, photoURL: event.target.result }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };


  if (loading && !profile) {
    return <LoadingSpinner />;
  }

  // Placeholder image for profile


  return (
    <div className="profile-container container mt-5 pb-5">
      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="profile-sidebar card shadow-sm">
            <div className="text-center p-4">
              <div className="profile-photo-container">
                <img 
                  src={profile?.photoURL || profilePicture} 
                  alt={profile?.name || 'User'}
                  className="profile-photo img-fluid rounded-circle mb-3"
                  onClick={editing ? handleProfilePhotoClick : undefined}
                  style={{ cursor: editing ? 'pointer' : 'default' }}
                />
                {editing && (
                  <div className="photo-edit-overlay" onClick={handleProfilePhotoClick}>
                    <i className="fas fa-camera"></i>
                    <span>Change Photo</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
              <h4 className="profile-name">{profile?.name || 'User'}</h4>
              <p className="profile-email text-muted">{profile?.email}</p>
              
              {!editing && (
                <button 
                  className="btn btn-primary mt-2"
                  onClick={() => setEditing(true)}
                >
                  <i className="fas fa-edit me-2"></i>Edit Profile
                </button>
              )}
            </div>
            
            <div className="profile-nav">
              <div 
                className={`profile-nav-item ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                <i className="fas fa-user me-2"></i>
                Personal Information
              </div>
              <div 
                className={`profile-nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
                onClick={() => setActiveTab('preferences')}
              >
                <i className="fas fa-cog me-2"></i>
                Preferences
              </div>
              <div 
                className={`profile-nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
                onClick={() => setActiveTab('wishlist')}
              >
                <i className="fas fa-heart me-2"></i>
                Wishlist
                <span className="badge bg-primary ms-2">{wishlist.length}</span>
              </div>
              <div 
                className={`profile-nav-item ${activeTab === 'trips' ? 'active' : ''}`}
                onClick={() => setActiveTab('trips')}
              >
                <i className="fas fa-suitcase me-2"></i>
                My Trips
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-8">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="profile-content card shadow-sm p-4">
              <h3 className="mb-4">Personal Information</h3>
              
              {editing ? (
                <div className="profile-edit-form">
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="name" 
                      name="name"
                      value={editedProfile.name || ''} 
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      id="email" 
                      name="email"
                      value={editedProfile.email || ''} 
                      onChange={handleProfileChange}
                      disabled // Email typically can't be changed easily
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      id="phone" 
                      name="phone"
                      value={editedProfile.phone || ''} 
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="bio" className="form-label">Bio</label>
                    <textarea 
                      className="form-control" 
                      id="bio" 
                      name="bio"
                      rows="3"
                      value={editedProfile.bio || ''} 
                      onChange={handleProfileChange}
                    ></textarea>
                  </div>
                  
                  <div className="d-flex justify-content-end mt-4">
                    <button 
                      className="btn btn-outline-secondary me-2"
                      onClick={() => {
                        setEditing(false);
                        setEditedProfile({
                          name: profile?.name || '',
                          email: profile?.email || '',
                          phone: profile?.phone || '',
                          bio: profile?.bio || ''
                        });
                        setEditedPreferences(preferences);
                        setImageFile(null);
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={handleSaveProfile}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-info">
                  <div className="profile-info-item">
                    <div className="profile-info-label">Full Name</div>
                    <div className="profile-info-value">{profile?.name || 'Not set'}</div>
                  </div>
                  
                  <div className="profile-info-item">
                    <div className="profile-info-label">Email</div>
                    <div className="profile-info-value">{profile?.email || 'Not set'}</div>
                  </div>
                  
                  <div className="profile-info-item">
                    <div className="profile-info-label">Phone Number</div>
                    <div className="profile-info-value">{profile?.phone || 'Not set'}</div>
                  </div>
                  
                  <div className="profile-info-item">
                    <div className="profile-info-label">Bio</div>
                    <div className="profile-info-value">{profile?.bio || 'No bio added yet'}</div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="profile-content card shadow-sm p-4">
              <h3 className="mb-4">Preferences</h3>
              
              {preferences ? (
                <div className="preferences-section">
                  <div className="mb-4">
                    <h5 className="mb-3">Travel Interests</h5>
                    <div className="interest-tags">
                      {interestOptions.map(interest => (
                        <div 
                          key={interest} 
                          className={`interest-tag ${editing && editedPreferences?.interests?.includes(interest) ? 'selected' : (!editing && preferences?.interests?.includes(interest) ? 'selected' : '')}`}
                          onClick={() => editing && handlePreferenceChange('interest', interest)}
                        >
                          {interest}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="mb-3">Travel Style</h5>
                    <div className="travel-style-tags">
                      {travelStyleOptions.map(style => (
                        <div 
                          key={style} 
                          className={`travel-style-tag ${editing && editedPreferences?.travelStyle?.includes(style) ? 'selected' : (!editing && preferences?.travelStyle?.includes(style) ? 'selected' : '')}`}
                          onClick={() => editing && handlePreferenceChange('travelStyle', style)}
                        >
                          {style}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="mb-3">Budget Preference</h5>
                    {editing ? (
                      <div className="budget-selector">
                        <div className="form-check form-check-inline">
                          <input 
                            className="form-check-input" 
                            type="radio" 
                            id="budget-economy"
                            name="budget"
                            checked={editedPreferences?.budgetRange === 'economy'}
                            onChange={() => handlePreferenceChange('budgetRange', 'economy')}
                          />
                          <label className="form-check-label" htmlFor="budget-economy">Economy</label>
                        </div>
                        
                        <div className="form-check form-check-inline">
                          <input 
                            className="form-check-input" 
                            type="radio"
                            id="budget-medium"
                            name="budget"
                            checked={editedPreferences?.budgetRange === 'medium'}
                            onChange={() => handlePreferenceChange('budgetRange', 'medium')}
                          />
                          <label className="form-check-label" htmlFor="budget-medium">Medium</label>
                        </div>
                        
                        <div className="form-check form-check-inline">
                          <input 
                            className="form-check-input" 
                            type="radio"
                            id="budget-luxury"
                            name="budget"
                            checked={editedPreferences?.budgetRange === 'luxury'}
                            onChange={() => handlePreferenceChange('budgetRange', 'luxury')}
                          />
                          <label className="form-check-label" htmlFor="budget-luxury">Luxury</label>
                        </div>
                      </div>
                    ) : (
                      <div className="budget-display">
                        <span className={`budget-badge ${preferences?.budgetRange || 'medium'}`}>
                          {(preferences?.budgetRange || 'medium').charAt(0).toUpperCase() + (preferences?.budgetRange || 'medium').slice(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="mb-3">Notification Preferences</h5>
                    {editing ? (
                      <div className="notification-settings">
                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="email-notif"
                            checked={editedPreferences?.notificationPreferences?.email}
                            onChange={() => handlePreferenceChange('notification', 'email')}
                          />
                          <label className="form-check-label" htmlFor="email-notif">Email Notifications</label>
                        </div>
                        
                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox"
                            id="push-notif"
                            checked={editedPreferences?.notificationPreferences?.push}
                            onChange={() => handlePreferenceChange('notification', 'push')}
                          />
                          <label className="form-check-label" htmlFor="push-notif">Push Notifications</label>
                        </div>
                      </div>
                    ) : (
                      <div className="notification-display">
                        <div>
                          <i className={`fas fa-${preferences?.notificationPreferences?.email ? 'check-circle text-success' : 'times-circle text-danger'} me-2`}></i>
                          Email Notifications: {preferences?.notificationPreferences?.email ? 'Enabled' : 'Disabled'}
                        </div>
                        <div>
                          <i className={`fas fa-${preferences?.notificationPreferences?.push ? 'check-circle text-success' : 'times-circle text-danger'} me-2`}></i>
                          Push Notifications: {preferences?.notificationPreferences?.push ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {editing && (
                    <div className="d-flex justify-content-end mt-4">
                      <button 
                        className="btn btn-outline-secondary me-2"
                        onClick={() => {
                          setEditing(false);
                          setEditedPreferences(preferences);
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn btn-primary"
                        onClick={handleSaveProfile}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Saving...
                          </>
                        ) : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">No preferences set yet.</p>
                  <button 
                    className="btn btn-primary mt-2"
                    onClick={() => {
                      setEditedPreferences({
                        interests: [],
                        travelStyle: [],
                        budgetRange: 'medium',
                        notificationPreferences: { email: true, push: true }
                      });
                      setEditing(true);
                    }}
                  >
                    Set Preferences
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div className="profile-content card shadow-sm p-4">
              <h3 className="mb-4">Wishlist</h3>
              
              {wishlist.length > 0 ? (
                <div className="wishlist-items">
                  <div className="row g-4">
                    {wishlist.map(item => (
                      <div className="col-md-6" key={item.id}>
                        <div className="wishlist-card">
                          <div className="wishlist-image">
                            <img 
                              src={item.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} 
                              alt={item.name} 
                              className="img-fluid"
                            />
                            <span className="badge bg-secondary category-badge">
                              {item.category}
                            </span>
                          </div>
                          <div className="wishlist-content">
                            <h5>{item.name}</h5>
                            <p className="small text-muted mb-2">
                              {item.description && item.description.length > 100
                                ? `${item.description.substring(0, 100)}...`
                                : item.description || 'No description available'}
                            </p>
                            <div className="d-flex justify-content-between align-items-center mt-3">
                              <small className="text-muted">
                                {item.addedAt ? new Date(item.addedAt.seconds * 1000).toLocaleDateString() : 'Recently added'}
                              </small>
                              <button className="btn btn-sm btn-outline-primary">
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="far fa-heart fa-3x text-muted mb-3"></i>
                  <h5>Your wishlist is empty</h5>
                  <p className="text-muted">Save locations you're interested in by adding them to your wishlist.</p>
                  <button 
                    className="btn btn-outline-primary mt-2"
                    onClick={() => window.location.href = '/recommendations'}
                  >
                    Explore Recommendations
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Trips Tab */}
          {activeTab === 'trips' && (
            <div className="profile-content card shadow-sm p-4">
              <h3 className="mb-4">My Trips</h3>
              
              {/* Pass both props */}
              <SavedTrips isProfileTab={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;