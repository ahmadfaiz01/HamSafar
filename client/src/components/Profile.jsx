import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Adjust path as needed
import authService from '../services/authService';

const Profile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser) {
        try {
          // Get user profile including photo URL
          const userData = await authService.getUserProfile(currentUser.uid);
          setProfile(userData);
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [currentUser]);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-photo-container">
          {profile?.photoURL ? (
            <img 
              src={profile.photoURL} 
              alt={profile.displayName || "User"} 
              className="profile-photo"
            />
          ) : (
            <div className="profile-photo-placeholder">
              {profile?.displayName?.[0] || currentUser?.email?.[0] || '?'}
            </div>
          )}
        </div>
        <div className="profile-info">
          <h2>{profile?.displayName || "User"}</h2>
          <p>{profile?.email}</p>
        </div>
      </div>
      
      {/* Rest of profile content */}
    </div>
  );
};

export default Profile;