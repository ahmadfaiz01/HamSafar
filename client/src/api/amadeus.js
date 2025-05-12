import axios from 'axios';

// API credentials - should be stored in environment variables in production
const AMADEUS_API_KEY = 'PgcbkJSO7ETAATzavNfZyazYTnKo5AGG';
const AMADEUS_API_SECRET = '2Ya38grS3iyN8sZb';

// Token management
let apiToken = null;
let tokenExpiry = null;

// Get authentication token
export const getAmadeusToken = async () => {
  // Check if we already have a valid token
  if (apiToken && tokenExpiry && new Date() < tokenExpiry) {
    return apiToken;
  }
  
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
    
    // Store the token and calculate expiry time
    apiToken = response.data.access_token;
    
    // Set expiry time (usually 1800 seconds/30 mins)
    const expiresIn = response.data.expires_in || 1800;
    tokenExpiry = new Date(new Date().getTime() + expiresIn * 1000);
    
    return apiToken;
    
  } catch (err) {
    console.error('Amadeus API authentication error:', err);
    throw new Error('Failed to authenticate with Amadeus API');
  }
};

// Search for airports
export const searchAirports = async (keyword) => {
  console.log('Searching airports for:', keyword);
  
  // Don't search if keyword is too short
  if (!keyword || keyword.length < 2) {
    return [];
  }
  
  // For development, use mock data instead of real API
  const useMockData = true;
  
  if (!useMockData) {
    try {
      const token = await getAmadeusToken();
      
      const response = await axios.get(
        'https://test.api.amadeus.com/v1/reference-data/locations',
        {
          params: {
            keyword,
            subType: 'AIRPORT,CITY',
            'page[limit]': 5
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Airport search response:', response.data);
      return response.data.data || [];
    } catch (err) {
      console.error('Airport search error:', err);
      throw new Error('Failed to search airports');
    }
  } else {
    // Mock data for airport search during development
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    
    const mockAirports = [
      {
        iataCode: 'JFK',
        name: 'John F. Kennedy International Airport',
        address: {
          cityName: 'New York',
          countryName: 'United States'
        }
      },
      {
        iataCode: 'LHR',
        name: 'Heathrow Airport',
        address: {
          cityName: 'London',
          countryName: 'United Kingdom'
        }
      },
      {
        iataCode: 'CDG',
        name: 'Charles de Gaulle Airport',
        address: {
          cityName: 'Paris',
          countryName: 'France'
        }
      },
      {
        iataCode: 'DXB',
        name: 'Dubai International Airport',
        address: {
          cityName: 'Dubai',
          countryName: 'United Arab Emirates'
        }
      },
      {
        iataCode: 'ISL',
        name: 'Islamabad International Airport',
        address: {
          cityName: 'Islamabad',
          countryName: 'Pakistan'
        }
      },
      {
        iataCode: 'LHE',
        name: 'Allama Iqbal International Airport',
        address: {
          cityName: 'Lahore',
          countryName: 'Pakistan'
        }
      },
      {
        iataCode: 'KHI',
        name: 'Jinnah International Airport',
        address: {
          cityName: 'Karachi',
          countryName: 'Pakistan'
        }
      },
      {
        iataCode: 'DEL',
        name: 'Indira Gandhi International Airport',
        address: {
          cityName: 'Delhi',
          countryName: 'India'
        }
      },
      {
        iataCode: 'BOM',
        name: 'Chhatrapati Shivaji Maharaj International Airport',
        address: {
          cityName: 'Mumbai',
          countryName: 'India'
        }
      },
      {
        iataCode: 'SIN',
        name: 'Singapore Changi Airport',
        address: {
          cityName: 'Singapore',
          countryName: 'Singapore'
        }
      },
      {
        iataCode: 'LAX',
        name: 'Los Angeles International Airport',
        address: {
          cityName: 'Los Angeles',
          countryName: 'United States'
        }
      },
      {
        iataCode: 'HKG',
        name: 'Hong Kong International Airport',
        address: {
          cityName: 'Hong Kong',
          countryName: 'China'
        }
      }
    ];
    
    // Filter based on keyword
    return mockAirports.filter(airport => 
      airport.name.toLowerCase().includes(keyword.toLowerCase()) ||
      airport.iataCode.toLowerCase().includes(keyword.toLowerCase()) ||
      airport.address.cityName.toLowerCase().includes(keyword.toLowerCase()) ||
      airport.address.countryName.toLowerCase().includes(keyword.toLowerCase())
    ).slice(0, 5); // Return at most 5 results
  }
};

// Format date for API

// Generate mock flight data
const generateMockFlights = (searchParams) => {
  console.log('Generating mock flights with params:', searchParams);
  
  const isRoundTrip = !!searchParams.returnDate;
  const departDate = new Date(searchParams.departureDate);
  const returnDate = searchParams.returnDate ? new Date(searchParams.returnDate) : null;
  
  const airlines = [
    { code: 'PK', name: 'Pakistan International Airlines' },
    { code: 'EK', name: 'Emirates' },
    { code: 'QR', name: 'Qatar Airways' },
    { code: 'TK', name: 'Turkish Airlines' },
    { code: 'ET', name: 'Ethiopian Airlines' },
    { code: 'EY', name: 'Etihad Airways' }
  ];
  
  const createFlight = (id, originCode, destCode, depDate, isReturn = false) => {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const flightNumber = Math.floor(Math.random() * 1000) + 100;
    
    const depTime = new Date(depDate);
    depTime.setHours(Math.floor(Math.random() * 24));
    depTime.setMinutes(Math.floor(Math.random() * 12) * 5); // 5-minute intervals
    
    const flightDurationHours = Math.floor(Math.random() * 8) + 1; // 1-9 hours
    const flightDurationMinutes = Math.floor(Math.random() * 12) * 5; // 0-55 minutes in 5-minute intervals
    
    const arrTime = new Date(depTime);
    arrTime.setHours(arrTime.getHours() + flightDurationHours);
    arrTime.setMinutes(arrTime.getMinutes() + flightDurationMinutes);
    
    
    return {
      departure: {
        iataCode: originCode,
        terminal: String.fromCharCode(65 + Math.floor(Math.random() * 5)), // A-E
        at: depTime.toISOString()
      },
      arrival: {
        iataCode: destCode,
        terminal: String.fromCharCode(65 + Math.floor(Math.random() * 5)), // A-E
        at: arrTime.toISOString()
      },
      carrierCode: airline.code,
      number: flightNumber.toString(),
      aircraft: {
        code: `A${Math.floor(Math.random() * 4) + 1}${Math.floor(Math.random() * 10)}0` // A110-A490
      },
      duration: (flightDurationHours * 60) + flightDurationMinutes,
      id: `segment-${id}-${isReturn ? 'ret' : 'out'}`
    };
  };
  
  // Create 10 flights
  const mockFlights = [];
  for (let i = 1; i <= 10; i++) {
    const outboundSegments = [
      createFlight(i, searchParams.originLocationCode, searchParams.destinationLocationCode, departDate)
    ];
    
    // Add connection for some flights
    if (Math.random() > 0.6) {
      const firstSegment = outboundSegments[0];
      const connectionAirports = ['DXB', 'DOH', 'IST', 'FRA', 'AMS'];
      const connectionAirport = connectionAirports[Math.floor(Math.random() * connectionAirports.length)];
      
      // Update first segment to go to connection airport
      firstSegment.arrival.iataCode = connectionAirport;
      
      // Add second segment
      const connectionDepTime = new Date(firstSegment.arrival.at);
      connectionDepTime.setHours(connectionDepTime.getHours() + 1 + Math.floor(Math.random() * 3)); // 1-3 hour connection
      
      outboundSegments.push({
        departure: {
          iataCode: connectionAirport,
          terminal: String.fromCharCode(65 + Math.floor(Math.random() * 5)),
          at: connectionDepTime.toISOString()
        },
        arrival: {
          iataCode: searchParams.destinationLocationCode,
          terminal: String.fromCharCode(65 + Math.floor(Math.random() * 5)),
          at: (() => {
            const arrTime = new Date(connectionDepTime);
            arrTime.setHours(arrTime.getHours() + 1 + Math.floor(Math.random() * 5));
            return arrTime.toISOString();
          })()
        },
        carrierCode: firstSegment.carrierCode,
        number: (parseInt(firstSegment.number) + 10).toString(),
        aircraft: {
          code: `A${Math.floor(Math.random() * 4) + 1}${Math.floor(Math.random() * 10)}0`
        },
        duration: (1 + Math.floor(Math.random() * 5)) * 60,
        id: `segment-${i}-out-connection`
      });
    }
    
    const flight = {
      id: `flight-${i}`,
      itineraries: [
        {
          duration: outboundSegments.reduce((total, segment) => 
            total + segment.duration, 0),
          segments: outboundSegments
        }
      ],
      price: {
        currency: 'USD', 
        total: String(200 + Math.floor(Math.random() * 800)),
        base: String(180 + Math.floor(Math.random() * 700))
      },
      travelerPricings: []
    };
    
    // Add return flight for round trips
    if (isRoundTrip && returnDate) {
      const returnSegments = [
        createFlight(i, searchParams.destinationLocationCode, searchParams.originLocationCode, returnDate, true)
      ];
      
      // Add connection for some return flights
      if (Math.random() > 0.6) {
        const firstSegment = returnSegments[0];
        const connectionAirports = ['DXB', 'DOH', 'IST', 'FRA', 'AMS'];
        const connectionAirport = connectionAirports[Math.floor(Math.random() * connectionAirports.length)];
        
        // Update first segment to go to connection airport
        firstSegment.arrival.iataCode = connectionAirport;
        
        // Add second segment
        const connectionDepTime = new Date(firstSegment.arrival.at);
        connectionDepTime.setHours(connectionDepTime.getHours() + 1 + Math.floor(Math.random() * 3)); // 1-3 hour connection
        
        returnSegments.push({
          departure: {
            iataCode: connectionAirport,
            terminal: String.fromCharCode(65 + Math.floor(Math.random() * 5)),
            at: connectionDepTime.toISOString()
          },
          arrival: {
            iataCode: searchParams.originLocationCode,
            terminal: String.fromCharCode(65 + Math.floor(Math.random() * 5)),
            at: (() => {
              const arrTime = new Date(connectionDepTime);
              arrTime.setHours(arrTime.getHours() + 1 + Math.floor(Math.random() * 5));
              return arrTime.toISOString();
            })()
          },
          carrierCode: firstSegment.carrierCode,
          number: (parseInt(firstSegment.number) + 10).toString(),
          aircraft: {
            code: `A${Math.floor(Math.random() * 4) + 1}${Math.floor(Math.random() * 10)}0`
          },
          duration: (1 + Math.floor(Math.random() * 5)) * 60,
          id: `segment-${i}-ret-connection`
        });
      }
      
      flight.itineraries.push({
        duration: returnSegments.reduce((total, segment) => 
          total + segment.duration, 0),
        segments: returnSegments
      });
    }
    
    // Calculate total price based on all segments and passengers
    const totalPrice = parseInt(flight.price.total);
    const basePrice = parseInt(flight.price.base);
    
    // Adjust for number of passengers
    const totalPassengers = (searchParams.adults || 1) + (searchParams.children || 0) + (searchParams.infants || 0);
    flight.price.total = String(Math.round(totalPrice * totalPassengers));
    flight.price.base = String(Math.round(basePrice * totalPassengers));
    
    // Add traveler pricings
    for (let j = 0; j < (searchParams.adults || 1); j++) {
      flight.travelerPricings.push({
        travelerId: `traveler-${j+1}`,
        fareOption: 'STANDARD',
        travelerType: 'ADULT',
        price: {
          currency: 'USD',
          total: String(totalPrice),
          base: String(basePrice)
        },
        fareDetailsBySegment: flight.itineraries.flatMap((itinerary) =>
          itinerary.segments.map((segment) => ({
            segmentId: segment.id,
            cabin: searchParams.travelClass || 'ECONOMY',
            fareBasis: `${segment.carrierCode}${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            class: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
            includedCheckedBags: {
              quantity: Math.floor(Math.random() * 2) + 1
            }
          }))
        )
      });
    }
    
    // Add child pricings if any
    for (let j = 0; j < (searchParams.children || 0); j++) {
      flight.travelerPricings.push({
        travelerId: `traveler-${(searchParams.adults || 1) + j + 1}`,
        fareOption: 'STANDARD',
        travelerType: 'CHILD',
        price: {
          currency: 'USD',
          total: String(Math.round(totalPrice * 0.75)), // 75% of adult price
          base: String(Math.round(basePrice * 0.75))
        },
        fareDetailsBySegment: flight.itineraries.flatMap((itinerary) =>
          itinerary.segments.map((segment) => ({
            segmentId: segment.id,
            cabin: searchParams.travelClass || 'ECONOMY',
            fareBasis: `${segment.carrierCode}${Math.random().toString(36).substring(2, 6).toUpperCase()}CH`,
            class: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
            includedCheckedBags: {
              quantity: Math.floor(Math.random() * 2) + 1
            }
          }))
        )
      });
    }
    
    // Add infant pricings if any  
    for (let j = 0; j < (searchParams.infants || 0); j++) {
      flight.travelerPricings.push({
        travelerId: `traveler-${(searchParams.adults || 1) + (searchParams.children || 0) + j + 1}`,
        fareOption: 'STANDARD',
        travelerType: 'INFANT',
        price: {
          currency: 'USD',
          total: String(Math.round(totalPrice * 0.1)), // 10% of adult price
          base: String(Math.round(basePrice * 0.1))
        },
        fareDetailsBySegment: flight.itineraries.flatMap((itinerary) =>
          itinerary.segments.map((segment) => ({
            segmentId: segment.id,
            cabin: searchParams.travelClass || 'ECONOMY',
            fareBasis: `${segment.carrierCode}${Math.random().toString(36).substring(2, 6).toUpperCase()}IN`,
            class: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
            includedCheckedBags: {
              quantity: 0
            }
          }))
        )
      });
    }
    
    mockFlights.push(flight);
  }
  
  return mockFlights;
};

// Search for flights (always use fallback for now)
export const searchFlights = async (searchParams) => {
  console.log('Searching flights with params:', searchParams);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return generateMockFlights(searchParams);
};

export default {
  searchAirports,
  searchFlights
};