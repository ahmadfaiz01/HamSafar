/* eslint-disable no-unused-vars */
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  GeoPoint
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Mock data for testing
const mockAttractions = [
  {
    id: 'pakistan-monument',
    name: "Pakistan Monument",
    category: "Attraction",
    description: "Pakistan Monument is a national monument and heritage museum located on the western Shakarparian Hills in Islamabad, Pakistan.",
    coordinates: { latitude: 33.6936, longitude: 73.0666 },
    imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AC9h4nqr8O7UmI9bj9CQ3_U896EVExCekEj0RlxiKQ1K14vNnv3nxOZ1Du3PKgfSbEOoq3D_VVeZm-pABu_9CXEiJgaYZgS98iNp2skGKsC1colYwSOWJtbCuUKIaEo4N0bKKoFHUzQWKg=w270-h312-n-k-no",
    tags: ["history", "architecture", "cultural"],
    distance: 1200
  },
  {
    id: 'faisal-mosque',
    name: "Faisal Mosque",
    category: "Attraction",
    description: "The Faisal Mosque is the national mosque of Pakistan located in the capital city of Islamabad.",
    coordinates: { latitude: 33.7295, longitude: 73.0372 },
    imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/AC9h4nr1q7e0wKOTnT_JO4FDStq0Z8w6N9CLX89P7_qjN2XbEIN7bIZwv6pm_2eLyz4Ag_UcO41Ze960iCB55u-aXspZNYDQ4ANvXiuBG-tI-OXfj82-35pBu-2BvbKuY7wZBju5n_A=w270-h312-n-k-no",
    tags: ["architecture", "religious", "cultural"],
    distance: 5600
  },
  {
    id: 'daman-e-koh',
    name: "Daman-e-Koh",
    category: "Park",
    description: "A viewing point and hill top garden north of Islamabad, located in the middle of the Margalla Hills.",
    coordinates: { latitude: 33.7482, longitude: 73.0544 },
    imageUrl: "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1661243929/Daman-e-Koh_travelapakistani_pic.jpg",
    tags: ["nature", "photography", "scenic"],
    distance: 7500
  },
  // Rahim Yar Khan attractions
  {
    id: 'sadiq-palace',
    name: "Sadiq Palace",
    category: "Historical",
    description: "Sadiq Palace is a historical building and the former residence of the Nawab of Bahawalpur. It features impressive architecture and beautiful gardens.",
    coordinates: { latitude: 29.1050, longitude: 71.2749 },
    imageUrl: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcSyaVZF-yL9qF-VRO_nJWXeYn6sdw1t9uZvRC-GgAQhVBpCQ6NNrPfNs202hnbEils8we6cBNygo5SuWcHmB6zMhSuZN-hG2w",
    tags: ["history", "architecture", "cultural", "heritage"],
    distance: 1500
  },
  {
    id: 'bhung-masjid',
    name: "Bhung Mosque",
    category: "Islamic Culture",
    description: "The Bhung Mosque is a historical mosque located in the Bahawalpur District of Punjab, Pakistan. It is known for its unique architecture and intricate tile work.",
    coordinates: { latitude: 29.2523, longitude: 69.5441 },
    imageUrl: "https://i.dawn.com/primary/2018/02/5a7c2cbec3940.jpg",
    tags: ["history", "architecture", "cultural", "heritage"],
    distance: 800
  },
  {
    id: 'patan-minara',
    name: "Patan Minara",
    category: "Historical",
    description: "Patan Minara is a historical site located in the Bahawalpur District of Punjab, Pakistan. It features ancient ruins and is known for its archaeological significance.",
    coordinates: { latitude: 28.3216, longitude: 70.1726 },
    imageUrl: "https://i.tribune.com.pk/media/images/549612-building-1368625549/549612-building-1368625549.jpg",
    tags: ["history", "architecture", "cultural", "heritage"],
    distance: 1500
  },
  {
    id: 'noor-mahal',
    name: "Noor Mahal",
    category: "Historical",
    description: "Noor Mahal is a palace in Bahawalpur near Rahim Yar Khan, built in 1875 during the reign of Nawab Sir Muhammad Sadiq. It combines Italian and Mughal architectural styles.",
    coordinates: { latitude: 29.3794, longitude: 71.6681 },
    imageUrl: "https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcQdu2dnS3G0efbfxvc_YcgVei1nb4DOMffD8blM1A8YR2O1SSOqGmWsl63RRg7RuX8DHYa4nHMd1cUB0xnqYu6LCuWf0JQSfA",
    tags: ["palace", "history", "architecture", "heritage"],
    distance: 2000
  }
];

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

/**
 * Get nearby attractions using mock data instead of GeoFirestore
 * @param {Object} coordinates - User's coordinates {latitude, longitude}
 * @param {Array} interests - User's interests
 * @returns {Array} Array of nearby attractions
 */
