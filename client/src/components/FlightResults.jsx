import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../styles/flightResults.css';

// Helper for time formatting
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  });
};

// Helper for date formatting
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    weekday: 'short' 
  });
};

// Helper to format duration from minutes
const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const FlightResults = ({ flights, loading, error }) => {
  const [searchParams] = useSearchParams();
  
  const [selectedFlightIndex, setSelectedFlightIndex] = useState(null);
  const [filters, setFilters] = useState({
    stops: 'all',
    airlines: [],
    priceRange: [0, 5000],
    departureTime: 'all',
    arrivalTime: 'all',
    duration: 'all'
  });
  
  const [sortOption, setSortOption] = useState('price');
  const [availableAirlines, setAvailableAirlines] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [expandedFilters, setExpandedFilters] = useState(false);
  
  // The formatted search parameters to display
  const searchSummary = {
    origin: searchParams.get('originLocationCode') || '',
    destination: searchParams.get('destinationLocationCode') || '',
    departDate: searchParams.get('departureDate') ? new Date(searchParams.get('departureDate')) : null,
    returnDate: searchParams.get('returnDate') ? new Date(searchParams.get('returnDate')) : null,
    passengers: (parseInt(searchParams.get('adults') || '1')) + 
               (parseInt(searchParams.get('children') || '0')) + 
               (parseInt(searchParams.get('infants') || '0')),
    cabinClass: searchParams.get('travelClass') || 'ECONOMY'
  };
  
  // Get all unique airlines from flights
  useEffect(() => {
    if (flights && flights.length > 0) {
      const airlines = new Set();
      let minPrice = Number.MAX_SAFE_INTEGER;
      let maxPrice = 0;
      
      flights.forEach(flight => {
        // Extract airlines
        flight.itineraries.forEach(itinerary => {
          itinerary.segments.forEach(segment => {
            airlines.add(segment.carrierCode);
          });
        });
        
        // Extract price range
        const flightPrice = parseFloat(flight.price.total);
        if (flightPrice < minPrice) minPrice = flightPrice;
        if (flightPrice > maxPrice) maxPrice = flightPrice;
      });
      
      setAvailableAirlines(Array.from(airlines));
      setPriceRange([Math.floor(minPrice), Math.ceil(maxPrice)]);
      setFilters(prev => ({
        ...prev,
        priceRange: [Math.floor(minPrice), Math.ceil(maxPrice)]
      }));
    }
  }, [flights]);
  
  // Filter flights based on selected criteria
  const filteredFlights = React.useMemo(() => {
    if (!flights || !flights.length) return [];
    
    return flights.filter(flight => {
      // Price filter
      const flightPrice = parseFloat(flight.price.total);
      if (flightPrice < filters.priceRange[0] || flightPrice > filters.priceRange[1]) {
        return false;
      }
      
      // Airline filter
      if (filters.airlines.length > 0) {
        let hasMatchingAirline = false;
        flight.itineraries.forEach(itinerary => {
          itinerary.segments.forEach(segment => {
            if (filters.airlines.includes(segment.carrierCode)) {
              hasMatchingAirline = true;
            }
          });
        });
        if (!hasMatchingAirline) return false;
      }
      
      // Stops filter
      if (filters.stops !== 'all') {
        const numStops = parseInt(filters.stops);
        const outboundStops = flight.itineraries[0].segments.length - 1;
        
        if (outboundStops !== numStops) {
          return false;
        }
        
        // For round trip, check return stops if needed
        if (flight.itineraries.length > 1) {
          const returnStops = flight.itineraries[1].segments.length - 1;
          if (returnStops !== numStops) {
            return false;
          }
        }
      }
      
      return true;
    });
  }, [flights, filters]);
  
  // Sort filtered flights
  const sortedFlights = React.useMemo(() => {
    if (!filteredFlights.length) return [];
    
    return [...filteredFlights].sort((a, b) => {
      switch (sortOption) {
        case 'price':
          return parseFloat(a.price.total) - parseFloat(b.price.total);
        case 'duration':
          { const aDuration = a.itineraries.reduce((total, itinerary) => 
            total + parseInt(itinerary.duration || 0), 0);
          const bDuration = b.itineraries.reduce((total, itinerary) => 
            total + parseInt(itinerary.duration || 0), 0);
          return aDuration - bDuration; }
        case 'departure':
          { const aDeparture = new Date(a.itineraries[0].segments[0].departure.at);
          const bDeparture = new Date(b.itineraries[0].segments[0].departure.at);
          return aDeparture - bDeparture; }
        case 'arrival':
          { const lastSegmentA = a.itineraries[0].segments[a.itineraries[0].segments.length - 1];
          const lastSegmentB = b.itineraries[0].segments[b.itineraries[0].segments.length - 1];
          const aArrival = new Date(lastSegmentA.arrival.at);
          const bArrival = new Date(lastSegmentB.arrival.at);
          return aArrival - bArrival; }
        default:
          return parseFloat(a.price.total) - parseFloat(b.price.total);
      }
    });
  }, [filteredFlights, sortOption]);
  
  // Handle changing a filter
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };
  
  // Handle toggling an airline in the filter
  const toggleAirline = (airline) => {
    setFilters(prev => {
      const currentAirlines = [...prev.airlines];
      const index = currentAirlines.indexOf(airline);
      
      if (index === -1) {
        currentAirlines.push(airline);
      } else {
        currentAirlines.splice(index, 1);
      }
      
      return {
        ...prev,
        airlines: currentAirlines
      };
    });
  };
  
  // Airline name mapping (normally would come from API)
  const airlineNames = {
    'AA': 'American Airlines',
    'DL': 'Delta Air Lines',
    'UA': 'United Airlines',
    'BA': 'British Airways',
    'LH': 'Lufthansa',
    'EK': 'Emirates',
    'AF': 'Air France',
    'KL': 'KLM',
    'QR': 'Qatar Airways',
    'SQ': 'Singapore Airlines'
  };
  
  // Get airline display name
  const getAirlineName = (code) => {
    return airlineNames[code] || code;
  };
  
  // Format cabin class for display
  const formatCabinClass = (cabinClass) => {
    switch (cabinClass) {
      case 'ECONOMY':
        return 'Economy';
      case 'PREMIUM_ECONOMY':
        return 'Premium Economy';
      case 'BUSINESS':
        return 'Business';
      case 'FIRST':
        return 'First Class';
      default:
        return cabinClass;
    }
  };
  
  // Helper to calculate total duration of an itinerary
  const calculateTotalDuration = (itinerary) => {
    if (!itinerary || !itinerary.duration) {
      // Sum up segment durations if overall duration not available
      return itinerary?.segments.reduce((total, segment) => total + (segment.duration || 0), 0) || 0;
    }
    return itinerary.duration;
  };
  
  // Get stops description
  const getStopsLabel = (segments) => {
    const stops = segments.length - 1;
    if (stops === 0) return 'Direct';
    if (stops === 1) return '1 stop';
    return `${stops} stops`;
  };
  
  return (
    <div className="flight-results-container">
      <div className="search-summary">
        <div className="route">
          <span>{searchSummary.origin} → {searchSummary.destination}</span>
          {searchSummary.returnDate && (
            <span> → {searchSummary.origin}</span>
          )}
        </div>
        <div className="details">
          <span>
            {searchSummary.departDate && formatDate(searchSummary.departDate)}
            {searchSummary.returnDate && ` - ${formatDate(searchSummary.returnDate)}`}
          </span>
          <span className="separator">•</span>
          <span>
            {searchSummary.passengers} {searchSummary.passengers === 1 ? 'passenger' : 'passengers'}
          </span>
          <span className="separator">•</span>
          <span>{formatCabinClass(searchSummary.cabinClass)}</span>
        </div>
      </div>

      <div className="row">
        <div className="col-md-3">
          <div className={`filters-container ${expandedFilters ? 'expanded' : ''}`}>
            <div className="filter-header">
              <h3>Filters</h3>
              <button 
                className="btn-toggle-filters" 
                onClick={() => setExpandedFilters(!expandedFilters)}
              >
                {expandedFilters ? 'Hide' : 'Show'} <i className={`fas fa-chevron-${expandedFilters ? 'up' : 'down'}`}></i>
              </button>
            </div>
            
            <div className="filter-content">
              <div className="filter-section">
                <h4>Price Range</h4>
                <input
                  type="range"
                  min={priceRange[0]}
                  max={priceRange[1]}
                  step={10}
                  value={filters.priceRange[1]}
                  onChange={(e) => handleFilterChange('priceRange', [priceRange[0], parseInt(e.target.value)])}
                  className="form-range"
                />
                <div className="price-range-display">
                  <span>${filters.priceRange[0]}</span>
                  <span>${filters.priceRange[1]}</span>
                </div>
              </div>
              
              <div className="filter-section">
                <h4>Stops</h4>
                <div className="form-check">
                  <input 
                    type="radio" 
                    id="stops-all" 
                    name="stops" 
                    value="all" 
                    checked={filters.stops === 'all'} 
                    onChange={() => handleFilterChange('stops', 'all')} 
                    className="form-check-input"
                  />
                  <label htmlFor="stops-all" className="form-check-label">All flights</label>
                </div>
                <div className="form-check">
                  <input 
                    type="radio" 
                    id="stops-0" 
                    name="stops" 
                    value="0" 
                    checked={filters.stops === '0'} 
                    onChange={() => handleFilterChange('stops', '0')} 
                    className="form-check-input"
                  />
                  <label htmlFor="stops-0" className="form-check-label">Direct only</label>
                </div>
                <div className="form-check">
                  <input 
                    type="radio" 
                    id="stops-1" 
                    name="stops" 
                    value="1" 
                    checked={filters.stops === '1'} 
                    onChange={() => handleFilterChange('stops', '1')} 
                    className="form-check-input"
                  />
                  <label htmlFor="stops-1" className="form-check-label">1 stop</label>
                </div>
              </div>
              
              {availableAirlines.length > 0 && (
                <div className="filter-section">
                  <h4>Airlines</h4>
                  {availableAirlines.map((airline) => (
                    <div key={airline} className="form-check">
                      <input
                        type="checkbox"
                        id={`airline-${airline}`}
                        checked={filters.airlines.includes(airline)}
                        onChange={() => toggleAirline(airline)}
                        className="form-check-input"
                      />
                      <label htmlFor={`airline-${airline}`} className="form-check-label">
                        {getAirlineName(airline)}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-9">
          <div className="results-header">
            <div className="flight-count">
              {sortedFlights.length} {sortedFlights.length === 1 ? 'flight' : 'flights'} found
            </div>
            
            <div className="sort-options">
              <label htmlFor="sort-select">Sort by:</label>
              <select 
                id="sort-select" 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
                className="form-select"
              >
                <option value="price">Price (Lowest first)</option>
                <option value="duration">Duration (Shortest first)</option>
                <option value="departure">Departure (Earliest first)</option>
                <option value="arrival">Arrival (Earliest first)</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Searching for flights...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <div className="alert alert-danger">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </div>
            </div>
          ) : sortedFlights.length > 0 ? (
            <div className="flight-list">
              {sortedFlights.map((flight, index) => (
                <div 
                  key={flight.id} 
                  className={`flight-card ${selectedFlightIndex === index ? 'selected' : ''}`}
                  onClick={() => setSelectedFlightIndex(selectedFlightIndex === index ? null : index)}
                >
                  <div className="flight-header">
                    <div className="flight-airline">
                      <span className="airline-logo">
                        {flight.itineraries[0].segments[0].carrierCode}
                      </span>
                      <span className="airline-name">
                        {getAirlineName(flight.itineraries[0].segments[0].carrierCode)}
                      </span>
                    </div>
                    <div className="flight-price">
                      <span className="price">${parseFloat(flight.price.total).toFixed(2)}</span>
                      <span className="price-per-passenger">
                        {searchSummary.passengers > 1 && `$${(parseFloat(flight.price.total) / searchSummary.passengers).toFixed(2)} per passenger`}
                      </span>
                    </div>
                  </div>
                  
                  {/* Outbound journey */}
                  <div className="flight-details">
                    <div className="flight-route">
                      <div className="time-info">
                        <div className="departure-time">
                          {formatTime(flight.itineraries[0].segments[0].departure.at)}
                        </div>
                        <div className="departure-airport">
                          {flight.itineraries[0].segments[0].departure.iataCode}
                        </div>
                      </div>
                      
                      <div className="flight-duration-container">
                        <div className="flight-duration">
                          {formatDuration(calculateTotalDuration(flight.itineraries[0]))}
                        </div>
                        <div className="flight-line">
                          <div className="flight-stops">
                            {getStopsLabel(flight.itineraries[0].segments)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="time-info">
                        <div className="arrival-time">
                          {formatTime(flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.at)}
                        </div>
                        <div className="arrival-airport">
                          {flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode}
                        </div>
                      </div>
                    </div>
                    
                    {/* If return journey exists */}
                    {flight.itineraries.length > 1 && (
                      <div className="flight-route return-route">
                        <div className="time-info">
                          <div className="departure-time">
                            {formatTime(flight.itineraries[1].segments[0].departure.at)}
                          </div>
                          <div className="departure-airport">
                            {flight.itineraries[1].segments[0].departure.iataCode}
                          </div>
                        </div>
                        
                        <div className="flight-duration-container">
                          <div className="flight-duration">
                            {formatDuration(calculateTotalDuration(flight.itineraries[1]))}
                          </div>
                          <div className="flight-line return">
                            <div className="flight-stops">
                              {getStopsLabel(flight.itineraries[1].segments)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="time-info">
                          <div className="arrival-time">
                            {formatTime(flight.itineraries[1].segments[flight.itineraries[1].segments.length - 1].arrival.at)}
                          </div>
                          <div className="arrival-airport">
                            {flight.itineraries[1].segments[flight.itineraries[1].segments.length - 1].arrival.iataCode}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Expanded details */}
                  {selectedFlightIndex === index && (
                    <div className="flight-expanded-details">
                      <div className="segment-details">
                        <h4>Outbound Flight Details</h4>
                        <div className="segments">
                          {flight.itineraries[0].segments.map((segment, segmentIndex) => (
                            <div key={`outbound-${segmentIndex}`} className="segment">
                              <div className="segment-header">
                                <div className="segment-airline">
                                  <span>{getAirlineName(segment.carrierCode)}</span>
                                  <span className="flight-number">Flight {segment.number}</span>
                                </div>
                                <div className="segment-aircraft">
                                  Aircraft: {segment.aircraft?.code || 'N/A'}
                                </div>
                              </div>
                              
                              <div className="segment-timeline">
                                <div className="timeline-point">
                                  <div className="timeline-time">{formatTime(segment.departure.at)}</div>
                                  <div className="timeline-date">{formatDate(segment.departure.at)}</div>
                                  <div className="timeline-airport">
                                    <strong>{segment.departure.iataCode}</strong>
                                    {segment.departure.terminal && ` Terminal ${segment.departure.terminal}`}
                                  </div>
                                </div>
                                
                                <div className="timeline-line">
                                  <span className="duration">{formatDuration(segment.duration)}</span>
                                </div>
                                
                                <div className="timeline-point">
                                  <div className="timeline-time">{formatTime(segment.arrival.at)}</div>
                                  <div className="timeline-date">{formatDate(segment.arrival.at)}</div>
                                  <div className="timeline-airport">
                                    <strong>{segment.arrival.iataCode}</strong>
                                    {segment.arrival.terminal && ` Terminal ${segment.arrival.terminal}`}
                                  </div>
                                </div>
                              </div>
                              
                              {segmentIndex < flight.itineraries[0].segments.length - 1 && (
                                <div className="connection-info">
                                  <i className="fas fa-clock"></i>
                                  <span>Connection time: {formatDuration(60)}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {flight.itineraries.length > 1 && (
                        <div className="segment-details return-segments">
                          <h4>Return Flight Details</h4>
                          <div className="segments">
                            {flight.itineraries[1].segments.map((segment, segmentIndex) => (
                              <div key={`return-${segmentIndex}`} className="segment">
                                <div className="segment-header">
                                  <div className="segment-airline">
                                    <span>{getAirlineName(segment.carrierCode)}</span>
                                    <span className="flight-number">Flight {segment.number}</span>
                                  </div>
                                  <div className="segment-aircraft">
                                    Aircraft: {segment.aircraft?.code || 'N/A'}
                                  </div>
                                </div>
                                
                                <div className="segment-timeline">
                                  <div className="timeline-point">
                                    <div className="timeline-time">{formatTime(segment.departure.at)}</div>
                                    <div className="timeline-date">{formatDate(segment.departure.at)}</div>
                                    <div className="timeline-airport">
                                      <strong>{segment.departure.iataCode}</strong>
                                      {segment.departure.terminal && ` Terminal ${segment.departure.terminal}`}
                                    </div>
                                  </div>
                                  
                                  <div className="timeline-line">
                                    <span className="duration">{formatDuration(segment.duration)}</span>
                                  </div>
                                  
                                  <div className="timeline-point">
                                    <div className="timeline-time">{formatTime(segment.arrival.at)}</div>
                                    <div className="timeline-date">{formatDate(segment.arrival.at)}</div>
                                    <div className="timeline-airport">
                                      <strong>{segment.arrival.iataCode}</strong>
                                      {segment.arrival.terminal && ` Terminal ${segment.arrival.terminal}`}
                                    </div>
                                  </div>
                                </div>
                                
                                {segmentIndex < flight.itineraries[1].segments.length - 1 && (
                                  <div className="connection-info">
                                    <i className="fas fa-clock"></i>
                                    <span>Connection time: {formatDuration(90)}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="fare-details">
                        <h4>Fare Details</h4>
                        <div className="fare-info">
                          <div className="fare-item">
                            <span>Cabin class:</span>
                            <span>{formatCabinClass(
                              flight.travelerPricings[0]?.fareDetailsBySegment?.[0]?.cabin || 
                              searchSummary.cabinClass
                            )}</span>
                          </div>
                          <div className="fare-item">
                            <span>Baggage allowance:</span>
                            <span>
                              {flight.travelerPricings[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags?.quantity || 0} checked bag(s)
                            </span>
                          </div>
                        </div>
                        <div className="price-breakdown">
                          <div className="price-item">
                            <span>Base fare:</span>
                            <span>${parseFloat(flight.price.base).toFixed(2)}</span>
                          </div>
                          <div className="price-item">
                            <span>Taxes & fees:</span>
                            <span>${(parseFloat(flight.price.total) - parseFloat(flight.price.base)).toFixed(2)}</span>
                          </div>
                          <div className="price-item total">
                            <span>Total:</span>
                            <span>${parseFloat(flight.price.total).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="booking-actions">
                        <button className="btn btn-primary book-btn">
                          Select This Flight
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">
                <i className="fas fa-plane-slash"></i>
              </div>
              <h3>No flights found</h3>
              <p>Try adjusting your search criteria or choose different dates</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlightResults;