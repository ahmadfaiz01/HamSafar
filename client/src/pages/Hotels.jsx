import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import HotelSearchForm from '../components/hotel/HotelSearchForm';
import HotelCard from '../components/hotel/HotelCard';
import PopularDestinations from '../components/hotel/PopularDestinations';
import { searchHotels, getCities } from '../services/hotelService';
import './Hotels.css';

const Hotels = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [error, setError] = useState(null);
  const [cities, setCities] = useState([]);
  
  // Handle search function with useCallback to avoid dependency issues
  const handleSearch = useCallback(async (searchData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Searching hotels with:', searchData);
      
      // If searchData is an event (form submission), prevent default and extract data
      if (searchData && searchData.preventDefault) {
        searchData.preventDefault();
        searchData = {
          destination,
          checkIn,
          checkOut,
          rooms,
          adults,
          children
        };
      }
      
      // Update URL with search parameters
      const params = new URLSearchParams();
      if (searchData.destination) params.set('destination', searchData.destination);
      if (searchData.checkIn) params.set('checkIn', searchData.checkIn instanceof Date ? 
        searchData.checkIn.toISOString().split('T')[0] : searchData.checkIn);
      if (searchData.checkOut) params.set('checkOut', searchData.checkOut instanceof Date ? 
        searchData.checkOut.toISOString().split('T')[0] : searchData.checkOut);
      if (searchData.rooms) params.set('rooms', searchData.rooms);
      if (searchData.adults) params.set('adults', searchData.adults);
      if (searchData.children) params.set('children', searchData.children);
      
      navigate(`/hotels?${params.toString()}`);
      
      // Perform search
      const results = await searchHotels(searchData);
      console.log('Search results:', results);
      
      // Update state with results
      setHotels(results);
      setSearchPerformed(true);
    } catch (err) {
      console.error('Error during hotel search:', err);
      setError('An unexpected error occurred while searching for hotels');
      setHotels([]);
    } finally {
      setLoading(false);
    }
  }, [navigate, destination, checkIn, checkOut, rooms, adults, children]);
  
  // Initialize search form from URL parameters
  useEffect(() => {
    const dest = searchParams.get('destination');
    const checkInDate = searchParams.get('checkIn');
    const checkOutDate = searchParams.get('checkOut');
    const roomsParam = searchParams.get('rooms');
    const adultsParam = searchParams.get('adults');
    const childrenParam = searchParams.get('children');
    
    if (dest) {
      console.log("Initializing from URL with destination:", dest);
      setDestination(dest);
    }
    
    if (checkInDate) setCheckIn(new Date(checkInDate));
    if (checkOutDate) setCheckOut(new Date(checkOutDate));
    if (roomsParam) setRooms(parseInt(roomsParam, 10));
    if (adultsParam) setAdults(parseInt(adultsParam, 10));
    if (childrenParam) setChildren(parseInt(childrenParam, 10));
    
    // If we have destination, perform search
    if (dest) {
      handleSearch({
        destination: dest,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        rooms: roomsParam || 1,
        adults: adultsParam || 2,
        children: childrenParam || 0
      });
    }
  }, [searchParams, handleSearch]);
  
  // Load available cities from MongoDB
  useEffect(() => {
    const loadCities = async () => {
      try {
        setCitiesLoading(true);
        const citiesData = await getCities();
        console.log('Cities loaded from MongoDB:', citiesData);
        
        // Make sure we have valid data
        if (Array.isArray(citiesData) && citiesData.length > 0) {
          setCities(citiesData);
        } else {
          console.warn('No cities returned from API, using fallback data');
          setCities([
            { name: 'Islamabad', properties: 3 },
            { name: 'Lahore', properties: 3 },
            { name: 'Karachi', properties: 3 },
            { name: 'Murree', properties: 1 },
            { name: 'Swat', properties: 1 },
            { name: 'Naran', properties: 1 },
            { name: 'Hunza', properties: 1 },
            { name: 'Skardu', properties: 1 },
            { name: 'Peshawar', properties: 1 },
            { name: 'Multan', properties: 1 }
          ]);
        }
      } catch (err) {
        console.error('Error loading cities:', err);
        // Use fallback data on error
        setCities([
          { name: 'Islamabad', properties: 3 },
          { name: 'Lahore', properties: 3 },
          { name: 'Karachi', properties: 3 },
          { name: 'Murree', properties: 1 },
          { name: 'Swat', properties: 1 },
          { name: 'Naran', properties: 1 },
          { name: 'Hunza', properties: 1 },
          { name: 'Skardu', properties: 1 },
          { name: 'Peshawar', properties: 1 },
          { name: 'Multan', properties: 1 }
        ]);
      } finally {
        setCitiesLoading(false);
      }
    };
    
    loadCities();
  }, []);
  
  // Calculate number of nights
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  };

  // Handle destination selection from PopularDestinations
  const handleDestinationSelect = (cityName) => {
    setDestination(cityName);
    handleSearch({
      destination: cityName,
      checkIn,
      checkOut,
      rooms,
      adults,
      children
    });
  };

  return (
    <div className="hotels-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Find Perfect Hotels in Pakistan</h1>
          <p>Discover the best accommodation options across Pakistan</p>
        </div>
      </div>
      
      {/* Search Form */}
      <div className="container">
        <div className="hotel-search-form-container">
          <HotelSearchForm
            destination={destination}
            setDestination={setDestination}
            checkIn={checkIn}
            setCheckIn={setCheckIn}
            checkOut={checkOut}
            setCheckOut={setCheckOut}
            rooms={rooms}
            setRooms={setRooms}
            adults={adults}
            setAdults={setAdults}
            children={children}
            setChildren={setChildren}
            locations={cities}
            loading={loading}
            handleSearch={handleSearch}
          />
        </div>
        
        {/* Error Messages */}
        {error && (
          <div className="alert alert-danger mt-4" role="alert">
            {error}
          </div>
        )}
        
        {/* Search Results or Popular Hotels */}
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Searching for hotels...</p>
          </div>
        ) : searchPerformed ? (
          hotels.length > 0 ? (
            <div className="search-results">
              <h2>{hotels.length} hotels found {destination ? `in ${destination}` : ''}</h2>
              <div className="hotels-list">
                {hotels.map(hotel => (
                  <HotelCard 
                    key={hotel._id}
                    hotel={hotel} // Make sure the full hotel object is passed
                    checkIn={checkIn}
                    checkOut={checkOut}
                    nights={calculateNights()}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="no-results">
              <i className="fas fa-search"></i>
              <h3>No hotels found</h3>
              <p>We couldn't find any hotels matching your search criteria. Try changing your search or explore popular destinations below.</p>
              
              {/* Show Popular Destinations after failed search */}
              <div className="mt-5">
                <PopularDestinations 
                  destinations={cities} 
                  loading={citiesLoading}
                  onSelectDestination={handleDestinationSelect}
                />
              </div>
            </div>
          )
        ) : (
          /* Show Popular Destinations when no search has been performed */
          <PopularDestinations 
            destinations={cities} 
            loading={citiesLoading}
            onSelectDestination={handleDestinationSelect}
          />
        )}
      </div>
    </div>
  );
};

export default Hotels;
