import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Adjust path as needed
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase'; // Adjust path as needed
import authService from '../services/authService';

const ProfilePhotoUpload = ({ onPhotoUpdated }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { currentUser } = useAuth();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    
    try {
      // Create a reference to upload the file
      const storageRef = ref(storage, `profile_photos/${currentUser.uid}/${Date.now()}_${file.name}`);
      
      // Start upload
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // Listen for upload progress
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setUploading(false);
        },
        async () => {
          // Upload completed, get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Update user profile in your API/database
          await authService.updateProfilePhoto(currentUser.uid, downloadURL);
          
          setUploading(false);
          if (onPhotoUpdated) {
            onPhotoUpdated(downloadURL);
          }
        }
      );
    } catch (error) {
      console.error('Error during upload:', error);
      setUploading(false);
    }
  };

  return (
    <div className="photo-upload">
      <label className="upload-button">
        {uploading ? `Uploading: ${progress}%` : 'Change Photo'}
        <input 
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </label>
      
      {uploading && (
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoUpload;