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
  const [, setError] = useState(null);
  
  // Filters state
  const [filters, setFilters] = useState({
    priceRange: [0, 30000],
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
      handleSearch();
    }
  }, [searchParams]);
  
  // Handle search submission
  async function handleSearch(e) {
    if (e) e.preventDefault();

    if (!destination) {
      alert('Please enter a destination');
      return;
    }

    // Update URL with search parameters
    const params = new URLSearchParams();
    params.set('destination', destination);
    params.set('checkIn', checkIn.toISOString().split('T')[0]);
    params.set('checkOut', checkOut.toISOString().split('T')[0]);
    params.set('rooms', rooms);
    params.set('adults', adults);
    params.set('children', children);

    navigate(`/hotels?${params.toString()}`);

    // Search hotels
    setLoading(true);
    setError(null);

    try {
      const searchParams = {
        destination,
        checkIn: checkIn.toISOString().split('T')[0],
        checkOut: checkOut.toISOString().split('T')[0],
        rooms,
        adults,
        children,
        minPrice: filters.priceRange[0],
        maxPrice: filters.priceRange[1],
        rating: filters.rating > 0 ? filters.rating : undefined,
        amenities: filters.amenities.length > 0 ? filters.amenities.join(',') : undefined
      };

      const result = await searchHotels(searchParams);
      setHotels(result.data);
    } catch (error) {
      console.error('Error searching hotels:', error);
      setError('Failed to search hotels. Please try again later.');
    } finally {
      setLoading(false);
    }
  }
  
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
  const getFilteredHotels = () => {
    if (!hotels.length) return [];
    
    let filtered = [...hotels];
    
    // Apply price filter
    filtered = filtered.filter(hotel => 
      hotel.price >= filters.priceRange[0] && hotel.price <= filters.priceRange[1]
    );
    
    // Apply rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(hotel => hotel.rating >= filters.rating);
    }
    
    // Apply amenities filter
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(hotel => 
        filters.amenities.every(amenity => hotel.amenities.includes(amenity))
      );
    }
    
    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'recommended':
      default:
        filtered.sort((a, b) => (b.userRating * 0.7 + (30000 - b.price) * 0.00003) - 
                             (a.userRating * 0.7 + (30000 - a.price) * 0.00003));
        break;
    }
    
    return filtered;
  };
  
  const filteredHotels = getFilteredHotels();

  // Handle destination selection from popular destinations
  const selectDestination = (destinationName) => {
    setDestination(destinationName);
    setTimeout(() => handleSearch(), 0);
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
                            hotel={hotel}
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