export const getNearbyAttractions = (coordinates, interests = []) => {
  try {
    console.log('Getting nearby attractions with coordinates:', coordinates);
    
    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      console.error('Invalid coordinates provided');
      return [];
    }
    
    // Find the nearest city to determine which data to use
    const islamabadLocation = { latitude: 33.6844, longitude: 73.0479 };
    const rahimYarKhanLocation = { latitude: 28.4212, longitude: 70.2989 };
    
    const distanceToIslamabad = calculateDistance(
      coordinates.latitude, coordinates.longitude,
      islamabadLocation.latitude, islamabadLocation.longitude
    );
    
    const distanceToRahimYarKhan = calculateDistance(
      coordinates.latitude, coordinates.longitude,
      rahimYarKhanLocation.latitude, rahimYarKhanLocation.longitude
    );
    
    console.log(`Distance to Islamabad: ${distanceToIslamabad/1000} km`);
    console.log(`Distance to Rahim Yar Khan: ${distanceToRahimYarKhan/1000} km`);
    
    // Calculate distance for each attraction based on user location
    const attractionsWithDistance = mockAttractions.map(attraction => {
      const distance = calculateDistance(
        coordinates.latitude, coordinates.longitude,
        attraction.coordinates.latitude, attraction.coordinates.longitude
      );
      
      return {
        ...attraction,
        distance: Math.round(distance)
      };
    });
    
    // Filter by city if the exact city coordinates are used
    let filteredAttractions = [...attractionsWithDistance];
    
    // If coordinates exactly match Islamabad's test coordinates
    if (coordinates.latitude === islamabadLocation.latitude && 
        coordinates.longitude === islamabadLocation.longitude) {
      filteredAttractions = filteredAttractions.filter(attraction => 
        attraction.coordinates.latitude > 33 && 
        attraction.coordinates.latitude < 34
      );
    } 
    // If coordinates exactly match Rahim Yar Khan's test coordinates
    else if (coordinates.latitude === rahimYarKhanLocation.latitude && 
             coordinates.longitude === rahimYarKhanLocation.longitude) {
      filteredAttractions = filteredAttractions.filter(attraction => 
        attraction.coordinates.latitude > 28 && 
        attraction.coordinates.latitude < 29
      );
    }
    // Otherwise, show attractions within 50km
    else {
      filteredAttractions = filteredAttractions.filter(attraction => 
        attraction.distance < 50000
      );
    }
    
    // Sort by distance
    let sortedAttractions = filteredAttractions.sort((a, b) => a.distance - b.distance);
    
    // Apply interest filtering if applicable
    if (interests && interests.length > 0) {
      const normalizedInterests = interests.map(i => i.toLowerCase());
      
      // Resort by interests match first, then distance
      sortedAttractions = sortedAttractions.sort((a, b) => {
        const aTags = a.tags || [];
        const bTags = b.tags || [];
        
        const aMatchesInterests = aTags.some(tag => 
          normalizedInterests.includes(tag.toLowerCase())
        );
        
        const bMatchesInterests = bTags.some(tag => 
          normalizedInterests.includes(tag.toLowerCase())
        );
        
        if (aMatchesInterests && !bMatchesInterests) return -1;
        if (!aMatchesInterests && bMatchesInterests) return 1;
        return a.distance - b.distance;
      });
    }
    
    console.log(`Found ${sortedAttractions.length} attractions`);
    return sortedAttractions;
    
  } catch (error) {
    console.error('Error in getNearbyAttractions:', error);
    return [];
  }
};

/**
 * Add a location to user's wishlist
 * @param {string} userId - User ID
 * @param {Object} attraction - Attraction object
 */
export const addToWishlist = async (userId, attraction) => {
  try {
    // Reference to user's wishlist collection
    const wishlistRef = collection(db, 'users', userId, 'wishlist');
    
    // Check if already in wishlist
    const existingQuery = query(wishlistRef, where('placeId', '==', attraction.id));
    const existingSnap = await getDocs(existingQuery);
    
    if (!existingSnap.empty) {
      console.log('Place already in wishlist');
      return;
    }
    
    // Add to wishlist
    await addDoc(wishlistRef, {
      placeId: attraction.id,
      name: attraction.name,
      category: attraction.category,
      description: attraction.description,
      coordinates: attraction.coordinates,
      imageUrl: attraction.imageUrl,
      addedAt: serverTimestamp()
    });
    
    console.log(`Added ${attraction.name} to wishlist`);
    return true;
    
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw new Error('Failed to add to wishlist');
  }
};

/**
 * Create a new point of interest using Firebase v9 syntax
 */
export const createPointOfInterest = async (poiData) => {
  try {
    // Use the Firebase v9 syntax to add a new document
    const locationsRef = collection(db, 'locations');
    
    // Create proper Firestore GeoPoint for coordinates
    const geopoint = new GeoPoint(
      poiData.coordinates.latitude,
      poiData.coordinates.longitude
    );
    
    // Add the document to the collection
    const docRef = await addDoc(locationsRef, {
      ...poiData,
      coordinates: geopoint,
      createdAt: serverTimestamp()
    });
    
    return docRef.id;
    
  } catch (error) {
    console.error('Error creating point of interest:', error);
    throw new Error('Failed to create point of interest');
  }
};

/**
 * Seed the database with sample points of interest
 */
export const seedPointsOfInterest = async (poisArray) => {
  try {
    const addedPois = [];
    
    for (const poi of poisArray) {
      try {
        // Create a document reference in the locations collection
        const locationsRef = collection(db, 'locations');
        
        // Convert coordinates to GeoPoint
        const geopoint = new GeoPoint(
          poi.coordinates.latitude,
          poi.coordinates.longitude
        );
        
        // Add the document with proper data structure for Firebase v9
        const docRef = await addDoc(locationsRef, {
          name: poi.name,
          category: poi.category,
          description: poi.description,
          coordinates: geopoint, // Use GeoPoint
          imageUrl: poi.imageUrl,
          tags: poi.tags || [],
          createdAt: serverTimestamp()
        });
        
        addedPois.push(docRef.id);
      } catch (err) {
        console.error(`Failed to add POI ${poi.name}:`, err);
      }
    }
    
    console.log(`Added ${addedPois.length} points of interest`);
    return addedPois;
    
  } catch (error) {
    console.error('Error seeding points of interest:', error);
    throw new Error('Failed to seed points of interest');
  }
};