import React from 'react';
import Profile from '../components/Profile'; // Updated to point to the correct file

const ProfilePage = () => {
  // We don't need the refresh trigger since Profile.jsx handles its own state
  
  return (
    <div className="profile-page">
      <Profile />
    </div>
  );
};

export default ProfilePage;