/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/hotelBooking.css';

// Import hotel service
import { 
  getCities, 
  getPopularDestinations, 
  searchHotels 
} from '../services/hotelService';

// Import components
import HotelSearchForm from '../components/hotel/HotelSearchForm';
import HotelFilter from '../components/hotel/HotelFilter';
import HotelCard from '../components/hotel/HotelCard';
import PopularDestinations from '../components/hotel/PopularDestinations';
import Loading from '../components/common/Loading';

const HotelBooking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // State for search parameters
  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') ? new Date(searchParams.get('checkIn')) : new Date());
  const [checkOut, setCheckOut] = useState(
    searchParams.get('checkOut') ? new Date(searchParams.get('checkOut')) : 
    (() => {
      const nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 1);
      return nextDay;
    })()
  );
  const [rooms, setRooms] = useState(parseInt(searchParams.get('rooms')) || 1);
  const [adults, setAdults] = useState(parseInt(searchParams.get('adults')) || 2);
  const [children, setChildren] = useState(parseInt(searchParams.get('children')) || 0);
  
  // State for search results and metadata
  const [hotels, setHotels] = useState([]);
  const [locations, setLocations] = useState([]);
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [searchPerformed, setSearchPerformed] = useState(false); // Add this line
  const [error, setError] = useState(null);
  
  // Filters state
  const [filters, setFilters] = useState({
    priceRange: [0, 50000], // Increase the max price to 50,000 to include more hotels
    rating: 0,
    amenities: [],
    sortBy: 'recommended'
  });

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Calculate nights between dates
  const calculateNights = () => {
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Load cities and popular destinations
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        setLoadingMetadata(true);
        
        // Fetch cities and popular destinations in parallel
        const [citiesData, destinationsData] = await Promise.all([
          getCities(),
          getPopularDestinations()
        ]);
        
        setLocations(citiesData);
        setPopularDestinations(destinationsData);
      } catch (error) {
        console.error('Error loading metadata:', error);
        setError('Failed to load necessary data. Please refresh the page.');
      } finally {
        setLoadingMetadata(false);
      }
    };
    
    loadMetadata();
  }, []);
  
  // Perform search if URL has destination parameter
  useEffect(() => {
    if (searchParams.get('destination')) {
      // Call handleSearch with constructed params object
      handleSearch({
        destination: searchParams.get('destination'),
        checkIn: searchParams.get('checkIn') ? new Date(searchParams.get('checkIn')) : checkIn,
        checkOut: searchParams.get('checkOut') ? new Date(searchParams.get('checkOut')) : checkOut,
        rooms: parseInt(searchParams.get('rooms')) || rooms,
        adults: parseInt(searchParams.get('adults')) || adults,
        children: parseInt(searchParams.get('children')) || children
      });
    }
  }, [searchParams]); // Keep the dependencies
  
  // Handle search submission
  const handleSearch = async (searchData) => {
    try {
      setLoading(true);
      setError(null);
      
      // If searchData is not provided, use the current state values
      if (!searchData) {
        searchData = {
          destination,
          checkIn,
          checkOut,
          rooms,
          adults,
          children
        };
      }
      
      console.log('Searching hotels with:', searchData);
      
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
    
      // Update the URL
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
  }
  
  // Handle filter submission
  const handleFilterSubmit = (event) => {
    event.preventDefault();
    
    // Extract filter values from the form
    const formData = new FormData(event.target);
    const priceRange = formData.get('priceRange').split(',').map(Number);
    const rating = Number(formData.get('rating'));
    const amenities = formData.getAll('amenities');
    const sortBy = formData.get('sortBy');
    
    // Update filters state
    setFilters({
      priceRange,
      rating,
      amenities,
      sortBy
    });
  };
  
  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };
  
  // Toggle amenity selection
  const toggleAmenity = (amenity) => {
    setFilters(prev => {
      const amenities = [...prev.amenities];
      const index = amenities.indexOf(amenity);
      
      if (index === -1) {
        amenities.push(amenity);
      } else {
        amenities.splice(index, 1);
      }
      
      return {
        ...prev,
        amenities
      };
    });
  };
  
  // Apply filters and sorting to hotel results
  // Fix the getFilteredHotels function to use the correct property names
  const getFilteredHotels = () => {
    if (!hotels || !hotels.length) return [];
    
    console.log('Filtering hotels:', hotels); // Add this to debug
    
    let filtered = [...hotels];
    
    // Apply price filter - FIXED: use pricePerNight instead of price
    filtered = filtered.filter(hotel => 
      hotel.pricePerNight >= filters.priceRange[0] && hotel.pricePerNight <= filters.priceRange[1]
    );
    
    // Apply rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(hotel => hotel.rating >= filters.rating);
    }
    
    // Apply amenities filter - make sure hotel.amenities exists
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(hotel => 
        hotel.amenities && filters.amenities.every(amenity => hotel.amenities.includes(amenity))
      );
    }
    
    // Apply sorting - FIXED: use pricePerNight instead of price
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.pricePerNight - b.pricePerNight);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.pricePerNight - a.pricePerNight);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'recommended':
      default:
        // FIXED: handle missing userRating and use pricePerNight
        filtered.sort((a, b) => {
          const aUserRating = a.rating || 0;
          const bUserRating = b.rating || 0;
          const aPrice = a.pricePerNight || 0;
          const bPrice = b.pricePerNight || 0;
          
          return (bUserRating * 0.7 + (30000 - bPrice) * 0.00003) - 
                 (aUserRating * 0.7 + (30000 - aPrice) * 0.00003);
        });
        break;
    }
    
    console.log('Filtered hotels:', filtered); // Add this to debug
    return filtered;
  };
  
  const filteredHotels = getFilteredHotels();

  // Handle destination selection from popular destinations
  const selectDestination = (destinationName) => {
    setDestination(destinationName);
    // Use setTimeout and call handleSearch with proper parameters
    setTimeout(() => {
      handleSearch({
        destination: destinationName,
        checkIn,
        checkOut,
        rooms,
        adults,
        children
      });
    }, 0);
  };
  
  return (
    <div className="hotel-booking-page">
      {/* Hero section with search form */}
      <div className="hotel-search-container">
        <div className="container">
          <h1 className="hotel-search-title">Find Perfect Hotels in Pakistan</h1>
          <p className="hotel-search-subtitle">Discover the best accommodation options across Pakistan</p>
          
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
            locations={locations}
            loading={loadingMetadata}
            handleSearch={handleSearch}
          />
        </div>
      </div>
      
      {/* Hotel search results */}
      {searchParams.get('destination') && (
        <div className="hotel-results-container">
          <div className="container">
            <div className="row">
              {/* Filters sidebar */}
              <div className="col-lg-3">
                <HotelFilter 
                  filters={filters}
                  handleFilterChange={handleFilterChange}
                  toggleAmenity={toggleAmenity}
                />
              </div>
              
              {/* Results list */}
              <div className="col-lg-9">
                <div className="hotel-results-header">
                  <h2>
                    {loading ? 'Searching...' : 
                      filteredHotels.length > 0 ? 
                        `${filteredHotels.length} properties found in ${destination}` : 
                        'No properties found'
                    }
                  </h2>
                  
                  <div className="sort-options">
                    <label htmlFor="sort-select">Sort by:</label>
                    <select
                      id="sort-select"
                      className="form-select"
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    >
                      <option value="recommended">Recommended</option>
                      <option value="price-low">Price (low to high)</option>
                      <option value="price-high">Price (high to low)</option>
                      <option value="rating">Top rated</option>
                    </select>
                  </div>
                </div>
                
                {loading ? (
                  <Loading message={`Searching for the best hotels in ${destination}...`} />
                ) : (
                  <>
                    {filteredHotels.length > 0 ? (
                      <div className="hotel-results-list">
                        {filteredHotels.map((hotel) => (
                          <HotelCard
                            key={hotel._id}
                            hotel={{
                              ...hotel,
                              // Ensure the hotel object has all properties needed by HotelCard
                              price: hotel.pricePerNight, // Map pricePerNight to price if your HotelCard uses price
                              imageUrl: hotel.images && hotel.images.length > 0 ? hotel.images[0] : '',
                              // Add any other mappings needed
                            }}
                            checkIn={checkIn}
                            checkOut={checkOut}
                            nights={calculateNights()}
                            formatDate={formatDate}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="no-results">
                        <i className="fas fa-search fa-3x text-muted"></i>
                        <h3>No hotels found in {destination}</h3>
                        <p>Try adjusting your search criteria or choosing a different city in Pakistan</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Popular destinations section (only shown on homepage) */}
      {!searchParams.get('destination') && !loading && (
        <PopularDestinations 
          destinations={popularDestinations} 
          loading={loadingMetadata}
          onSelectDestination={selectDestination}
        />
      )}
    </div>
  );
};

export default HotelBooking;