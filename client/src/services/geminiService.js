import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the API with your key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Create a cache for itineraries to avoid repeated API calls
const itineraryCache = new Map();

/**
 * Generate an itinerary using Google's Gemini API with retry logic
 */
export const generateItinerary = async (source, destination, numberOfDays, notes = "") => {
  // Create a cache key based on the parameters
  const cacheKey = `${source}-${destination}-${numberOfDays}-${notes}`;
  
  // Check if we have a cached response
  if (itineraryCache.has(cacheKey)) {
    console.log("Using cached itinerary data");
    return itineraryCache.get(cacheKey);
  }
  
  // If there's a network issue or the API is overloaded, we'll retry a few times
  const MAX_RETRIES = 3;
  let retryCount = 0;
  let delay = 2000; // Start with a 2 second delay
  
  while (retryCount < MAX_RETRIES) {
    try {
      // Get the generative model
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      // Craft a detailed prompt
      const prompt = `
Create a detailed ${numberOfDays}-day travel itinerary from ${source} to ${destination}.
Additional notes: ${notes || "No special instructions provided."}

Format the response as a structured JSON object with the following structure:
{
  "dayPlans": [
    {
      "day": 1,
      "activities": [
        {"time": "Morning", "description": "Activity description", "location": "Location name", "notes": "Any special notes (optional)"},
        {"time": "Afternoon", "description": "Activity description", "location": "Location name"},
        {"time": "Evening", "description": "Activity description", "location": "Location name"}
      ],
      "accommodation": "Where to stay on this night",
      "transportation": "How to get around during this day"
    },
    // Repeat for each day...
  ],
  "recommendations": {
    "dining": ["Restaurant 1", "Restaurant 2", "Restaurant 3"],
    "attractions": ["Attraction 1", "Attraction 2", "Attraction 3"],
    "shopping": ["Shopping location 1", "Shopping location 2"],
    "transportation": ["Transport tip 1", "Transport tip 2"]
  },
  "estimatedBudget": "Estimated budget in PKR for the trip, including rough breakdown by category"
}

Important: Be specific about locations, add at least 5 activities per day distributed across morning, afternoon, and evening, and make sure to include local cultural experiences. Make sure you recommend authentic local cuisine and attractions. The entire response must be valid JSON that can be parsed.
      `;
      
      // Generate the itinerary
      console.log("Sending request to Gemini API...");
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the JSON
      console.log("Parsing Gemini response...");
      const cleanedJson = text.replace(/```json|```/g, "").trim();
      const itineraryData = JSON.parse(cleanedJson);
      
      // Cache the successful response
      itineraryCache.set(cacheKey, itineraryData);
      return itineraryData;
      
    } catch (error) {
      console.error(`Attempt ${retryCount + 1} failed:`, error);
      retryCount++;
      
      if (error.message.includes("503") || error.message.includes("overloaded")) {
        console.log(`API is overloaded, retrying in ${delay/1000} seconds...`);
        
        // Wait before retrying with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Double the delay for each retry
      } else {
        // For other errors, don't retry
        break;
      }
    }
  }
  
  // If all retries fail or it's another type of error, use fallback content
  console.log("Using fallback itinerary data");
  return generateFallbackItinerary(source, destination, numberOfDays, notes);
};

/**
 * Generate fallback itinerary data when the API is unavailable
 */
const generateFallbackItinerary = (source, destination, numberOfDays, not3es) => {
  const dayPlans = [];
  
  // Generate a basic itinerary structure based on number of days
  for (let day = 1; day <= numberOfDays; day++) {
    dayPlans.push({
      day,
      activities: [
        {
          time: "09:00 AM",
          description: `Breakfast at a local café in ${destination}`,
          location: "Local Café",
          notes: "Start your day with authentic local breakfast"
        },
        {
          time: "11:00 AM",
          description: `Visit ${destination}'s top attraction or landmark`,
          location: "Main Attraction",
          notes: "Take your time to explore"
        },
        {
          time: "01:00 PM",
          description: "Lunch at a popular restaurant",
          location: "Local Restaurant",
          notes: "Try the local specialty dishes"
        },
        {
          time: "03:00 PM",
          description: "Explore local markets and shops",
          location: "Downtown Area",
          notes: "Great for picking up souvenirs"
        },
        {
          time: "06:00 PM",
          description: "Dinner experience",
          location: "Recommended Restaurant",
          notes: "Make a reservation in advance"
        },
        {
          time: "08:00 PM",
          description: "Evening walk or cultural activity",
          location: "City Center",
          notes: "Experience the city's nightlife"
        }
      ],
      accommodation: day === numberOfDays ? `Return to ${source}` : `Hotel in ${destination}`,
      transportation: "Local taxi, rideshare or public transportation"
    });
  }
  
  // Create the fallback itinerary structure
  return {
    dayPlans,
    recommendations: {
      dining: [
        "Local street food vendors for authentic flavors",
        "Mid-range restaurant with local cuisine",
        "Fine dining experience for special occasions"
      ],
      attractions: [
        `${destination}'s main historical site`,
        "Local museum or art gallery",
        "Nearby natural attraction or park",
        "Popular viewpoint for city views",
        "Cultural center or performance venue"
      ],
      shopping: [
        "Traditional market for local crafts",
        "Modern shopping center for contemporary goods"
      ],
      transportation: [
        "Consider renting a car for flexibility",
        "Public transportation passes can save money",
        "Download local transportation apps"
      ]
    },
    estimatedBudget: `For a ${numberOfDays}-day trip to ${destination}, budget approximately $${75 * numberOfDays} per person per day for mid-range accommodations, meals, and activities. Adjust based on your travel style.`,
    fallback: true // Flag to indicate this is fallback content
  };
};

// Alias export for backward compatibility
export const generateAIItinerary = generateItinerary;