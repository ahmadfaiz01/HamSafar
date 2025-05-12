import axios from 'axios';

// Direct API credentials (not recommended for production)
const AMADEUS_API_KEY = 'PgcbkJSO7ETAATzavNfZyazYTnKo5AGG'; // Your actual key
const AMADEUS_API_SECRET = '2Ya38grS3iyN8sZb'; // Your actual secret

// Token management
let apiToken = null;
let tokenExpiry = null;

// Get authentication token
const getAmadeusToken = async () => {
  // Check if we already have a valid token
  if (apiToken && tokenExpiry && new Date() < tokenExpiry) {
    console.log('Using existing token');
    return apiToken;
  }
  
  console.log('Getting new Amadeus token');
  try {
    const response = await axios.post(
      'https://test.api.amadeus.com/v1/security/oauth2/token',
      new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': AMADEUS_API_KEY,
        'client_secret': AMADEUS_API_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    console.log('Token received successfully');
    
    // Store the token and calculate expiry time
    apiToken = response.data.access_token;
    
    // Set expiry time (usually 1800 seconds/30 mins)
    const expiresIn = response.data.expires_in || 1800;
    tokenExpiry = new Date(new Date().getTime() + expiresIn * 1000);
    
    return apiToken;
  } catch (err) {
    console.error('Amadeus API authentication error:', err);
    console.error('Response:', err.response?.data);
    throw new Error('Failed to authenticate with Amadeus API');
  }
};

// Format date for API
const formatDate = (date) => {
  if (!date) return null;
  if (typeof date === 'string') return date;
  return date instanceof Date ? date.toISOString().split('T')[0] : date;
};

// Generate mock flight data for development
const generateMockFlightOffers = (params) => {
  console.log('Generating mock flight offers with params:', params);
  
  const isRoundTrip = !!params.returnDate;
  const departDate = new Date(params.departureDate);
  const returnDate = params.returnDate ? new Date(params.returnDate) : null;
  
  const flightOffers = [];
  const airlines = [
    { code: 'PK', name: 'Pakistan International Airlines' },
    { code: 'EK', name: 'Emirates' },
    { code: 'QR', name: 'Qatar Airways' },
    { code: 'TK', name: 'Turkish Airlines' },
    { code: 'ET', name: 'Ethiopian Airlines' },
    { code: 'EY', name: 'Etihad Airways' }
  ];
  
  // Generate 5-15 random flight offers
  const numOffers = Math.floor(Math.random() * 11) + 5;
  
  for (let i = 0; i < numOffers; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const price = Math.floor(Math.random() * 800) + 200; // $200-$1000
    const duration = Math.floor(Math.random() * 600) + 120; // 2-12 hours in minutes
    
    // Create departure segment
    const outboundDepartureTime = new Date(departDate);
    outboundDepartureTime.setHours(Math.floor(Math.random() * 24));
    outboundDepartureTime.setMinutes(Math.floor(Math.random() * 4) * 15); // 0, 15, 30, or 45 minutes
    
    const outboundArrivalTime = new Date(outboundDepartureTime);
    outboundArrivalTime.setMinutes(outboundArrivalTime.getMinutes() + duration);
    
    // Generate multiple segments for some flights
    const outboundSegments = [];
    
    // Direct flight or connecting flight?
    const isConnecting = Math.random() > 0.6;
    
    if (isConnecting) {
      // First segment
      const connectionCities = ['DXB', 'DOH', 'IST', 'AUH', 'CAI'];
      const connectionCity = connectionCities[Math.floor(Math.random() * connectionCities.length)];
      const firstSegmentDuration = Math.floor(duration * 0.4);
      
      const midpointTime = new Date(outboundDepartureTime);
      midpointTime.setMinutes(midpointTime.getMinutes() + firstSegmentDuration);
      
      outboundSegments.push({
        departure: {
          iataCode: params.originLocationCode,
          at: outboundDepartureTime.toISOString()
        },
        arrival: {
          iataCode: connectionCity,
          at: midpointTime.toISOString()
        },
        carrierCode: airline.code,
        number: String(Math.floor(Math.random() * 900) + 100),
        duration: String(firstSegmentDuration),
        id: `segment-${i}-1`
      });
      
      // Connection time
      const connectionTime = Math.floor(Math.random() * 120) + 60; // 1-3 hours
      const connectionDepartureTime = new Date(midpointTime);
      connectionDepartureTime.setMinutes(connectionDepartureTime.getMinutes() + connectionTime);
      
      // Second segment
      outboundSegments.push({
        departure: {
          iataCode: connectionCity,
          at: connectionDepartureTime.toISOString()
        },
        arrival: {
          iataCode: params.destinationLocationCode,
          at: outboundArrivalTime.toISOString()
        },
        carrierCode: airline.code,
        number: String(Math.floor(Math.random() * 900) + 100),
        duration: String(duration - firstSegmentDuration),
        id: `segment-${i}-2`
      });
    } else {
      // Direct flight
      outboundSegments.push({
        departure: {
          iataCode: params.originLocationCode,
          at: outboundDepartureTime.toISOString()
        },
        arrival: {
          iataCode: params.destinationLocationCode,
          at: outboundArrivalTime.toISOString()
        },
        carrierCode: airline.code,
        number: String(Math.floor(Math.random() * 900) + 100),
        duration: String(duration),
        id: `segment-${i}-1`
      });
    }
    
    const flightOffer = {
      id: `offer-${i}`,
      itineraries: [
        {
          duration: `PT${Math.floor(duration / 60)}H${duration % 60}M`,
          segments: outboundSegments
        }
      ],
      price: {
        currency: 'USD',
        total: String(price),
        base: String(Math.floor(price * 0.85))
      },
      travelerPricings: []
    };
    
    // Add return flight for round trips
    if (isRoundTrip && returnDate) {
      const returnDuration = Math.floor(Math.random() * 600) + 120; // 2-12 hours in minutes
      
      const returnDepartureTime = new Date(returnDate);
      returnDepartureTime.setHours(Math.floor(Math.random() * 24));
      returnDepartureTime.setMinutes(Math.floor(Math.random() * 4) * 15); // 0, 15, 30, or 45 minutes
      
      const returnArrivalTime = new Date(returnDepartureTime);
      returnArrivalTime.setMinutes(returnArrivalTime.getMinutes() + returnDuration);
      
      // Generate return segments (direct or connecting)
      const returnSegments = [];
      const isReturnConnecting = Math.random() > 0.6;
      
      if (isReturnConnecting) {
        // First segment of return
        const connectionCities = ['DXB', 'DOH', 'IST', 'AUH', 'CAI'];
        const connectionCity = connectionCities[Math.floor(Math.random() * connectionCities.length)];
        const firstSegmentDuration = Math.floor(returnDuration * 0.4);
        
        const midpointTime = new Date(returnDepartureTime);
        midpointTime.setMinutes(midpointTime.getMinutes() + firstSegmentDuration);
        
        returnSegments.push({
          departure: {
            iataCode: params.destinationLocationCode,
            at: returnDepartureTime.toISOString()
          },
          arrival: {
            iataCode: connectionCity,
            at: midpointTime.toISOString()
          },
          carrierCode: airline.code,
          number: String(Math.floor(Math.random() * 900) + 100),
          duration: String(firstSegmentDuration),
          id: `segment-${i}-r1`
        });
        
        // Connection time
        const connectionTime = Math.floor(Math.random() * 120) + 60; // 1-3 hours
        const connectionDepartureTime = new Date(midpointTime);
        connectionDepartureTime.setMinutes(connectionDepartureTime.getMinutes() + connectionTime);
        
        // Second segment of return
        returnSegments.push({
          departure: {
            iataCode: connectionCity,
            at: connectionDepartureTime.toISOString()
          },
          arrival: {
            iataCode: params.originLocationCode,
            at: returnArrivalTime.toISOString()
          },
          carrierCode: airline.code,
          number: String(Math.floor(Math.random() * 900) + 100),
          duration: String(returnDuration - firstSegmentDuration),
          id: `segment-${i}-r2`
        });
      } else {
        // Direct return flight
        returnSegments.push({
          departure: {
            iataCode: params.destinationLocationCode,
            at: returnDepartureTime.toISOString()
          },
          arrival: {
            iataCode: params.originLocationCode,
            at: returnArrivalTime.toISOString()
          },
          carrierCode: airline.code,
          number: String(Math.floor(Math.random() * 900) + 100),
          duration: String(returnDuration),
          id: `segment-${i}-r1`
        });
      }
      
      flightOffer.itineraries.push({
        duration: `PT${Math.floor(returnDuration / 60)}H${returnDuration % 60}M`,
        segments: returnSegments
      });
      
      // Increase price for round trips
      flightOffer.price.total = String(Math.floor(price * 1.8));
      flightOffer.price.base = String(Math.floor(price * 1.8 * 0.85));
    }
    
    // Add traveler pricings
    const adults = params.adults || 1;
    const children = params.children || 0;
    const infants = params.infants || 0;
    
    // Adult pricing
    for (let j = 0; j < adults; j++) {
      flightOffer.travelerPricings.push({
        travelerId: `T${j + 1}`,
        travelerType: 'ADULT',
        price: {
          currency: 'USD',
          total: String(Math.floor(price / adults))
        },
        fareDetailsBySegment: flightOffer.itineraries.flatMap(itinerary => 
          itinerary.segments.map(segment => ({
            segmentId: segment.id,
            cabin: params.travelClass || 'ECONOMY',
            fareBasis: `${airline.code}ECO`,
            includedCheckedBags: {
              quantity: 1
            }
          }))
        )
      });
    }
    
    // Child pricing
    for (let j = 0; j < children; j++) {
      flightOffer.travelerPricings.push({
        travelerId: `T${adults + j + 1}`,
        travelerType: 'CHILD',
        price: {
          currency: 'USD',
          total: String(Math.floor(price * 0.8 / adults)) // 80% of adult price
        },
        fareDetailsBySegment: flightOffer.itineraries.flatMap(itinerary => 
          itinerary.segments.map(segment => ({
            segmentId: segment.id,
            cabin: params.travelClass || 'ECONOMY',
            fareBasis: `${airline.code}CHLD`,
            includedCheckedBags: {
              quantity: 1
            }
          }))
        )
      });
    }
    
    // Infant pricing
    for (let j = 0; j < infants; j++) {
      flightOffer.travelerPricings.push({
        travelerId: `T${adults + children + j + 1}`,
        travelerType: 'INFANT',
        price: {
          currency: 'USD',
          total: String(Math.floor(price * 0.2 / adults)) // 20% of adult price
        },
        fareDetailsBySegment: flightOffer.itineraries.flatMap(itinerary => 
          itinerary.segments.map(segment => ({
            segmentId: segment.id,
            cabin: params.travelClass || 'ECONOMY',
            fareBasis: `${airline.code}INF`,
            includedCheckedBags: {
              quantity: 0
            }
          }))
        )
      });
    }
    
    flightOffers.push(flightOffer);
  }
  
  return { data: flightOffers };
};

// Generate mock cheapest travel dates
const generateMockCheapestDates = (origin, destination, departureDate) => {
  const baseDate = new Date(departureDate);
  const options = [];
  
  // Generate 10 date options spanning 5 days before and after the selected date
  for (let i = -5; i <= 5; i++) {
    if (i === 0) continue; // Skip the actual search date
    
    const departureDateOption = new Date(baseDate);
    departureDateOption.setDate(departureDateOption.getDate() + i);
    
    const returnDateOption = new Date(departureDateOption);
    returnDateOption.setDate(returnDateOption.getDate() + (i > 0 ? 5 + i : 7 + i));
    
    // Generate a random price, making dates closer to the original date cheaper
    const priceVariation = Math.abs(i) * 10;
    const basePrice = 300; // Base price
    const price = basePrice - priceVariation + Math.floor(Math.random() * 50);
    
    options.push({
      departureDate: departureDateOption.toISOString().split('T')[0],
      returnDate: returnDateOption.toISOString().split('T')[0],
      price: {
        amount: String(price),
        currency: 'USD'
      }
    });
  }
  
  // Sort by price ascending
  options.sort((a, b) => parseInt(a.price.amount) - parseInt(b.price.amount));
  
  return options;
};

// Use mock data for development
const useMockData = true;

// Amadeus service object
const AmadeusService = {
  // Search flights
  searchFlights: async (params) => {
    if (useMockData) {
      console.log('Using mock data for flight search');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return generateMockFlightOffers(params);
    } else {
      try {
        console.log('Searching flights with params:', params);
        const token = await getAmadeusToken();
        
        // Format the parameters
        const searchParams = {
          originLocationCode: params.originLocationCode,
          destinationLocationCode: params.destinationLocationCode,
          departureDate: formatDate(params.departureDate),
          adults: params.adults || 1,
          currencyCode: 'USD'
        };
        
        // Add optional parameters
        if (params.returnDate) {
          searchParams.returnDate = formatDate(params.returnDate);
        }
        
        if (params.children) {
          searchParams.children = params.children;
        }
        
        if (params.infants) {
          searchParams.infants = params.infants;
        }
        
        if (params.travelClass) {
          searchParams.travelClass = params.travelClass;
        }
        
        if (params.nonStop !== undefined) {
          searchParams.nonStop = params.nonStop;
        }
        
        console.log('Final search params:', searchParams);
        
        const response = await axios.get(
          'https://test.api.amadeus.com/v2/shopping/flight-offers',
          {
            params: searchParams,
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        return response.data;
      } catch (error) {
        console.error('Flight search error:', error);
        console.error('Response data:', error.response?.data);
        
        if (error.response?.data?.errors) {
          const amadeusError = error.response.data.errors[0];
          throw new Error(amadeusError.detail || amadeusError.title || 'Error searching flights');
        }
        
        throw new Error('Failed to search for flights: ' + (error.message || 'Unknown error'));
      }
    }
  },
  
  // Find cheapest travel dates (always use mock data for this)
  findCheapestTravelDates: async (origin, destination, departureDate, returnDate) => {
    console.log('Finding cheapest travel dates:', {origin, destination, departureDate, returnDate});
    
    // Always use mock data for cheapest dates for now
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return generateMockCheapestDates(origin, destination, departureDate);
  },
  
  // Search for airports/cities
  searchLocations: async (keyword) => {
    if (!keyword || keyword.length < 2) return [];
    
    if (useMockData) {
      console.log('Using mock data for location search');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock airport data
      const airports = [
        {
          iataCode: 'JFK', 
          name: 'John F Kennedy International Airport',
          address: {cityName: 'New York', countryName: 'United States'}
        },
        {
          iataCode: 'LHR',
          name: 'Heathrow Airport',
          address: {cityName: 'London', countryName: 'United Kingdom'}
        },
        {
          iataCode: 'DXB',
          name: 'Dubai International Airport',
          address: {cityName: 'Dubai', countryName: 'United Arab Emirates'}
        },
        {
          iataCode: 'ISL',
          name: 'Islamabad International Airport',
          address: {cityName: 'Islamabad', countryName: 'Pakistan'}
        },
        {
          iataCode: 'LHE',
          name: 'Allama Iqbal International Airport',
          address: {cityName: 'Lahore', countryName: 'Pakistan'}
        },
        {
          iataCode: 'KHI',
          name: 'Jinnah International Airport',
          address: {cityName: 'Karachi', countryName: 'Pakistan'}
        },
        {
          iataCode: 'DEL',
          name: 'Indira Gandhi International Airport',
          address: {cityName: 'Delhi', countryName: 'India'}
        },
        {
          iataCode: 'CDG',
          name: 'Charles de Gaulle Airport',
          address: {cityName: 'Paris', countryName: 'France'}
        },
        {
          iataCode: 'SIN',
          name: 'Singapore Changi Airport',
          address: {cityName: 'Singapore', countryName: 'Singapore'}
        },
        {
          iataCode: 'PEK',
          name: 'Beijing Capital International Airport',
          address: {cityName: 'Beijing', countryName: 'China'}
        }
      ];
      
      // Filter airports based on keyword
      return airports.filter(airport => {
        const keyword_lower = keyword.toLowerCase();
        return (
          airport.name.toLowerCase().includes(keyword_lower) ||
          airport.iataCode.toLowerCase().includes(keyword_lower) ||
          airport.address.cityName.toLowerCase().includes(keyword_lower) ||
          airport.address.countryName.toLowerCase().includes(keyword_lower)
        );
      }).slice(0, 5); // Return only the first 5 matches
    } else {
      try {
        console.log('Searching locations with keyword:', keyword);
        const token = await getAmadeusToken();
        
        const response = await axios.get(
          'https://test.api.amadeus.com/v1/reference-data/locations',
          {
            params: {
              keyword,
              subType: 'AIRPORT,CITY',
              'page[limit]': 5,
              view: 'FULL'
            },
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        return response.data.data;
      } catch (error) {
        console.error('Location search error:', error);
        return [];
      }
    }
  }
};

export default AmadeusService;