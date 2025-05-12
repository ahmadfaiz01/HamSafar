import React, { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FlightSearch from '../components/FlightSearch';
import FlightResults from '../components/FlightResults';
import { searchFlights } from '../api/amadeus';
import '../styles/flightPage.css';

const FlightPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = useCallback(async (searchData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Search data received:', searchData);
      
      // Convert form data to URL params
      const params = new URLSearchParams();
      Object.entries(searchData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === 'departureDate' || key === 'returnDate') {
            // Format dates as YYYY-MM-DD
            if (value) {
              params.append(key, value.toISOString().split('T')[0]);
            }
          } else {
            params.append(key, value);
          }
        }
      });
      
      // Update URL with search parameters
      navigate(`/flights/search?${params.toString()}`);
      
      // Call API to search flights
      const results = await searchFlights(searchData);
      console.log('Flight search results:', results);
      
      if (!results || results.length === 0) {
        setError('No flights found for your search criteria. Please try different dates or airports.');
      } else {
        setFlights(results);
      }
      
      setSearchPerformed(true);
    } catch (err) {
      console.error('Flight search error:', err);
      setError(err.message || 'An error occurred while searching for flights. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Check if we need to perform a search based on URL parameters
  React.useEffect(() => {
    const autoSearch = async () => {
      // Only auto-search if we have the minimum required parameters and no search performed yet
      if (
        searchParams.get('originLocationCode') && 
        searchParams.get('destinationLocationCode') && 
        searchParams.get('departureDate') &&
        !searchPerformed &&
        !loading
      ) {
        const searchData = {
          originLocationCode: searchParams.get('originLocationCode'),
          destinationLocationCode: searchParams.get('destinationLocationCode'),
          departureDate: new Date(searchParams.get('departureDate')),
          returnDate: searchParams.get('returnDate') ? new Date(searchParams.get('returnDate')) : null,
          adults: parseInt(searchParams.get('adults') || '1'),
          children: parseInt(searchParams.get('children') || '0'),
          infants: parseInt(searchParams.get('infants') || '0'),
          travelClass: searchParams.get('travelClass') || 'ECONOMY',
          nonStop: searchParams.get('nonStop') === 'true'
        };
        
        handleSearch(searchData);
      }
    };
    
    autoSearch();
  }, [searchParams, handleSearch, loading, searchPerformed]);

  return (
    <div className="flight-page">
      <div className="flight-bg"></div>
      
      <div className="container">
        <div className="flight-search-section">
          <h1 className="flight-page-title">Find Your Perfect Flight</h1>
          <p className="flight-page-subtitle">Search thousands of routes for the best prices</p>
          
          <FlightSearch onSearch={handleSearch} loading={loading} />
        </div>
        
        {(searchPerformed || loading || error) && (
          <div className="flight-results-section">
            <FlightResults 
              flights={flights} 
              loading={loading} 
              error={error}
            />
          </div>
        )}
        
        {!searchPerformed && !loading && !error && (
          <div className="flight-promo-section">
            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="promo-card">
                  <div className="promo-content">
                    <h3>Special Offers</h3>
                    <p>Find amazing deals on our most popular destinations</p>
                    <button className="btn btn-accent">View Deals</button>
                  </div>
                  <div className="promo-image" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1499063078284-f78f7d89616a?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YWlycG9ydHxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60)' }}></div>
                </div>
              </div>
              
              <div className="col-md-6 mb-4">
                <div className="promo-card">
                  <div className="promo-content">
                    <h3>Exclusive Rewards</h3>
                    <p>Join our loyalty program for extra benefits</p>
                    <button className="btn btn-accent">Learn More</button>
                  </div>
                  <div className="promo-image" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1541873676-a18131494184?ixid=MnwxMjA3fDB8MHxzZWFyY2h8NDB8fHRyYXZlbHxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60)' }}></div>
                </div>
              </div>
            </div>
            
            <div className="popular-destinations">
              <h2>Popular Flight Destinations</h2>
              <div className="row">
                {popularDestinations.map((destination, index) => (
                  <div key={index} className="col-lg-3 col-md-6 mb-4">
                    <div className="destination-card" 
                      onClick={() => {
                        const searchData = {
                          originLocationCode: 'LHR', // Default origin, replace with user's location in a real app
                          destinationLocationCode: destination.code,
                          departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
                          adults: 1
                        };
                        handleSearch(searchData);
                      }}>
                      <div className="destination-image" style={{ backgroundImage: `url(${destination.image})` }}>
                        <div className="destination-overlay">
                          <h3>{destination.city}</h3>
                          <p>from ${destination.price}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Sample popular destinations
const popularDestinations = [
  {
    city: 'New York',
    code: 'NYC',
    price: 299,
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8bmV3JTIweW9ya3xlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    city: 'Paris',
    code: 'PAR',
    price: 349,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cGFyaXN8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    city: 'Tokyo',
    code: 'TYO',
    price: 499,
    image: 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8dG9reW98ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    city: 'Dubai',
    code: 'DXB',
    price: 399,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8ZHViYWl8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  }
];

export default FlightPage;