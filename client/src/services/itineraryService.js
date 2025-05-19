/* eslint-disable no-unused-vars */
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp,
  setDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Service for interacting with the itinerary API endpoints
 */

// Get auth token from localStorage
const getToken = () => localStorage.getItem('token');

// Create headers with auth token
const createHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  const token = getToken();
  if (token) {
    headers['x-auth-token'] = token;
  }
  
  return headers;
};

/**
 * Create a new itinerary
 */
export const createItinerary = async (userId, itineraryData) => {
  try {
    const itineraryWithTimestamp = {
      ...itineraryData,
      createdAt: serverTimestamp(),
      userId
    };
    
    const itinerariesRef = collection(db, 'itineraries');
    const docRef = await addDoc(itinerariesRef, itineraryWithTimestamp);
    
    return {
      id: docRef.id,
      ...itineraryData
    };
  } catch (error) {
    console.error("Error creating itinerary:", error);
    throw error;
  }
};

/**
 * Save a new itinerary to Firestore - creates collections if they don't exist
 */
export const saveItinerary = async (userId, itineraryData) => {
  try {
    console.log("Saving itinerary for user:", userId);
    
    // Step 1: Ensure the user document exists (creates users collection if needed)
    const userDocRef = doc(db, "users", userId);
    
    // Check if user document exists
    const userSnapshot = await getDoc(userDocRef);
    
    // If user document doesn't exist, create it
    if (!userSnapshot.exists()) {
      console.log("Creating user document...");
      await setDoc(userDocRef, {
        uid: userId,
        createdAt: serverTimestamp()
      });
      console.log("User document created successfully");
    }
    
    // Step 2: Create an extremely simplified data structure for Firestore
    // This avoids any issues with complex objects
    const simpleTripData = {
      tripName: String(itineraryData.tripName || "My Trip"),
      source: String(itineraryData.source || ""),
      destination: String(itineraryData.destination || ""),
      numberOfDays: Number(itineraryData.numberOfDays) || 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      // Store complex data as JSON strings
      dayPlansJson: JSON.stringify(itineraryData.dayPlans || []),
      recommendationsJson: JSON.stringify({
        dining: itineraryData.dining || [],
        attractions: itineraryData.attractions || [],
        shopping: itineraryData.shopping || [], 
        transportation: itineraryData.transportation || []
      }),
      budget: String(itineraryData.estimatedBudget || "")
    };
    
    // Step 3: Add the trip document to the trips subcollection
    // This will automatically create the trips collection if it doesn't exist
    const tripsCollectionRef = collection(db, "users", userId, "trips");
    const docRef = await addDoc(tripsCollectionRef, simpleTripData);
    
    console.log("Itinerary saved successfully with ID:", docRef.id);
    return { 
      id: docRef.id,
      ...simpleTripData
    };
  } catch (error) {
    console.error("Error saving itinerary:", error);
    
    // Provide more detailed error information for debugging
    if (error.code) {
      console.error(`Firebase error code: ${error.code}`);
    }
    
    throw new Error(`Failed to save itinerary: ${error.message}`);
  }
};

/**
 * Get all itineraries for the authenticated user
 */
export const getUserItineraries = async (userId) => {
  try {
    // This will work with the collections created by the saveItinerary function
    const userTripsRef = collection(db, 'users', userId, 'trips');
    const q = query(userTripsRef);
    
    const querySnapshot = await getDocs(q);
    const itineraries = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Convert the stored JSON strings back to objects
      let dayPlans = [];
      let recommendations = { dining: [], attractions: [], shopping: [], transportation: [] };
      
      // Safely parse the JSON strings
      try {
        if (data.dayPlansJson) {
          dayPlans = JSON.parse(data.dayPlansJson);
        }
        
        if (data.recommendationsJson) {
          recommendations = JSON.parse(data.recommendationsJson);
        }
      } catch (e) {
        console.error("Error parsing JSON data:", e);
      }
      
      // Create a clean object for the frontend
      itineraries.push({
        id: doc.id,
        tripName: data.tripName,
        source: data.source,
        destination: data.destination,
        numberOfDays: data.numberOfDays,
        createdAt: data.createdAt,
        dayPlans: dayPlans,
        recommendations: recommendations,
        estimatedBudget: data.budget
      });
    });
    
    return itineraries;
  } catch (error) {
    console.error("Error fetching itineraries:", error);
    throw error;
  }
};

