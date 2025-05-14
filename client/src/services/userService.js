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
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../config/firebase';

/**
 * Get user profile from Firestore
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - User profile data
 */
export const getUserProfile = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      console.log("User profile fetched:", userDoc.data());
      return { id: userDoc.id, ...userDoc.data() };
    } else {
      console.log("No user profile found for ID:", userId);
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update user profile in Firestore
 * @param {string} userId - The user ID
 * @param {Object} profileData - The updated profile data
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    
    // Check if document exists first
    const docSnap = await getDoc(userDocRef);
    
    // Add last updated timestamp
    const dataToUpdate = {
      ...profileData,
      lastUpdated: serverTimestamp()
    };
    
    if (docSnap.exists()) {
      // Update existing document
      await updateDoc(userDocRef, dataToUpdate);
      console.log("User profile updated successfully");
    } else {
      // Create new document if it doesn't exist
      dataToUpdate.createdAt = serverTimestamp();
      await setDoc(userDocRef, dataToUpdate);
      console.log("User profile created successfully");
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Upload user profile photo
 * @param {string} userId - The user ID
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - URL of the uploaded image
 */
export const uploadProfilePhoto = async (userId, file) => {
  try {
    // Create a reference to the storage location
    const storageRef = ref(storage, `profile_photos/${userId}/${Date.now()}_${file.name}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Update the user profile with the new photo URL
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { 
      photoURL: downloadURL,
      lastUpdated: serverTimestamp()
    });
    
    console.log('Profile photo uploaded and updated in profile');
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    throw error;
  }
};

/**
 * Delete user profile photo
 * @param {string} userId - The user ID
 * @param {string} photoURL - The URL of the photo to delete
 * @returns {Promise<void>}
 */
export const deleteProfilePhoto = async (userId, photoURL) => {
  try {
    // Extract the path from the URL
    const storageRef = ref(storage, photoURL);
    
    // Delete the file
    await deleteObject(storageRef);
    
    // Update the user profile to remove the photo URL
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { 
      photoURL: null,
      lastUpdated: serverTimestamp()
    });
    
    console.log('Profile photo deleted');
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    throw error;
  }
};

/**
 * Get user preferences from Firestore
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - User preferences
 */
export const getUserPreferences = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists() && userDoc.data().preferences) {
      console.log("User preferences fetched:", userDoc.data().preferences);
      return userDoc.data().preferences;
    } else {
      console.log("No preferences found, returning defaults");
      return {
        interests: [],
        travelStyle: [],
        budgetRange: 'medium',
        notificationPreferences: { email: true, push: true }
      };
    }
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    throw error;
  }
};

/**
 * Update user preferences in Firestore
 * @param {string} userId - The user ID
 * @param {Object} preferences - The updated preferences
 * @returns {Promise<void>}
 */
export const updateUserPreferences = async (userId, preferences) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    
    await updateDoc(userDocRef, { 
      preferences: preferences,
      lastUpdated: serverTimestamp()
    });
    
    console.log("User preferences updated successfully");
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

/**
 * Get user's wishlist from Firestore
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - Wishlist items
 */
export const getUserWishlist = async (userId) => {
  try {
    const wishlistRef = collection(db, 'users', userId, 'wishlist');
    const wishlistSnap = await getDocs(wishlistRef);
    
    const wishlist = [];
    wishlistSnap.forEach(doc => {
      wishlist.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`Fetched ${wishlist.length} wishlist items`);
    return wishlist;
  } catch (error) {
    console.error('Error fetching user wishlist:', error);
    throw error;
  }
};

/**
 * Get user's saved trips from Firestore
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - Saved trips
 */
export const getUserTrips = async (userId) => {
  try {
    // Try to fetch from main trips collection first with a query filter
    const tripsRef = collection(db, 'trips');
    const q = query(tripsRef, where('userId', '==', userId));
    const tripsSnap = await getDocs(q);
    
    // If no trips found or error, fall back to nested collection
    if (tripsSnap.empty) {
      console.log("No trips found in main collection, trying nested collection");
      try {
        // Try the nested collection approach
        const nestedTripsRef = collection(db, 'users', userId, 'trips');
        const nestedTripsSnap = await getDocs(nestedTripsRef);
        
        const trips = [];
        nestedTripsSnap.forEach(doc => {
          const data = doc.data();
          
          // Safely convert timestamps
          const processedData = {
            ...data,
            startDate: data.startDate?.toDate ? data.startDate.toDate() : data.startDate,
            endDate: data.endDate?.toDate ? data.endDate.toDate() : data.endDate,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          };
          
          trips.push({ id: doc.id, ...processedData });
        });
        
        console.log(`Fetched ${trips.length} user trips from nested collection`);
        return trips;
      } catch (nestedError) {
        console.error('Error fetching from nested trips:', nestedError);
        return [];
      }
    }
    
    // Process trips from main collection
    const trips = [];
    tripsSnap.forEach(doc => {
      const data = doc.data();
      
      // Safely convert timestamps
      const processedData = {
        ...data,
        startDate: data.startDate?.toDate ? data.startDate.toDate() : data.startDate,
        endDate: data.endDate?.toDate ? data.endDate.toDate() : data.endDate,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      };
      
      trips.push({ id: doc.id, ...processedData });
    });
    
    console.log(`Fetched ${trips.length} user trips from main collection`);
    return trips;
  } catch (error) {
    console.error('Error fetching user trips:', error);
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
};