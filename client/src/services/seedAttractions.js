import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

// This function will seed the database with sample attractions
// You'll need to run this once to populate the attractions collection
export const seedAttractions = async () => {
  try {
    // Check if attractions already exist
    const attractionsRef = collection(db, 'attractions');
    const snapshot = await getDocs(attractionsRef);
    
    if (!snapshot.empty) {
      console.log('Attractions collection is already populated');
      return;
    }
    
    // Sample attractions data - these would typically come from a real API
    // The coordinates here are placeholders - replace with real coordinates
    const sampleAttractions = [
      {
        name: "Islamabad Monument",
        category: "Attraction",
        description: "Pakistan Monument is a national monument and heritage museum located on the western Shakarparian Hills in Islamabad, Pakistan.",
        coordinates: { latitude: 33.6936, longitude: 73.0666 },
        imageUrl: "https://example.com/images/islamabad-monument.jpg",
        tags: ["history", "architecture", "cultural", "photography"]
      },
      {
        name: "Faisal Mosque",
        category: "Attraction",
        description: "The Faisal Mosque is the national mosque of Pakistan located in the capital city of Islamabad.",
        coordinates: { latitude: 33.7295, longitude: 73.0372 },
        imageUrl: "https://example.com/images/faisal-mosque.jpg",
        tags: ["architecture", "religious", "cultural", "photography"]
      },
      {
        name: "Monal Restaurant",
        category: "Restaurant",
        description: "The Monal is a famous restaurant located on the Margalla Hills, offering panoramic views of Islamabad.",
        coordinates: { latitude: 33.7497, longitude: 73.0621 },
        imageUrl: "https://example.com/images/monal.jpg",
        tags: ["food", "scenic", "dining", "local cuisine"]
      },
      {
        name: "Daman-e-Koh",
        category: "Park",
        description: "A viewing point and hill top garden north of Islamabad, located in the middle of the Margalla Hills.",
        coordinates: { latitude: 33.7482, longitude: 73.0544 },
        imageUrl: "https://example.com/images/daman-e-koh.jpg",
        tags: ["nature", "photography", "scenic", "hiking"]
      },
      {
        name: "Lok Virsa Museum",
        category: "Museum",
        description: "A cultural museum that showcases the heritage of Pakistan, displaying artifacts, textiles, and cultural exhibits.",
        coordinates: { latitude: 33.6926, longitude: 73.0766 },
        imageUrl: "https://example.com/images/lok-virsa.jpg",
        tags: ["history", "cultural", "art", "museums"]
      },
      {
        name: "Rawal Lake",
        category: "Attraction",
        description: "An artificial reservoir that provides the water needs for the cities of Rawalpindi and Islamabad.",
        coordinates: { latitude: 33.6998, longitude: 73.1231 },
        imageUrl: "https://example.com/images/rawal-lake.jpg",
        tags: ["nature", "water", "outdoor", "relaxation"]
      },
      {
        name: "Centaurus Mall",
        category: "Shopping",
        description: "A luxury shopping mall in Islamabad featuring local and international brands, dining options, and entertainment.",
        coordinates: { latitude: 33.7078, longitude: 73.0498 },
        imageUrl: "https://example.com/images/centaurus.jpg",
        tags: ["shopping", "entertainment", "food", "urban"]
      },
      {
        name: "Trail 5",
        category: "Mountain",
        description: "A popular hiking trail in the Margalla Hills, offering a moderate trek with beautiful views of Islamabad.",
        coordinates: { latitude: 33.7418, longitude: 73.0654 },
        imageUrl: "https://example.com/images/trail5.jpg",
        tags: ["hiking", "nature", "adventure", "outdoor"]
      },
      {
        name: "Pakistan National Council of the Arts",
        category: "Museum",
        description: "An art gallery and cultural complex hosting exhibitions, music performances, and other cultural events.",
        coordinates: { latitude: 33.7029, longitude: 73.0591 },
        imageUrl: "https://example.com/images/pnca.jpg",
        tags: ["art", "cultural", "museums", "music"]
      },
      {
        name: "Saidpur Village",
        category: "Attraction",
        description: "A restored ancient village with traditional architecture, craft shops, and restaurants.",
        coordinates: { latitude: 33.7425, longitude: 73.0545 },
        imageUrl: "https://example.com/images/saidpur.jpg",
        tags: ["history", "cultural", "food", "architecture"]
      },
      {
        name: "F-9 Park",
        category: "Park",
        description: "A large public recreational area with jogging tracks, playgrounds, and green spaces.",
        coordinates: { latitude: 33.7010, longitude: 73.0287 },
        imageUrl: "https://example.com/images/f9park.jpg", 
        tags: ["nature", "relaxation", "outdoor", "sports"]
      },
      {
        name: "Wild Wings Restaurant",
        category: "Restaurant",
        description: "Famous for its chicken wings with various sauces, this casual dining spot is popular among locals.",
        coordinates: { latitude: 33.7002, longitude: 73.0407 },
        imageUrl: "https://example.com/images/wild-wings.jpg",
        tags: ["food", "dining", "local cuisine"]
      }
    ];
    
    // Add attractions to Firestore
    for (const attraction of sampleAttractions) {
      await addDoc(attractionsRef, {
        ...attraction,
        createdAt: new Date()
      });
    }
    
    console.log('Successfully added sample attractions to database');
  } catch (error) {
    console.error('Error seeding attractions:', error);
    throw error;
  }
};