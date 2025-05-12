import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { searchAirports } from '../api/amadeus';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/flightSearch.css';

const FlightSearch = ({ onSearch, loading }) => {
  const [searchParams] = useSearchParams();
  
  // Form state
  const [formData, setFormData] = useState({
    originLocationCode: searchParams.get('originLocationCode') || '',
    destinationLocationCode: searchParams.get('destinationLocationCode') || '',
    departureDate: searchParams.get('departureDate') 
      ? new Date(searchParams.get('departureDate')) 
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
    returnDate: searchParams.get('returnDate') 
      ? new Date(searchParams.get('returnDate'))
      : null,
    adults: parseInt(searchParams.get('adults') || '1'),
    children: parseInt(searchParams.get('children') || '0'),
    infants: parseInt(searchParams.get('infants') || '0'),
    travelClass: searchParams.get('travelClass') || 'ECONOMY',
    nonStop: searchParams.get('nonStop') === 'true',
    currencyCode: 'USD',
    maxPrice: parseInt(searchParams.get('maxPrice') || '0')
  });
  
  // Trip type state
  const [tripType, setTripType] = useState(formData.returnDate ? 'roundTrip' : 'oneWay');
  
  // Airport search state
  const [originSearch, setOriginSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState({});
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle trip type change
  const handleTripTypeChange = (type) => {
    setTripType(type);
    if (type === 'oneWay') {
      setFormData({ ...formData, returnDate: null });
    } else if (type === 'roundTrip' && !formData.returnDate) {
      // Set default return date if switching to round trip
      const departureDate = formData.departureDate || new Date();
      const returnDate = new Date(departureDate);
      returnDate.setDate(returnDate.getDate() + 7); // Default to 1 week after departure
      setFormData({ ...formData, returnDate });
    }
  };
  
  // Handle date changes
  const handleDateChange = (date, fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: date
    });
    
    // If departure date changes and it's after return date, update return date
    if (fieldName === 'departureDate' && formData.returnDate && date > formData.returnDate) {
      const newReturnDate = new Date(date);
      newReturnDate.setDate(date.getDate() + 1);
      setFormData(prev => ({
        ...prev,
        departureDate: date,
        returnDate: newReturnDate
      }));
    }
  };
  
  // Handle passenger count changes
  const updatePassenger = (type, increment) => {
    const newValue = formData[type] + increment;
    
    if (newValue < 0) return;
    
    // Additional validation
    if (type === 'adults' && newValue < 1) return; // At least 1 adult required
    if ((type === 'children' || type === 'infants') && newValue > 9) return; // Max 9 children/infants
    
    // Update state
    setFormData({
      ...formData,
      [type]: newValue
    });
  };
  
  // Search for airports as user types
  const searchAirportsFunction = async (query, type) => {
    if (!query || query.length < 2) {
      if (type === 'origin') {
        setOriginSuggestions([]);
      } else {
        setDestinationSuggestions([]);
      }
      return;
    }
    
    try {
      if (type === 'origin') {
        setIsSearchingOrigin(true);
      } else {
        setIsSearchingDestination(true);
      }
      
      // Import and use the searchAirports function from amadeus.js
      const results = await searchAirports(query);
      console.log(`${type} search results:`, results);
      
      const suggestions = results.map(airport => ({
        code: airport.iataCode,
        name: airport.name,
        city: airport.address.cityName,
        country: airport.address.countryName
      }));
      
      if (type === 'origin') {
        setOriginSuggestions(suggestions);
        setIsSearchingOrigin(false);
      } else {
        setDestinationSuggestions(suggestions);
        setIsSearchingDestination(false);
      }
    } catch (error) {
      console.error('Error searching airports:', error);
      
      if (type === 'origin') {
        setOriginSuggestions([]);
        setIsSearchingOrigin(false);
      } else {
        setDestinationSuggestions([]);
        setIsSearchingDestination(false);
      }
    }
  };
  
  // Select an airport from suggestions
  const selectAirport = (suggestion, type) => {
    if (type === 'origin') {
      setFormData({
        ...formData,
        originLocationCode: suggestion.code
      });
      setOriginSearch(`${suggestion.city} (${suggestion.code})`);
      setOriginSuggestions([]);
    } else {
      setFormData({
        ...formData,
        destinationLocationCode: suggestion.code
      });
      setDestinationSearch(`${suggestion.city} (${suggestion.code})`);
      setDestinationSuggestions([]);
    }
  };
  
  // Debounced airport search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (originSearch) searchAirportsFunction(originSearch, 'origin');
    }, 500);
    return () => clearTimeout(timer);
  }, [originSearch]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (destinationSearch) searchAirportsFunction(destinationSearch, 'destination');
    }, 500);
    return () => clearTimeout(timer);
  }, [destinationSearch]);
  
  // Initialize search inputs from URL params
  useEffect(() => {
    if (searchParams.get('originLocationCode')) {
      setOriginSearch(searchParams.get('originLocationCode'));
      // In a real app, you would fetch airport details based on code
    }
    if (searchParams.get('destinationLocationCode')) {
      setDestinationSearch(searchParams.get('destinationLocationCode'));
      // In a real app, you would fetch airport details based on code
    }
  }, [searchParams]);
  
  // Debug log when search inputs change
  useEffect(() => {
    console.log('originSearch changed:', originSearch);
  }, [originSearch]);

  useEffect(() => {
    console.log('destinationSearch changed:', destinationSearch);
  }, [destinationSearch]);

  // Debug log when suggestions change
  useEffect(() => {
    console.log('originSuggestions:', originSuggestions);
  }, [originSuggestions]);

  useEffect(() => {
    console.log('destinationSuggestions:', destinationSuggestions);
  }, [destinationSuggestions]);
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.originLocationCode) {
      newErrors.originLocationCode = 'Please select a departure airport';
    }
    
    if (!formData.destinationLocationCode) {
      newErrors.destinationLocationCode = 'Please select a destination airport';
    }
    
    if (formData.originLocationCode === formData.destinationLocationCode && formData.originLocationCode) {
      newErrors.destinationLocationCode = 'Destination cannot be the same as origin';
    }
    
    if (!formData.departureDate) {
      newErrors.departureDate = 'Please select a departure date';
    }
    
    if (tripType === 'roundTrip' && !formData.returnDate) {
      newErrors.returnDate = 'Please select a return date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Prepare the search data object
      const searchData = {
        originLocationCode: formData.originLocationCode,
        destinationLocationCode: formData.destinationLocationCode,
        departureDate: formData.departureDate,
        returnDate: tripType === 'roundTrip' ? formData.returnDate : null,
        adults: formData.adults,
        children: formData.children,
        infants: formData.infants,
        travelClass: formData.travelClass,
        nonStop: formData.nonStop
      };
      
      onSearch(searchData);
    }
  };
  
  return (
    <div className="flight-search-container">
      <div className="search-tabs">
        <button 
          className={`tab ${tripType === 'oneWay' ? 'active' : ''}`}
          onClick={() => handleTripTypeChange('oneWay')}
          type="button"
        >
          <i className="fas fa-long-arrow-alt-right"></i>
          <span>One Way</span>
        </button>
        <button 
          className={`tab ${tripType === 'roundTrip' ? 'active' : ''}`}
          onClick={() => handleTripTypeChange('roundTrip')}
          type="button"
        >
          <i className="fas fa-exchange-alt"></i>
          <span>Round Trip</span>
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="flight-search-form">
        <div className="search-row">
          <div className="form-group origin-group">
            <label htmlFor="origin">From</label>
            <div className="input-with-icon">
              <i className="fas fa-plane-departure"></i>
              <div className="position-relative">
                <input
                  type="text"
                  id="origin"
                  name="origin"
                  placeholder="City or airport"
                  value={originSearch}
                  onChange={(e) => setOriginSearch(e.target.value)}
                  className={`form-control ${errors.originLocationCode ? 'is-invalid' : ''}`}
                  autoComplete="off"
                />
                {isSearchingOrigin && (
                  <div className="search-spinner">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
                {originSuggestions.length > 0 && (
                  <ul className="airport-suggestions">
                    {originSuggestions.map((suggestion, index) => (
                      <li 
                        key={index} 
                        onClick={() => selectAirport(suggestion, 'origin')}
                        className="suggestion-item"
                      >
                        <div className="airport-code">{suggestion.code}</div>
                        <div className="airport-details">
                          <div className="airport-name">{suggestion.name}</div>
                          <div className="airport-location">{suggestion.city}, {suggestion.country}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {errors.originLocationCode && (
                  <div className="invalid-feedback">{errors.originLocationCode}</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="swap-button">
            <button 
              type="button"
              onClick={() => {
                const temp = originSearch;
                setOriginSearch(destinationSearch);
                setDestinationSearch(temp);
                
                const tempCode = formData.originLocationCode;
                setFormData({
                  ...formData,
                  originLocationCode: formData.destinationLocationCode,
                  destinationLocationCode: tempCode
                });
              }}
              aria-label="Swap origin and destination"
            >
              <i className="fas fa-exchange-alt"></i>
            </button>
          </div>
          
          <div className="form-group destination-group">
            <label htmlFor="destination">To</label>
            <div className="input-with-icon">
              <i className="fas fa-plane-arrival"></i>
              <div className="position-relative">
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  placeholder="City or airport"
                  value={destinationSearch}
                  onChange={(e) => setDestinationSearch(e.target.value)}
                  className={`form-control ${errors.destinationLocationCode ? 'is-invalid' : ''}`}
                  autoComplete="off"
                />
                {isSearchingDestination && (
                  <div className="search-spinner">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
                {destinationSuggestions.length > 0 && (
                  <ul className="airport-suggestions">
                    {destinationSuggestions.map((suggestion, index) => (
                      <li 
                        key={index} 
                        onClick={() => selectAirport(suggestion, 'destination')}
                        className="suggestion-item"
                      >
                        <div className="airport-code">{suggestion.code}</div>
                        <div className="airport-details">
                          <div className="airport-name">{suggestion.name}</div>
                          <div className="airport-location">{suggestion.city}, {suggestion.country}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {errors.destinationLocationCode && (
                  <div className="invalid-feedback">{errors.destinationLocationCode}</div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="search-row">
          <div className="form-group date-group">
            <label htmlFor="departureDate">Departure</label>
            <div className="input-with-icon">
              <i className="fas fa-calendar-alt"></i>
              <DatePicker 
                selected={formData.departureDate}
                onChange={(date) => handleDateChange(date, 'departureDate')}
                minDate={new Date()}
                className={`form-control ${errors.departureDate ? 'is-invalid' : ''}`}
                dateFormat="MMM d, yyyy"
                placeholderText="Select date"
              />
            </div>
            {errors.departureDate && (
              <div className="invalid-feedback">{errors.departureDate}</div>
            )}
          </div>
          
          <div className="form-group date-group">
            <label htmlFor="returnDate">
              {tripType === 'roundTrip' ? 'Return' : <span className="text-muted">Return</span>}
            </label>
            <div className="input-with-icon">
              <i className="fas fa-calendar-alt"></i>
              <DatePicker 
                selected={formData.returnDate}
                onChange={(date) => handleDateChange(date, 'returnDate')}
                minDate={formData.departureDate || new Date()}
                className={`form-control ${errors.returnDate ? 'is-invalid' : ''}`}
                dateFormat="MMM d, yyyy"
                placeholderText="Select date"
                disabled={tripType !== 'roundTrip'}
              />
            </div>
            {errors.returnDate && (
              <div className="invalid-feedback">{errors.returnDate}</div>
            )}
          </div>
        </div>
        
        <div className="search-row">
          <div className="form-group passengers-group">
            <label>Passengers & Class</label>
            <div className="dropdown">
              <button 
                className="btn dropdown-toggle passenger-select"
                type="button"
                id="passengerDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fas fa-users"></i>
                <span>
                  {formData.adults + formData.children + formData.infants} Passenger{formData.adults + formData.children + formData.infants !== 1 ? 's' : ''}, {formData.travelClass}
                </span>
              </button>
              
              <div className="dropdown-menu passenger-dropdown" aria-labelledby="passengerDropdown">
                <div className="passenger-types">
                  <div className="passenger-type">
                    <div className="passenger-info">
                      <span className="passenger-label">Adults</span>
                      <span className="passenger-description">12+ years</span>
                    </div>
                    <div className="passenger-controls">
                      <button 
                        type="button" 
                        className="btn-passenger"
                        onClick={() => updatePassenger('adults', -1)}
                        disabled={formData.adults <= 1}
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                      <span className="passenger-count">{formData.adults}</span>
                      <button 
                        type="button" 
                        className="btn-passenger"
                        onClick={() => updatePassenger('adults', 1)}
                        disabled={formData.adults + formData.children + formData.infants >= 9}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="passenger-type">
                    <div className="passenger-info">
                      <span className="passenger-label">Children</span>
                      <span className="passenger-description">2-11 years</span>
                    </div>
                    <div className="passenger-controls">
                      <button 
                        type="button" 
                        className="btn-passenger"
                        onClick={() => updatePassenger('children', -1)}
                        disabled={formData.children <= 0}
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                      <span className="passenger-count">{formData.children}</span>
                      <button 
                        type="button" 
                        className="btn-passenger"
                        onClick={() => updatePassenger('children', 1)}
                        disabled={formData.adults + formData.children + formData.infants >= 9 || formData.children >= 9}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="passenger-type">
                    <div className="passenger-info">
                      <span className="passenger-label">Infants</span>
                      <span className="passenger-description">Under 2 years</span>
                    </div>
                    <div className="passenger-controls">
                      <button 
                        type="button" 
                        className="btn-passenger"
                        onClick={() => updatePassenger('infants', -1)}
                        disabled={formData.infants <= 0}
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                      <span className="passenger-count">{formData.infants}</span>
                      <button 
                        type="button" 
                        className="btn-passenger"
                        onClick={() => updatePassenger('infants', 1)}
                        disabled={formData.adults + formData.children + formData.infants >= 9 || formData.infants >= formData.adults || formData.infants >= 9}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="cabin-selection">
                  <p className="dropdown-label">Cabin Class</p>
                  <div className="cabin-options">
                    <div className="form-check">
                      <input
                        type="radio"
                        id="economy"
                        name="travelClass"
                        value="ECONOMY"
                        checked={formData.travelClass === 'ECONOMY'}
                        onChange={handleInputChange}
                        className="form-check-input"
                      />
                      <label htmlFor="economy" className="form-check-label">Economy</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        id="premium"
                        name="travelClass"
                        value="PREMIUM_ECONOMY"
                        checked={formData.travelClass === 'PREMIUM_ECONOMY'}
                        onChange={handleInputChange}
                        className="form-check-input"
                      />
                      <label htmlFor="premium" className="form-check-label">Premium Economy</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        id="business"
                        name="travelClass"
                        value="BUSINESS"
                        checked={formData.travelClass === 'BUSINESS'}
                        onChange={handleInputChange}
                        className="form-check-input"
                      />
                      <label htmlFor="business" className="form-check-label">Business</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        id="first"
                        name="travelClass"
                        value="FIRST"
                        checked={formData.travelClass === 'FIRST'}
                        onChange={handleInputChange}
                        className="form-check-input"
                      />
                      <label htmlFor="first" className="form-check-label">First Class</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-group non-stop-group">
            <div className="form-check">
              <input
                type="checkbox"
                id="nonStop"
                name="nonStop"
                checked={formData.nonStop}
                onChange={handleInputChange}
                className="form-check-input"
              />
              <label htmlFor="nonStop" className="form-check-label">Direct flights only</label>
            </div>
          </div>
          
          <div className="form-group search-btn-group">
            <button type="submit" className="btn btn-primary search-btn" disabled={loading}>
              {loading ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Searching...
                </span>
              ) : (
                <span>
                  <i className="fas fa-search me-2"></i> Search Flights
                </span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FlightSearch;