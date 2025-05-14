import React from 'react';

const CheapestTravelDates = ({ cheapestDates, loading, error, onSelectDates }) => {
  if (loading) {
    return (
      <div className="my-4 p-4 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3">Finding cheapest travel dates...</h3>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="my-4 p-4 bg-white rounded-lg shadow-md">
        <div className="text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  if (!cheapestDates || cheapestDates.length === 0) {
    return null;
  }
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="my-4 p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3">Cheapest Travel Date Options</h3>
      <div className="overflow-x-auto">
        <div className="flex space-x-3 pb-2">
          {cheapestDates.map((dateOption, index) => (
            <div 
              key={index}
              className="flex-shrink-0 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
              style={{ minWidth: '180px' }}
              onClick={() => onSelectDates(dateOption)}
            >
              <div className="font-medium text-sm text-gray-900">
                {formatDate(dateOption.departureDate)} - {formatDate(dateOption.returnDate)}
              </div>
              <div className="mt-1 text-lg font-bold text-primary">
                ${parseInt(dateOption.price.amount).toFixed(2)}
              </div>
              <button 
                className="mt-2 text-xs py-1 px-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors w-full"
              >
                Select Dates
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CheapestTravelDates;