import React, { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import axios from 'axios';
import { auth } from '../config/firebase';

// Create the context
import { AuthContext } from './AuthContextInstance';

// Create a named export for the provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sync user profile with backend
  const syncUserProfile = async (user) => {
    try {
      console.log("Syncing user profile:", user.uid);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await axios.post(`${API_URL}/users`, {
        firebaseUid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || ''
      });
      
      setUserProfile(response.data);
    } catch (err) {
      console.error('Error syncing user profile:', err);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          await syncUserProfile(user);
        } catch (err) {
          console.error('Profile sync error:', err);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Email/password signup
  async function signup(name, email, password) {
    try {
      setError('');
      
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update Firebase profile
      await updateProfile(user, { displayName: name });
      
      // Sync with backend
      await syncUserProfile(user);
      
      return user;
    } catch (err) {
      console.error("Signup error:", err);
      setError(getErrorMessage(err.code));
      throw err;
    }
  }

  // Email/password login
  async function login(email, password) {
    try {
      setError('');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      console.error("Login error:", err);
      setError(getErrorMessage(err.code));
      throw err;
    }
  }

  // Google sign in
  async function googleSignIn() {
    try {
      setError('');
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Sync with backend
      await syncUserProfile(user);
      
      return user;
    } catch (err) {
      console.error("Google sign in error:", err);
      
      // More specific error handling
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Sign-in popup was blocked. Please allow popups for this website.');
      } else {
        setError(getErrorMessage(err.code));
      }
      throw err;
    }
  }

  // Logout
  async function logout() {
    try {
      setError('');
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
      setError(getErrorMessage(err.code));
      throw err;
    }
  }

  // Update user profile
  async function updateUserProfile(data) {
    try {
      if (!currentUser) throw new Error("No user logged in");
      
      // Update Firebase profile if name or photo changed
      if (data.displayName || data.photoURL) {
        await updateProfile(currentUser, {
          displayName: data.displayName || currentUser.displayName,
          photoURL: data.photoURL || currentUser.photoURL
        });
      }
      
      // Use the correct API URL from environment variable
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // Create the data object to send to the backend
      const updateData = {
        preferences: data.preferences || data,
      };
      
      // Add location if it exists
      if (data.location) {
        updateData.location = data.location;
      }
      
      // Update backend profile
      const response = await axios.patch(
        `${API_URL}/users/${currentUser.uid}/preferences`, 
        updateData
      );
      
      // Update local state
      setUserProfile(response.data);
      
      return response.data;
    } catch (err) {
      console.error("Update profile error:", err);
      setError("Failed to update profile");
      throw err;
    }
  }

  // Upload profile image
  async function uploadProfileImage(file) {
    try {
      if (!currentUser) throw new Error("No user logged in");
      
      // Create form data for upload
      const formData = new FormData();
      formData.append('profileImage', file);
      
      // Use the correct API URL from environment variable
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      // Upload to backend with correct path
      const response = await axios.post(
        `${API_URL}/users/${currentUser.uid}/upload-profile-image`, 
        formData, 
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      
      // Update Firebase profile with the full URL from response
      await updateProfile(currentUser, {
        photoURL: response.data.photoURL
      });
      
      // Update local state
      setUserProfile(prev => ({...prev, photoURL: response.data.photoURL}));
      
      // Log success for debugging
      console.log("Profile image updated successfully:", response.data.photoURL);
      
      return response.data.photoURL;
    } catch (err) {
      console.error("Upload profile image error:", err);
      setError("Failed to upload profile image");
      throw err;
    }
  }

  // Reset password
  async function resetPassword(email) {
    try {
      setError('');
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err) {
      console.error("Reset password error:", err);
      setError(getErrorMessage(err.code));
      throw err;
    }
  }

  // Helper function for error messages
  function getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/email-already-in-use': "This email is already registered",
      'auth/invalid-email': "Invalid email address",
      'auth/weak-password': "Password should be at least 6 characters",
      'auth/user-not-found': "No account found with this email",
      'auth/wrong-password': "Invalid email or password",
      'auth/too-many-requests': "Too many unsuccessful login attempts. Please try again later",
      'auth/popup-closed-by-user': "Sign-in popup was closed before completion",
      'default': "An error occurred. Please try again"
    };
    
    return errorMessages[errorCode] || errorMessages['default'];
  }

  // Context value
  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    signup,
    login,
    googleSignIn,
    logout,
    resetPassword, 
    updateProfile: updateUserProfile,
    uploadProfileImage,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Removed useAuth hook to comply with Fast Refresh requirements