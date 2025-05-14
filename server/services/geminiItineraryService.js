const Itinerary = require('../models/Itinerary');
const Destination = require('../models/Destination');

/**
 * Generate optimized itinerary using Gemini AI
 */
exports.generateAIItinerary = async (itineraryId, userId) => {
  try {
    // Fetch the itinerary with all its details
    const itinerary = await Itinerary.findOne({ 
      _id: itineraryId, 
      user: userId 
    }).populate('destinations.destinationId');
    
    if (!itinerary) {
      throw new Error('Itinerary not found');
    }
    
    // Extract relevant data to feed into Gemini
    const tripData = {
      tripDuration: itinerary.tripDuration,
      totalBudget: itinerary.totalBudget,
      destinations: itinerary.destinations.map(dest => ({
        name: dest.name,
        location: dest.location,
        order: dest.order
      })),
      startDate: itinerary.startDate,
      endDate: itinerary.endDate,
      preferences: itinerary.travelPreferences || {}
    };
    
    // Call Gemini API for recommendations
    const aiRecommendations = await callGeminiForItineraryRecommendations(tripData);
    
    // Generate daily schedule based on Gemini's recommendations
    const days = generateDailySchedule(tripData, aiRecommendations);
    
    // Update the itinerary with Gemini's recommendations and days
    const updatedItinerary = await Itinerary.findOneAndUpdate(
      { _id: itineraryId },
      { 
        aiRecommendations,
        days,
        status: 'planned'
      },
      { new: true }
    );
    
    return updatedItinerary;
  } catch (error) {
    console.error('Error generating AI itinerary:', error);
    throw error;
  }
};

/**
 * Call Gemini API to get itinerary recommendations
 * Note: You'll need to connect this to your actual Gemini implementation
 */
