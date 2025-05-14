import React from 'react';

const CheapestTravelDates = ({ cheapestDates, loading, onSelectDates }) => {
  if (loading) {
    return (
      <div className="cheapest-dates-loading">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-2">Finding the best travel dates...</span>
      </div>
    );
  }
  
  if (!cheapestDates || cheapestDates.length === 0) {
    return null;
  }
  
  // Format price with currency symbol
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
  
  // Format date (YYYY-MM-DD to "Jan 01")
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="cheapest-dates-container mb-4">
      <h3 className="fs-5 fw-bold mb-3">Alternative Travel Dates</h3>
      
      <div className="cheapest-dates-list">
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
          {cheapestDates.slice(0, 6).map((dateOption, index) => (
            <div className="col" key={index}>
              <div 
                className="card cheapest-date-card h-100" 
                onClick={() => onSelectDates(dateOption)}
              >
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <div className="date-range">
                      <span className="fw-bold">{formatDate(dateOption.departureDate)}</span>
                      <span className="mx-2">→</span>
                      <span className="fw-bold">{formatDate(dateOption.returnDate)}</span>
                    </div>
                    <div className="text-muted small">
                      {Math.round((new Date(dateOption.returnDate) - new Date(dateOption.departureDate)) / (1000 * 60 * 60 * 24))} days
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="date-price fw-bold text-success">
                      {formatPrice(dateOption.price.total, dateOption.price.currency)}
                    </div>
                    <div className="text-muted small">per person</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CheapestTravelDates;