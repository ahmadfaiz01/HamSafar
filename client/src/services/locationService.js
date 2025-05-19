import axios from 'axios';
import { db } from '../config/firebase';
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';

/**
 * Get user's current location using browser geolocation
 * @returns {Promise<Object>} - Coordinates object with latitude and longitude
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        resolve(coords);
      },
      (error) => {
        console.error('Geolocation error:', error);
        reject(error);
      },
      { 
        timeout: 10000,
        enableHighAccuracy: true
      }
    );
  });
};

/**
 * Save user coordinates to Firestore
 * @param {string} userId - Firebase user ID
 * @param {Object} coordinates - Object with latitude and longitude
 */
export const saveUserCoordinates = async (userId, coordinates) => {
  if (!userId || !coordinates) return;
  
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      coordinates: {
        ...coordinates,
        lastUpdated: new Date().toISOString()
      }
    });
    
    console.log('User coordinates saved to Firestore');
    return true;
  } catch (error) {
    console.error('Error saving user coordinates:', error);
    throw error;
  }
};

/**
 * Get user's saved coordinates from Firestore
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Object|null>} - Coordinates or null
 */
export const getUserCoordinates = async (userId) => {
  if (!userId) return null;
  
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists() && userSnap.data().coordinates) {
      return userSnap.data().coordinates;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user coordinates:', error);
    return null;
  }
};

/**
 * Get nearby attractions based on coordinates and interests
 * @param {Object} coords - Object with latitude and longitude
 * @param {Array} interests - Array of user interests
 * @returns {Promise<Array>} - Array of nearby attractions
 */
export const getNearbyAttractions = async (coords, interests = []) => {
  console.log('Getting nearby attractions with coords:', coords);
  
  try {
    const response = await axios.get('/api/recommendations/nearby', {
      params: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        maxDistance: 15000, // 15km radius
        interests: interests?.length ? interests.join(',') : undefined,
        limit: 20
      }
    });
    
    console.log('API Response for nearby attractions:', response.data);
    
    // Return the data array
    return response.data.data || [];
  } catch (error) {
    console.error('Error getting nearby attractions:', error);
    return [];
  }
};

/**
 * Add a place to user's wishlist in Firestore
 * @param {string} userId - Firebase user ID
 * @param {Object} place - Place object to add to wishlist
 */
export const addToWishlist = async (userId, place) => {
  if (!userId || !place) return;
  
  try {
    const userRef = doc(db, 'users', userId);
    
    // Prepare wishlist item
    const wishlistItem = {
      id: place.id,
      name: place.name,
      category: place.category,
      coordinates: place.coordinates,
      imageUrl: place.imageUrl,
      rating: place.rating,
      addedAt: new Date().toISOString()
    };
    
    // Add to wishlist
    await updateDoc(userRef, {
      wishlist: arrayUnion(wishlistItem)
    });
    
    console.log('Added to wishlist:', place.name);
    return true;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

/**
 * Get fallback attraction data in case API fails
 * @returns {Array} - Array of attraction objects
 */
const getLocalFallbackData = (coords) => {
  return [
    {
      id: "local-1",
      name: "Fallback Location 1",
      category: "Testing",
      description: "This is a local fallback test location",
      coordinates: {
        latitude: coords.latitude + 0.01,
        longitude: coords.longitude + 0.01
      },
      address: "Local Test Address",
      city: "Test City",
      // Direct SVG data URI - 100% reliable
      imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23607D8B'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='white'%3ETesting%3C/text%3E%3C/svg%3E",
      rating: 4.5,
      tags: ["test", "placeholder"]
    },
    {
      id: "local-2",
      name: "Fallback Location 2",
      category: "Testing",
      description: "This is another local fallback test location",
      coordinates: {
        latitude: coords.latitude - 0.01,
        longitude: coords.longitude - 0.01
      },
      address: "Local Test Address 2",
      city: "Test City",
      // Direct SVG data URI - 100% reliable
      imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23607D8B'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='white'%3ETesting%3C/text%3E%3C/svg%3E",
      rating: 4.0,
      tags: ["test", "placeholder"]
    }
  ];
};