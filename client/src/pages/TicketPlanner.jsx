import React, { useState } from 'react';
import FlightSearch from '../components/FlightSearch';
import FlightOffersList from '../components/FlightOffersList';
import CheapestTravelDates from '../components/CheapestTravelDates';
import AmadeusService from '../services/amadeus';

const TicketPlanner = () => {
  const [flightOffers, setFlightOffers] = useState([]);
  const [cheapestDates, setCheapestDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cheapestLoading, setCheapestLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  
  const handleSearch = async (params) => {
    setSearchParams(params);
    setLoading(true);
    setError(null);
    setCheapestLoading(true);
    
    try {
      // Search for flights with the specified parameters
      const result = await AmadeusService.searchFlights(params);
      setFlightOffers(result.data || []);
      
      // Also search for cheapest travel dates
      findCheapestDates(params);
    } catch (err) {
      setError('Failed to fetch flight offers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const findCheapestDates = async (params) => {
    setCheapestLoading(true);
    
    try {
      const cheapestOptions = await AmadeusService.findCheapestTravelDates(
        params.originLocationCode,
        params.destinationLocationCode,
        params.departureDate,
        params.returnDate
      );
      
      setCheapestDates(cheapestOptions);
    } catch (err) {
      console.error('Error finding cheapest dates:', err);
      // We don't set the main error here to still show flight results
    } finally {
      setCheapestLoading(false);
    }
  };
  
  const handleSelectDates = (dateOption) => {
    if (!searchParams) return;
    
    const newParams = {
      ...searchParams,
      departureDate: dateOption.departureDate,
      returnDate: dateOption.returnDate
    };
    
    handleSearch(newParams);
  };
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Flight Ticket Planner</h1>
      
      <FlightSearch onSearch={handleSearch} loading={loading} />
      
      {searchParams && (
        <CheapestTravelDates 
          cheapestDates={cheapestDates}
          loading={cheapestLoading}
          error={null}
          onSelectDates={handleSelectDates}
        />
      )}
      
      <FlightOffersList 
        flightOffers={flightOffers}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default TicketPlanner;