/**
 * Get a specific itinerary by ID
 */
export const getItineraryById = async (userId, itineraryId) => {
  try {
    console.log(`Fetching itinerary ${itineraryId} for user ${userId}`);
    
    // Try the /users/{userId}/trips/{itineraryId} path first (correct path based on saveItinerary)
    const tripRef = doc(db, 'users', userId, 'trips', itineraryId);
    const tripSnap = await getDoc(tripRef);
    
    if (tripSnap.exists()) {
      console.log('Found itinerary in trips collection');
      const data = tripSnap.data();
      
      // Convert the stored JSON strings back to objects
      let dayPlans = [];
      let recommendations = { dining: [], attractions: [], shopping: [], transportation: [] };
      
      // Safely parse the JSON strings
      try {
        if (data.dayPlansJson) {
          dayPlans = JSON.parse(data.dayPlansJson);
        }
        
        if (data.recommendationsJson) {
          recommendations = JSON.parse(data.recommendationsJson);
        }
      } catch (e) {
        console.error("Error parsing JSON data:", e);
      }
      
      // Return the parsed data
      return {
        id: tripSnap.id,
        tripName: data.tripName,
        source: data.source,
        destination: data.destination,
        numberOfDays: data.numberOfDays,
        createdAt: data.createdAt,
        dayPlans: dayPlans,
        recommendations: recommendations,
        estimatedBudget: data.budget
      };
    }
    
    // Fall back to the /users/{userId}/itineraries/{itineraryId} path
    console.log('Trying alternate path in itineraries collection');
    const itineraryRef = doc(db, 'users', userId, 'itineraries', itineraryId);
    const itinerarySnap = await getDoc(itineraryRef);
    
    if (itinerarySnap.exists()) {
      console.log('Found itinerary in itineraries collection');
      return {
        id: itinerarySnap.id,
        ...itinerarySnap.data()
      };
    }
    
    // If not found in either location, throw an error
    console.log('Itinerary not found in any collection');
    throw new Error('Itinerary not found');
  } catch (error) {
    console.error("Error fetching itinerary:", error);
    throw error;
  }
};

/**
 * Delete an itinerary
 */
export const deleteItinerary = async (userId, itineraryId) => {
  try {
    const itineraryRef = doc(db, 'users', userId, 'itineraries', itineraryId);
    await deleteDoc(itineraryRef);
    return true;
  } catch (error) {
    console.error("Error deleting itinerary:", error);
    throw error;
  }
};

/**
 * Update an existing itinerary
 */
export const updateItinerary = async (userId, itineraryId, updatedData) => {
  try {
    const itineraryRef = doc(db, 'users', userId, 'itineraries', itineraryId);
    await updateDoc(itineraryRef, updatedData);
    
    return {
      id: itineraryId,
      ...updatedData
    };
  } catch (error) {
    console.error("Error updating itinerary:", error);
    throw error;
  }
};

/**
 * Get a specific itinerary by ID without requiring userId
 */
export const getItineraryByIdSimple = async (itineraryId) => {
  try {
    // Get the itinerary from the collection without needing a userId
    const itineraryRef = doc(db, 'itineraries', itineraryId);
    const itinerarySnap = await getDoc(itineraryRef);
    
    if (!itinerarySnap.exists()) {
      throw new Error('Itinerary not found');
    }
    
    return {
      id: itinerarySnap.id,
      ...itinerarySnap.data()
    };
  } catch (error) {
    console.error("Error fetching itinerary:", error);
    throw error;
  }
};