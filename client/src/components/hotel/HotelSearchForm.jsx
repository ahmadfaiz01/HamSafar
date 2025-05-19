import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const HotelSearchForm = ({
  destination,
  setDestination,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  rooms,
  setRooms,
  adults,
  setAdults,
  children,
  setChildren,
  locations,
  loading,
  handleSearch
}) => {
  // Handle form submission
  const onSubmit = (e) => {
    e.preventDefault();
    
    handleSearch({
      destination,
      checkIn,
      checkOut,
      rooms,
      adults,
      children
    });
  };

  return (
    <div className="hotel-search-form-container">
      <form className="hotel-search-form" onSubmit={onSubmit}>
        <div className="search-group destination-group">
          <label htmlFor="destination" style={{ color: 'white'}}>
            <i className="fas fa-map-marker-alt"></i>
            Where in Pakistan?
          </label>
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Enter a city in Pakistan"
            list="destinations"
            className="form-control"
            disabled={loading}
          />
          <datalist id="destinations">
            {locations.map((city, index) => (
              <option key={index} value={city.name || city} />
            ))}
          </datalist>
        </div>
        
        <div className="search-group date-group">
          <label style={{ color: 'white'}}>
            <i className="fas fa-calendar"></i>
            Check-in
          </label>
          <DatePicker
            selected={checkIn}
            onChange={(date) => setCheckIn(date)}
            selectsStart
            startDate={checkIn}
            endDate={checkOut}
            minDate={new Date()}
            className="form-control"
            disabled={loading}
          />
        </div>
        
        <div className="search-group date-group">
          <label style={{ color: 'white'}}>
            <i className="fas fa-calendar"></i>
            Check-out
          </label>
          <DatePicker
            selected={checkOut}
            onChange={(date) => setCheckOut(date)}
            selectsEnd
            startDate={checkIn}
            endDate={checkOut}
            minDate={new Date(checkIn.getTime() + 86400000)} // +1 day
            className="form-control"
            disabled={loading}
          />
        </div>
        
        <div className="search-group guests-group">
          <label style={{ color: 'white'}}>
            <i className="fas fa-user-friends"></i>
            Guests & Rooms
          </label>
          <div className="guest-dropdown">
            <button 
              type="button" 
              className="guest-dropdown-btn form-control"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              disabled={loading}
            >
              {adults} adults  · {rooms} room{rooms > 1 ? 's' : ''}
            </button>
            
            <div className="dropdown-menu p-3">
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <span>Adults</span>
                <div className="counter-control">
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setAdults(prev => Math.max(1, prev - 1))}
                    disabled={adults <= 1 || loading}
                  >-</button>
                  <span className="mx-2">{adults}</span>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setAdults(prev => prev + 1)}
                    disabled={loading}
                  >+</button>
                </div>
              </div>
              
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <span>Children</span>
                <div className="counter-control">
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setChildren(prev => Math.max(0, prev - 1))}
                    disabled={children <= 0 || loading}
                  >-</button>
                  <span className="mx-2">{children}</span>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setChildren(prev => prev + 1)}
                    disabled={loading}
                  >+</button>
                </div>
              </div>
              
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <span>Rooms</span>
                <div className="counter-control">
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setRooms(prev => Math.max(1, prev - 1))}
                    disabled={rooms <= 1 || loading}
                  >-</button>
                  <span className="mx-2">{rooms}</span>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setRooms(prev => prev + 1)}
                    disabled={loading}
                  >+</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <button type="submit" className="btn btn-primary search-btn" disabled={loading}>
          <i className="fas fa-search"></i> Search
          {loading && <span className="ms-2 spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
        </button>
      </form>
    </div>
  );
};

export default HotelSearchForm;