async function callGeminiForItineraryRecommendations(tripData) {
  try {
    // Format prompt for Gemini
    const prompt = formatItineraryPrompt(tripData);
    
    // Call your existing Gemini API
    // This is a placeholder - you'll need to replace with your actual Gemini API call
    console.log('Calling Gemini API with prompt:', prompt);
    
    // For now, return mock data
    // In production, this would be replaced with your actual Gemini API response
    return generateMockGeminiResponse(tripData);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

/**
 * Format prompt for Gemini API
 */
function formatItineraryPrompt(tripData) {
  const { tripDuration, totalBudget, destinations, startDate, preferences } = tripData;
  
  // Format dates
  const formattedStartDate = new Date(startDate).toLocaleDateString('en-US', { 
    month: 'long', day: 'numeric', year: 'numeric' 
  });
  
  // Format destinations
  const destinationsString = destinations
    .map(dest => `${dest.name}, ${dest.location}`)
    .join(' → ');
  
  // Build the prompt
  return `Create a detailed ${tripDuration}-day travel itinerary for Pakistan with the following details:

Trip Duration: ${tripDuration} days
Starting Date: ${formattedStartDate}
Total Budget: PKR ${totalBudget}
Destinations: ${destinationsString}

Travel Preferences:
- Style: ${preferences.travelStyle || 'Not specified'}
- Transportation: ${preferences.transportationPreference || 'Not specified'}
- Activity Level: ${preferences.activityLevel || 'Not specified'}
- Accommodation Type: ${preferences.accommodationType || 'Not specified'}

Please provide:
1. A day-by-day itinerary with activities, accommodations, and transportation
2. Suggested stops between destinations for better enjoyment
3. Budget recommendations for each day
4. Optimized route for efficiency
5. Tips to make the most of the trip within the budget

For each day, include:
- Accommodation with estimated cost
- 2-3 activities with estimated costs
- Transportation details with estimated costs
- Meal recommendations with estimated costs
- Daily budget breakdown
`;
}

/**
 * Generate a mock response as if it came from Gemini
 * This is a placeholder - in production, this would be replaced with the actual Gemini response
 */
function generateMockGeminiResponse(tripData) {
  const { tripDuration, destinations, totalBudget } = tripData;
  
  // Mock suggested stops between destinations
  const suggestedStops = [
    {
      name: "Ayubia National Park",
      reason: "Beautiful forest with hiking trails and scenic viewpoints",
      location: "Near Murree, Punjab"
    },
    {
      name: "Katas Raj Temples",
      reason: "Historic Hindu temple complex with a sacred pond",
      location: "Chakwal, Punjab"
    },
    {
      name: "Rohtas Fort",
      reason: "UNESCO World Heritage site, historical fortress from the 16th century",
      location: "Jhelum, Punjab"
    },
    {
      name: "Taxila Museum",
      reason: "Archaeological museum showcasing ancient artifacts from the region",
      location: "Taxila, Punjab"
    }
  ];
  
  // Mock budget tips
  const budgetTips = [
    "Consider staying in guesthouses instead of hotels to save 30-40% on accommodation costs",
    "Use local transportation like buses or shared vans between cities to save on travel expenses",
    "Eat at local dhabbas for authentic and affordable Pakistani cuisine",
    "Visit attractions on weekdays to avoid weekend crowds and sometimes get discounted entry fees",
    "Carry a reusable water bottle and refill it instead of buying bottled water repeatedly"
  ];
  
  // Calculate average daily budget
  const dailyBudget = Math.round(totalBudget / tripDuration);
  
  // Mock weather considerations based on current season
  const currentMonth = new Date().getMonth();
  let weatherConsiderations = "";
  
  if (currentMonth >= 5 && currentMonth <= 8) {
    weatherConsiderations = "Summer season in Pakistan can be extremely hot in southern regions. Carry lightweight, breathable clothing, sun protection, and stay hydrated. Northern areas will be pleasant with mild temperatures.";
  } else if (currentMonth >= 9 && currentMonth <= 11) {
    weatherConsiderations = "Autumn is an excellent time to visit most parts of Pakistan with moderate temperatures. Light rainfall possible in northern areas, so carry a light raincoat.";
  } else if (currentMonth >= 0 && currentMonth <= 2) {
    weatherConsiderations = "Winter brings snow to northern areas, making some roads inaccessible. Southern regions remain mild and pleasant. Pack warm clothing for northern destinations.";
  } else {
    weatherConsiderations = "Spring offers blooming landscapes and moderate temperatures across Pakistan. Occasional rainfall might occur, so bring a light raincoat.";
  }
  
  // Generate optimized route
  const destinationNames = destinations.map(d => d.name).join(' → ');
  const optimizedRoute = `The most efficient route for your trip is: ${destinationNames}. This route minimizes travel time and allows for a smooth progression between destinations.`;
  
  // Generate timing recommendations
  const timingRecommendations = "Start your days early (around 8 AM) to maximize sightseeing time and avoid afternoon crowds. Plan major outdoor activities in the morning hours when temperatures are more comfortable. Allow for rest periods in the afternoon, especially during summer months.";
  
  return {
    suggestedStops,
    optimizedRoute,
    budgetTips,
    weatherConsiderations,
    timingRecommendations
  };
}

/**
 * Generate daily schedule based on Gemini's recommendations and trip data
 */
function generateDailySchedule(tripData, aiRecommendations) {
  const { tripDuration, destinations, totalBudget, startDate } = tripData;
  const dailyBudget = Math.round(totalBudget / tripDuration);
  
  const days = [];
  let currentDate = new Date(startDate);
  
  // Generate a day-by-day itinerary
  for (let i = 0; i < tripDuration; i++) {
    const dayDate = new Date(currentDate);
    const destinationIndex = Math.min(i, destinations.length - 1);
    const currentDestination = destinations[destinationIndex];
    
    // Mock accommodation options based on budget and preferences
    const accommodationOptions = {
      budget: {
        name: "Budget Guesthouse",
        cost: Math.round(dailyBudget * 0.3),
        notes: "Simple but clean accommodation with basic amenities"
      },
      standard: {
        name: "Mid-range Hotel",
        cost: Math.round(dailyBudget * 0.4),
        notes: "Comfortable rooms with good amenities and breakfast included"
      },
      luxury: {
        name: "Luxury Resort",
        cost: Math.round(dailyBudget * 0.5),
        notes: "High-end accommodation with excellent service and amenities"
      }
    };
    
    // Mock activities based on destination
    const activities = [
      {
        name: `Visit ${currentDestination.name} main attractions`,
        location: currentDestination.location,
        time: "10:00 AM - 1:00 PM",
        cost: Math.round(dailyBudget * 0.1),
        notes: "Explore the main sights and historical landmarks"
      },
      {
        name: "Local cultural experience",
        location: currentDestination.location,
        time: "3:00 PM - 5:00 PM",
        cost: Math.round(dailyBudget * 0.05),
        notes: "Immerse in local culture and traditions"
      },
      {
        name: "Evening leisure activity",
        location: currentDestination.location,
        time: "7:00 PM - 9:00 PM",
        cost: Math.round(dailyBudget * 0.05),
        notes: "Enjoy the evening atmosphere of the destination"
      }
    ];
    
    // Mock meals
    const meals = [
      {
        type: "breakfast",
        location: accommodationOptions.standard.name,
        cost: Math.round(dailyBudget * 0.05),
        notes: "Included with accommodation"
      },
      {
        type: "lunch",
        location: "Local restaurant",
        cost: Math.round(dailyBudget * 0.1),
        notes: "Try local specialties"
      },
      {
        type: "dinner",
        location: "Recommended restaurant",
        cost: Math.round(dailyBudget * 0.15),
        notes: "Experience authentic Pakistani cuisine"
      }
    ];
    
    // Mock transportation
    const transportation = {
      type: i === 0 ? "Arrival transportation" : "Local transportation",
      from: i === 0 ? "Starting point" : destinations[Math.max(0, destinationIndex - 1)].name,
      to: currentDestination.name,
      cost: Math.round(dailyBudget * 0.2),
      notes: "Convenient and comfortable transportation option"
    };
    
    // Create day object
    days.push({
      dayNumber: i + 1,
      date: dayDate,
      accommodation: accommodationOptions.standard,
      activities,
      transportation,
      meals,
      dailyBudget,
      notes: `Day ${i + 1} in ${currentDestination.name}. ${i === 0 ? 'Arrival day' : i === tripDuration - 1 ? 'Departure day' : 'Exploration day'}.`
    });
    
    // Increment date by 1 day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
}
