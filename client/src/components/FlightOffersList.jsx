import React, { useState } from 'react';
import '../styles/flightOffers.css';

const FlightOffersList = ({ flightOffers, loading, error }) => {
  const [sortBy, setSortBy] = useState('price');
  const [expandedOfferId, setExpandedOfferId] = useState(null);
  
  // Airline logo mapping
  const airlineLogo = (code) => {
    const logos = {
      'PK': 'https://www.piac.com.pk/assets/images/PIA-logo.png',
      'EK': 'https://logos-world.net/wp-content/uploads/2020/03/Emirates-Logo.png',
      'QR': 'https://logos-world.net/wp-content/uploads/2020/03/Qatar-Airways-Logo.png',
      'TK': 'https://logos-world.net/wp-content/uploads/2021/08/Turkish-Airlines-Logo.png',
      'ET': 'https://logos-world.net/wp-content/uploads/2023/01/Ethiopian-Airlines-Logo.png',
      'EY': 'https://logos-world.net/wp-content/uploads/2020/03/Etihad-Airways-Logo.png',
      'BA': 'https://logos-world.net/wp-content/uploads/2020/03/British-Airways-Logo.png',
      'LH': 'https://logos-world.net/wp-content/uploads/2021/08/Lufthansa-Logo.png',
      'AF': 'https://logos-world.net/wp-content/uploads/2021/08/Air-France-Logo.png',
      'UA': 'https://logos-world.net/wp-content/uploads/2021/09/United-Airlines-Logo.png'
    };
    
    return logos[code] || `https://ui-avatars.com/api/?background=random&color=fff&name=${code}&bold=true&size=128`;
  };
  
  if (loading) {
    return (
      <div className="flight-loader">
        <div className="loader-animation">
          <div className="airplane-icon">
            <i className="fas fa-plane"></i>
          </div>
          <div className="orbit"></div>
        </div>
        <p>Finding the perfect flights for you...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h3>We encountered a problem</h3>
        <p>{error}</p>
        <button className="btn-retry">
          <i className="fas fa-redo"></i> Try Again
        </button>
      </div>
    );
  }
  
  if (!flightOffers || flightOffers.length === 0) {
    return (
      <div className="no-results">
        <div className="no-results-icon">
          <i className="fas fa-search"></i>
        </div>
        <h3>No flights found</h3>
        <p>We couldn't find any flights matching your criteria. Try adjusting your search parameters.</p>
      </div>
    );
  }
  
  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
  };
  
  // Format duration
  const formatDuration = (durationString) => {
    if (!durationString) return '';
    
    if (typeof durationString === 'string') {
      // Parse ISO 8601 duration format (e.g., PT5H30M)
      const hours = durationString.match(/(\d+)H/);
      const minutes = durationString.match(/(\d+)M/);
      return `${hours ? hours[1] + 'h ' : ''}${minutes ? minutes[1] + 'm' : ''}`;
    } else if (typeof durationString === 'number') {
      // Parse minutes
      const hours = Math.floor(durationString / 60);
      const minutes = durationString % 60;
      return `${hours}h ${minutes}m`;
    }
    
    return '';
  };
  
  // Get airline name
  const getAirlineName = (code) => {
    const airlines = {
      'PK': 'Pakistan International Airlines',
      'EK': 'Emirates',
      'QR': 'Qatar Airways',
      'TK': 'Turkish Airlines',
      'ET': 'Ethiopian Airlines',
      'EY': 'Etihad Airways',
      'BA': 'British Airways',
      'LH': 'Lufthansa',
      'AF': 'Air France',
      'UA': 'United Airlines'
    };
    
    return airlines[code] || code;
  };
  
  // Sort flight offers
  const sortedOffers = [...flightOffers].sort((a, b) => {
    if (sortBy === 'price') {
      return parseFloat(a.price.total) - parseFloat(b.price.total);
    } else if (sortBy === 'duration') {
      const aDuration = a.itineraries[0].duration 
        ? (a.itineraries[0].duration.match(/PT(\d+)H/) ? parseInt(a.itineraries[0].duration.match(/PT(\d+)H/)[1]) : 0) * 60 
          + (a.itineraries[0].duration.match(/(\d+)M/) ? parseInt(a.itineraries[0].duration.match(/(\d+)M/)[1]) : 0)
        : a.itineraries[0].segments.reduce((total, segment) => total + parseInt(segment.duration || 0), 0);
        
      const bDuration = b.itineraries[0].duration 
        ? (b.itineraries[0].duration.match(/PT(\d+)H/) ? parseInt(b.itineraries[0].duration.match(/PT(\d+)H/)[1]) : 0) * 60 
          + (b.itineraries[0].duration.match(/(\d+)M/) ? parseInt(b.itineraries[0].duration.match(/(\d+)M/)[1]) : 0)
        : b.itineraries[0].segments.reduce((total, segment) => total + parseInt(segment.duration || 0), 0);
        
      return aDuration - bDuration;
    } else if (sortBy === 'departure') {
      const aTime = new Date(a.itineraries[0].segments[0].departure.at);
      const bTime = new Date(b.itineraries[0].segments[0].departure.at);
      return aTime - bTime;
    }
    
    return 0;
  });
  
  // Calculate stops description
  const getStopsLabel = (segments) => {
    const stops = segments.length - 1;
    if (stops === 0) return 'Direct';
    if (stops === 1) return '1 Stop';
    return `${stops} Stops`;
  };

  return (
    <div className="flight-offers-container">
      <div className="flight-offers-header">
        <div className="results-summary">
          <h2>Flight Options</h2>
          <span className="result-count">{flightOffers.length} flights found</span>
        </div>
        
        <div className="sorting-options">
          <div className="sort-label">Sort by:</div>
          <div className="sort-tabs">
            <button 
              className={`sort-tab ${sortBy === 'price' ? 'active' : ''}`}
              onClick={() => setSortBy('price')}
            >
              <i className="fas fa-tag"></i> Cheapest
            </button>
            <button 
              className={`sort-tab ${sortBy === 'duration' ? 'active' : ''}`}
              onClick={() => setSortBy('duration')}
            >
              <i className="fas fa-clock"></i> Quickest
            </button>
            <button 
              className={`sort-tab ${sortBy === 'departure' ? 'active' : ''}`}
              onClick={() => setSortBy('departure')}
            >
              <i className="fas fa-plane-departure"></i> Earliest
            </button>
          </div>
        </div>
      </div>
      
      <div className="flight-cards-container">
        {sortedOffers.map(offer => {
          const isOneWay = offer.itineraries.length === 1;
          
          // Outbound flight info
          const outbound = offer.itineraries[0];
          const outboundSegments = outbound.segments;
          const outboundDepartureTime = new Date(outboundSegments[0].departure.at);
          const outboundArrivalTime = new Date(outboundSegments[outboundSegments.length - 1].arrival.at);
          
          // Return flight info (if exists)
          const returnFlight = !isOneWay ? offer.itineraries[1] : null;
          const returnSegments = returnFlight?.segments || [];
          const returnDepartureTime = returnFlight ? new Date(returnSegments[0].departure.at) : null;
          const returnArrivalTime = returnFlight ? new Date(returnSegments[returnSegments.length - 1].arrival.at) : null;
          
          // Get primary airline code for the outbound flight
          const mainAirlineCode = outboundSegments[0].carrierCode;
          const isExpanded = expandedOfferId === offer.id;
          
          return (
            <div key={offer.id} className={`flight-card ${isExpanded ? 'expanded' : ''}`}>
              <div className="flight-card-main" onClick={() => setExpandedOfferId(isExpanded ? null : offer.id)}>
                <div className="flight-card-header">
                  <div className="airline-info">
                    <div className="airline-logo">
                      <img src={airlineLogo(mainAirlineCode)} alt={getAirlineName(mainAirlineCode)} />
                    </div>
                    <div className="airline-name">
                      <span>{getAirlineName(mainAirlineCode)}</span>
                      <span className="flight-number">Flight {outboundSegments[0].number}</span>
                    </div>
                  </div>
                  
                  <div className="price-tag">
                    <div className="price">${parseInt(offer.price.total).toFixed(2)}</div>
                    <div className="price-qualifier">per passenger</div>
                  </div>
                </div>
                
                <div className="flight-card-content">
                  {/* Outbound journey */}
                  <div className="journey outbound">
                    <div className="journey-label">
                      <span className="direction">Outbound</span>
                      <span className="stops-label">{getStopsLabel(outboundSegments)}</span>
                    </div>
                    
                    <div className="journey-main">
                      <div className="terminal terminal-departure">
                        <div className="time">{formatTime(outboundDepartureTime)}</div>
                        <div className="date">{formatDate(outboundDepartureTime)}</div>
                        <div className="airport">{outboundSegments[0].departure.iataCode}</div>
                      </div>
                      
                      <div className="flight-path">
                        <div className="duration">
                          <i className="far fa-clock"></i> {formatDuration(outbound.duration || outboundSegments.reduce((total, segment) => total + parseInt(segment.duration || 0), 0))}
                        </div>
                        <div className="path-line">
                          {outboundSegments.length > 1 && outboundSegments.map((_, i) => (
                            i < outboundSegments.length - 1 ? (
                              <div key={i} className="stopover-point">
                                <div className="stopover-dot"></div>
                                <div className="stopover-label">{outboundSegments[i].arrival.iataCode}</div>
                              </div>
                            ) : null
                          ))}
                        </div>
                        <div className="flight-type">
                          {outboundSegments.length === 1 ? (
                            <span className="nonstop">Nonstop</span>
                          ) : (
                            <span className="with-stops">{outboundSegments.length - 1} stop{outboundSegments.length > 2 ? 's' : ''}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="terminal terminal-arrival">
                        <div className="time">{formatTime(outboundArrivalTime)}</div>
                        <div className="date">{formatDate(outboundArrivalTime)}</div>
                        <div className="airport">{outboundSegments[outboundSegments.length - 1].arrival.iataCode}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Return journey (if round trip) */}
                  {!isOneWay && (
                    <div className="journey return">
                      <div className="journey-label">
                        <span className="direction">Return</span>
                        <span className="stops-label">{getStopsLabel(returnSegments)}</span>
                      </div>
                      
                      <div className="journey-main">
                        <div className="terminal terminal-departure">
                          <div className="time">{formatTime(returnDepartureTime)}</div>
                          <div className="date">{formatDate(returnDepartureTime)}</div>
                          <div className="airport">{returnSegments[0].departure.iataCode}</div>
                        </div>
                        
                        <div className="flight-path">
                          <div className="duration">
                            <i className="far fa-clock"></i> {formatDuration(returnFlight.duration || returnSegments.reduce((total, segment) => total + parseInt(segment.duration || 0), 0))}
                          </div>
                          <div className="path-line return">
                            {returnSegments.length > 1 && returnSegments.map((_, i) => (
                              i < returnSegments.length - 1 ? (
                                <div key={i} className="stopover-point">
                                  <div className="stopover-dot"></div>
                                  <div className="stopover-label">{returnSegments[i].arrival.iataCode}</div>
                                </div>
                              ) : null
                            ))}
                          </div>
                          <div className="flight-type">
                            {returnSegments.length === 1 ? (
                              <span className="nonstop">Nonstop</span>
                            ) : (
                              <span className="with-stops">{returnSegments.length - 1} stop{returnSegments.length > 2 ? 's' : ''}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="terminal terminal-arrival">
                          <div className="time">{formatTime(returnArrivalTime)}</div>
                          <div className="date">{formatDate(returnArrivalTime)}</div>
                          <div className="airport">{returnSegments[returnSegments.length - 1].arrival.iataCode}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flight-card-footer">
                  <div className="cabin-info">
                    <i className="fas fa-couch"></i> {offer.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin || 'Economy'}
                  </div>
                  <div className="baggage-info">
                    <i className="fas fa-suitcase"></i> {offer.travelerPricings[0]?.fareDetailsBySegment[0]?.includedCheckedBags?.quantity || 0} checked bag
                  </div>
                  <div className="details-toggle">
                    {isExpanded ? 'Hide details' : 'View details'}
                    <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                  </div>
                </div>
              </div>
              
              {/* Expanded details section */}
              {isExpanded && (
                <div className="flight-details">
                  <div className="details-tabs">
                    <button className="tab-button active">Flight Details</button>
                    <button className="tab-button">Fare Info</button>
                    <button className="tab-button">Policies</button>
                  </div>
                  
                  <div className="details-content">
                    <div className="flight-segments">
                      <div className="segment-group outbound">
                        <h3>Outbound Journey</h3>
                        
                        {outboundSegments.map((segment, index) => (
                          <div key={segment.id} className="segment">
                            <div className="segment-header">
                              <div className="segment-airline">
                                <img 
                                  src={airlineLogo(segment.carrierCode)} 
                                  alt={getAirlineName(segment.carrierCode)} 
                                  className="segment-airline-logo"
                                />
                                <div className="segment-airline-info">
                                  <div className="airline-name">{getAirlineName(segment.carrierCode)}</div>
                                  <div className="flight-number">Flight {segment.number}</div>
                                </div>
                              </div>
                              <div className="segment-duration">
                                <i className="far fa-clock"></i> {formatDuration(segment.duration)}
                              </div>
                            </div>
                            
                            <div className="segment-timeline">
                              <div className="timeline-point departure">
                                <div className="timeline-point-marker"></div>
                                <div className="timeline-point-info">
                                  <div className="time">{formatTime(segment.departure.at)}</div>
                                  <div className="date">{formatDate(segment.departure.at)}</div>
                                  <div className="airport">
                                    <strong>{segment.departure.iataCode}</strong>
                                    {segment.departure.terminal && ` · Terminal ${segment.departure.terminal}`}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="timeline-line">
                                <i className="fas fa-plane"></i>
                              </div>
                              
                              <div className="timeline-point arrival">
                                <div className="timeline-point-marker"></div>
                                <div className="timeline-point-info">
                                  <div className="time">{formatTime(segment.arrival.at)}</div>
                                  <div className="date">{formatDate(segment.arrival.at)}</div>
                                  <div className="airport">
                                    <strong>{segment.arrival.iataCode}</strong>
                                    {segment.arrival.terminal && ` · Terminal ${segment.arrival.terminal}`}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {index < outboundSegments.length - 1 && (
                              <div className="layover">
                                <i className="fas fa-hourglass-half"></i>
                                <span>Layover: {formatDuration((new Date(outboundSegments[index + 1].departure.at) - new Date(segment.arrival.at)) / 60000)}</span>
                                <span className="airport">{segment.arrival.iataCode}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {!isOneWay && (
                        <div className="segment-group return">
                          <h3>Return Journey</h3>
                          
                          {returnSegments.map((segment, index) => (
                            <div key={segment.id} className="segment">
                              <div className="segment-header">
                                <div className="segment-airline">
                                  <img 
                                    src={airlineLogo(segment.carrierCode)} 
                                    alt={getAirlineName(segment.carrierCode)} 
                                    className="segment-airline-logo"
                                  />
                                  <div className="segment-airline-info">
                                    <div className="airline-name">{getAirlineName(segment.carrierCode)}</div>
                                    <div className="flight-number">Flight {segment.number}</div>
                                  </div>
                                </div>
                                <div className="segment-duration">
                                  <i className="far fa-clock"></i> {formatDuration(segment.duration)}
                                </div>
                              </div>
                              
                              <div className="segment-timeline">
                                <div className="timeline-point departure">
                                  <div className="timeline-point-marker"></div>
                                  <div className="timeline-point-info">
                                    <div className="time">{formatTime(segment.departure.at)}</div>
                                    <div className="date">{formatDate(segment.departure.at)}</div>
                                    <div className="airport">
                                      <strong>{segment.departure.iataCode}</strong>
                                      {segment.departure.terminal && ` · Terminal ${segment.departure.terminal}`}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="timeline-line return">
                                  <i className="fas fa-plane fa-flip-horizontal"></i>
                                </div>
                                
                                <div className="timeline-point arrival">
                                  <div className="timeline-point-marker"></div>
                                  <div className="timeline-point-info">
                                    <div className="time">{formatTime(segment.arrival.at)}</div>
                                    <div className="date">{formatDate(segment.arrival.at)}</div>
                                    <div className="airport">
                                      <strong>{segment.arrival.iataCode}</strong>
                                      {segment.arrival.terminal && ` · Terminal ${segment.arrival.terminal}`}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {index < returnSegments.length - 1 && (
                                <div className="layover">
                                  <i className="fas fa-hourglass-half"></i>
                                  <span>Layover: {formatDuration((new Date(returnSegments[index + 1].departure.at) - new Date(segment.arrival.at)) / 60000)}</span>
                                  <span className="airport">{segment.arrival.iataCode}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="fare-details">
                      <div className="fare-features">
                        <h3>Fare Features</h3>
                        <div className="feature-list">
                          <div className="feature">
                            <i className="fas fa-suitcase-rolling"></i>
                            <div className="feature-content">
                              <div className="feature-title">Baggage</div>
                              <div className="feature-description">
                                {offer.travelerPricings[0]?.fareDetailsBySegment[0]?.includedCheckedBags?.quantity || 0} checked bag per passenger
                              </div>
                            </div>
                          </div>
                          
                          <div className="feature">
                            <i className="fas fa-exchange-alt"></i>
                            <div className="feature-content">
                              <div className="feature-title">Changes</div>
                              <div className="feature-description">Changes permitted with fee</div>
                            </div>
                          </div>
                          
                          <div className="feature">
                            <i className="fas fa-ban"></i>
                            <div className="feature-content">
                              <div className="feature-title">Cancellation</div>
                              <div className="feature-description">Non-refundable</div>
                            </div>
                          </div>
                          
                          <div className="feature">
                            <i className="fas fa-chair"></i>
                            <div className="feature-content">
                              <div className="feature-title">Seat Selection</div>
                              <div className="feature-description">Available for purchase</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="price-breakdown">
                        <h3>Price Breakdown</h3>
                        <div className="price-items">
                          <div className="price-item">
                            <span>Base Fare</span>
                            <span>${parseInt(offer.price.base).toFixed(2)}</span>
                          </div>
                          <div className="price-item">
                            <span>Taxes & Fees</span>
                            <span>${(parseInt(offer.price.total) - parseInt(offer.price.base)).toFixed(2)}</span>
                          </div>
                          <div className="price-item total">
                            <span>Total</span>
                            <span>${parseInt(offer.price.total).toFixed(2)}</span>
                          </div>
                          
                          <button className="btn-select">Select this fare</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlightOffersList;