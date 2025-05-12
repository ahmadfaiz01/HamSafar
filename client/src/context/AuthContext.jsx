import React, { createContext, useContext, useState, useEffect } from 'react';
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
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';

// Create context
const AuthContext = createContext();

// Custom hook for using auth
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? user.email : "No user");
      setCurrentUser(user);
      
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnapshot = await getDoc(docRef);
          
          if (docSnapshot.exists()) {
            console.log("User profile found");
            setUserProfile(docSnapshot.data());
          } else {
            console.log("Creating new user profile");
            // Create a new user profile
            const newProfile = {
              name: user.displayName || '',
              email: user.email,
              profileImage: user.photoURL || '',
              location: '',
              preferences: {
                tripTypes: [],
                activities: [],
                budget: 'moderate',
                climate: [],
                interests: []
              },
              createdAt: serverTimestamp()
            };
            
            await setDoc(docRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error("Error getting user profile:", err);
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
      
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile
      await updateProfile(userCredential.user, { displayName: name });
      
      // Create user profile in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        profileImage: '',
        location: '',
        preferences: {
          tripTypes: [],
          activities: [],
          budget: 'moderate',
          climate: [],
          interests: []
        },
        createdAt: serverTimestamp()
      });
      
      return userCredential.user;
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
      return await signInWithEmailAndPassword(auth, email, password);
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
      console.log("Starting Google sign in");
      
      // Create a new provider instance each time
      const provider = new GoogleAuthProvider();
      
      // Set custom parameters
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log("Provider created, attempting popup");
      
      // Use signInWithPopup with explicit auth reference
      const result = await signInWithPopup(auth, provider);
      console.log("Google sign in successful:", result.user.email);
      
      // Check if user exists in Firestore
      const userDocRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.log("Creating new Google user profile");
        // Create new user profile
        await setDoc(userDocRef, {
          name: result.user.displayName || '',
          email: result.user.email,
          profileImage: result.user.photoURL || '',
          location: '',
          preferences: {
            tripTypes: [],
            activities: [],
            budget: 'moderate',
            climate: [],
            interests: []
          },
          createdAt: serverTimestamp()
        });
      }
      
      console.log("Google sign in process completed");
      return result.user;
    } catch (err) {
      console.error("Google sign in error:", err.code, err.message);
      
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
      return await signOut(auth);
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
      
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, data);
      
      // Update local state
      setUserProfile(prev => ({...prev, ...data}));
      
      return true;
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
      
      // Create storage reference
      const storageRef = ref(storage, `profile_images/${currentUser.uid}`);
      
      // Upload file
      await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update Auth profile
      await updateProfile(currentUser, {
        photoURL: downloadURL
      });
      
      // Update Firestore document
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        profileImage: downloadURL
      });
      
      // Update local state
      setUserProfile(prev => ({...prev, profileImage: downloadURL}));
      
      return downloadURL;
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
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return "This email is already registered";
      case 'auth/invalid-email':
        return "Invalid email address";
      case 'auth/weak-password':
        return "Password should be at least 6 characters";
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return "Invalid email or password";
      case 'auth/too-many-requests':
        return "Too many unsuccessful login attempts. Please try again later";
      case 'auth/popup-closed-by-user':
        return "Sign-in popup was closed before completion";
      default:
        return "An error occurred. Please try again";
    }
  }

  // Context value
  const value = {
    currentUser,
    userProfile,
    loading,  // Make sure this is included
    error,
    signup,
    register: signup,
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
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };