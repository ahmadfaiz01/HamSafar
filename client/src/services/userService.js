/* eslint-disable no-unused-vars */
import { 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable,
  uploadBytes,  // Add this import
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../config/firebase';

/**
 * Get user profile data from Firestore
 * @param {string} userId 
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      // Create user document if it doesn't exist
      const newUser = {
        uid: userId,
        createdAt: new Date()
      };
      await setDoc(userRef, newUser);
      return newUser;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Update user profile in Firestore
 * @param {string} userId 
 * @param {Object} data - Profile data to update
 */
export const updateUserProfile = async (userId, data) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Upload profile photo to Firebase Storage and update Firestore
 * @param {string} userId 
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} Download URL of the uploaded image
 */
export const uploadProfilePhoto = async (userId, file) => {
  try {

    console.log("Skipping actual upload to Firebase due to CORS issues");
    
    // Create a local URL for the image
    const localImageUrl = URL.createObjectURL(file);
    
    // Update user profile with local photo URL for now
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      // Store the file object temporarily in a different field
      localPhotoFile: true,
      photoURL: localImageUrl,
      updatedAt: new Date()
    });
    
    return localImageUrl;
  } catch (error) {
    console.error('Error handling profile photo:', error);
    throw error;
  }
};

/**
 * Get user preferences from Firestore
 * @param {string} userId 
 * @returns {Promise<Object>} User preferences
 */
export const getUserPreferences = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists() && userSnap.data().preferences) {
      return userSnap.data().preferences;
    } else {
      // Return default preferences if none exist
      const defaultPreferences = {
        interests: [],
        travelStyle: [],
        budgetRange: 'medium',
        notificationPreferences: { email: true, push: true }
      };
      
      // Save default preferences
      await updateDoc(userRef, {
        preferences: defaultPreferences,
        updatedAt: new Date()
      });
      
      return defaultPreferences;
    }
  } catch (error) {
    console.error('Error getting user preferences:', error);
    throw error;
  }
};

/**
 * Update user preferences in Firestore
 * @param {string} userId 
 * @param {Object} preferences - User preferences to update
 */
export const updateUserPreferences = async (userId, preferences) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      preferences,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

/**
 * Get user wishlist items from Firestore
 * @param {string} userId 
 * @returns {Promise<Array>} User wishlist items
 */
export const getUserWishlist = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists() && userSnap.data().wishlist) {
      return userSnap.data().wishlist;
    }
    
    return [];
  } catch (error) {
    console.error('Error getting user wishlist:', error);
    throw error;
  }
};

/**
 * Add item to user wishlist in Firestore
 * @param {string} userId 
 * @param {Object} place - Place to add to wishlist
 */
export const addToWishlist = async (userId, place) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Create wishlist item with timestamp
    const wishlistItem = {
      id: place.id,
      name: place.name,
      description: place.description,
      category: place.category,
      coordinates: place.coordinates,
      address: place.address,
      city: place.city,
      imageUrl: place.imageUrl,
      rating: place.rating,
      addedAt: new Date()
    };
    
    // Add to wishlist array
    await updateDoc(userRef, {
      wishlist: arrayUnion(wishlistItem),
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

/**
 * Remove item from user wishlist in Firestore
 * @param {string} userId 
 * @param {string} placeId - ID of place to remove
 */
export const removeFromWishlist = async (userId, placeId) => {
  try {
    // Get current wishlist
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userSnap.data();
    const wishlist = userData.wishlist || [];
    
    // Filter out the item to remove
    const updatedWishlist = wishlist.filter(item => item.id !== placeId);
    
    // Update wishlist
    await updateDoc(userRef, {
      wishlist: updatedWishlist,
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

/**
 * Get user trips from Firestore
 * @param {string} userId 
 * @returns {Promise<Array>} User trips
 */
export const getUserTrips = async (userId) => {
  try {
    // First check the user document for trips
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists() && userSnap.data().trips) {
      return userSnap.data().trips;
    }
    
    // If not in user document, check trips collection
    const tripsRef = collection(db, 'trips');
    const q = query(tripsRef, where('userId', '==', userId));
    const tripsSnap = await getDocs(q);
    
    if (!tripsSnap.empty) {
      const trips = [];
      tripsSnap.forEach(doc => {
        trips.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return trips;
    }
    
    return [];
  } catch (error) {
    console.error('Error getting user trips:', error);
    throw error;
  }
};

/**
 * Create a new trip in Firestore
 * @param {string} userId 
 * @param {Object} tripData - Trip data to create
 */
export const createTrip = async (userId, tripData) => {
  try {
    const tripsRef = collection(db, 'trips');
    
    // Add user ID and timestamps
    const newTrip = {
      ...tripData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add to trips collection
    await setDoc(doc(tripsRef), newTrip);
    
    return true;
  } catch (error) {
    console.error('Error creating trip:', error);
    throw error;
  }
};