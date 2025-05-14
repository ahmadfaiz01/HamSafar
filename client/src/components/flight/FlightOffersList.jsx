import React from 'react';
import AirlineLogo from './AirlineLogo';

const FlightOffersList = ({ flightOffers, loading, error }) => {
  if (loading) {
    return (
      <div className="flight-offers-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Searching for flights...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flight-offers-error">
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
      </div>
    );
  }
  
  if (flightOffers.length === 0) {
    return (
      <div className="no-offers">
        {loading ? null : (
          <div className="text-center py-4">
            <i className="fas fa-search fa-3x mb-3 text-muted"></i>
            <h3>No Flight Offers Found</h3>
            <p>Try adjusting your search criteria or selecting different dates.</p>
          </div>
        )}
      </div>
    );
  }
  
  // Format price to display with 2 decimal places and currency symbol
  const formatPrice = (amount, currency) => {
    const currencySymbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'PKR': 'Rs.',
      // Add more currencies as needed
    };
    
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${parseFloat(amount).toFixed(0)}`;
  };
  
  // Format duration from PT2H30M to 2h 30m
  const formatDuration = (duration) => {
    if (!duration) return '';
    
    const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!matches) return duration;
    
    const hours = matches[1] ? `${matches[1]}h` : '';
    const minutes = matches[2] ? `${matches[2]}m` : '';
    
    return `${hours} ${minutes}`.trim();
  };
  
  // Format date and time (2023-08-20T19:40:00 to Aug 20, 7:40 PM)
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    
    const date = new Date(dateTimeString);
    const options = { month: 'short', day: 'numeric' };
    return {
      date: date.toLocaleDateString('en-US', options),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };
  };
  
  // Get airline name from IATA code
  const getAirlineName = (code) => {
    const airlines = {
      'TK': 'Turkish Airlines',
      'PK': 'Pakistan International Airlines',
      'EK': 'Emirates',
      'QR': 'Qatar Airways',
      'EY': 'Etihad Airways',
      'SV': 'Saudia',
      'BA': 'British Airways',
      'LH': 'Lufthansa',
      'UA': 'United Airlines',
      'AA': 'American Airlines',
      'DL': 'Delta Air Lines',
      // Add more airlines as needed
    };
    
    return airlines[code] || code;
  };
  
  return (
    <div className="flight-offers-container">
      <h2 className="flight-offers-title">Available Flights</h2>
      
      <div className="flight-offers-list">
        {flightOffers.map((offer, index) => {
          const firstSegment = offer.itineraries[0].segments[0];
          const lastSegment = offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1];
          
          const departure = formatDateTime(firstSegment.departure.at);
          const arrival = formatDateTime(lastSegment.arrival.at);
          
          const duration = formatDuration(offer.itineraries[0].duration);
          const stops = offer.itineraries[0].segments.length - 1;
          
          const airlineCode = firstSegment.carrierCode;
          const airlineName = getAirlineName(airlineCode);
          
          const price = formatPrice(
            offer.price.total,
            offer.price.currency
          );
          
          return (
            <div key={index} className="card flight-card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <div className="airline-logo-container me-3">
                    <AirlineLogo airlineCode={airlineCode} airlineName={airlineName} />
                  </div>
                  <span className="fw-bold">{airlineName}</span>
                </div>
                <div className="text-end">
                  <div className="flight-price fw-bold fs-4">{price}</div>
                  <small className="text-muted">per person</small>
                </div>
              </div>
              
              <div className="card-body">
                <div className="row flight-details align-items-center">
                  <div className="col-md-3 text-center">
                    <div className="fs-4 fw-bold">{departure.time}</div>
                    <div>{departure.date}</div>
                    <div className="airport-code">{firstSegment.departure.iataCode}</div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="flight-path">
                      <div className="flight-duration text-center mb-2">{duration}</div>
                      <div className="flight-line position-relative">
                        <div className="flight-stops">
                          {stops === 0 ? (
                            <span className="badge bg-success">Direct</span>
                          ) : (
                            <span className="badge bg-secondary">
                              {stops === 1 ? '1 stop' : `${stops} stops`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-3 text-center">
                    <div className="fs-4 fw-bold">{arrival.time}</div>
                    <div>{arrival.date}</div>
                    <div className="airport-code">{lastSegment.arrival.iataCode}</div>
                  </div>
                </div>
              </div>
              
              <div className="card-footer">
                <div className="d-flex justify-content-between">
                  <button className="btn btn-outline-primary" data-bs-toggle="collapse" data-bs-target={`#flightDetails-${index}`}>
                    <i className="fas fa-info-circle me-1"></i> Flight Details
                  </button>
                  <button className="btn btn-primary">
                    <i className="fas fa-ticket-alt me-1"></i> Select
                  </button>
                </div>
                
                <div className="collapse mt-3" id={`flightDetails-${index}`}>
                  <div className="card card-body bg-light">
                    <h5>Flight Segments</h5>
                    <div className="segment-list">
                      {offer.itineraries[0].segments.map((segment, segIndex) => {
                        const segDeparture = formatDateTime(segment.departure.at);
                        const segArrival = formatDateTime(segment.arrival.at);
                        const segDuration = formatDuration(segment.duration);
                        const segAirlineCode = segment.carrierCode;
                        const segAirlineName = getAirlineName(segAirlineCode);
                        
                        return (
                          <div key={segIndex} className={`segment ${segIndex > 0 ? 'mt-3 pt-3 border-top' : ''}`}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <div className="d-flex align-items-center">
                                <div className="me-2">
                                  <AirlineLogo airlineCode={segAirlineCode} airlineName={segAirlineName} />
                                </div>
                                <div>
                                  <div className="fw-bold">{segAirlineName}</div>
                                  <div className="text-muted small">Flight {segment.number}</div>
                                </div>
                              </div>
                              <div className="text-end">
                                <div className="text-muted small">Duration</div>
                                <div>{segDuration}</div>
                              </div>
                            </div>
                            
                            <div className="d-flex justify-content-between">
                              <div>
                                <div className="fw-bold">{segDeparture.time}</div>
                                <div>{segDeparture.date}</div>
                                <div className="text-muted">{segment.departure.iataCode}</div>
                              </div>
                              
                              <div className="text-end">
                                <div className="fw-bold">{segArrival.time}</div>
                                <div>{segArrival.date}</div>
                                <div className="text-muted">{segment.arrival.iataCode}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlightOffersList;