import React, { useState } from 'react';
import axios from 'axios';

const sources = [
  { code: 'Country:GB', name: 'United Kingdom' },
  { code: 'Country:US', name: 'United States' },
  { code: 'Country:FR', name: 'France' },
];

const destinations = [
  { code: 'City:dubrovnik_hr', name: 'Dubrovnik, Croatia' },
  { code: 'City:paris_fr', name: 'Paris, France' },
  { code: 'City:new-york_ny_us', name: 'New York, USA' },
];

function FlightSearch() {
  const [form, setForm] = useState({
    source: 'Country:GB',
    destination: 'City:dubrovnik_hr',
  });

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFlights([]);
    setError('');
    setLoading(true);

    const options = {
      method: 'GET',
      url: 'https://kiwi-com-cheap-flights.p.rapidapi.com/one-way',
      params: {
        source: form.source,
        destination: form.destination,
        currency: 'usd',
        locale: 'en',
        adults: '1',
        children: '0',
        infants: '0',
        handbags: '1',
        holdbags: '0',
        cabinClass: 'ECONOMY',
        sortBy: 'QUALITY',
        applyMixedClasses: 'true',
        allowChangeInboundDestination: 'true',
        allowChangeInboundSource: 'true',
        allowDifferentStationConnection: 'true',
        enableSelfTransfer: 'true',
        allowOvernightStopover: 'true',
        enableTrueHiddenCity: 'true',
        allowReturnToDifferentCity: 'false',
        allowReturnFromDifferentCity: 'false',
        enableThrowAwayTicketing: 'true',
        outbound: 'SUNDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY,MONDAY,TUESDAY',
        transportTypes: 'FLIGHT',
        contentProviders: 'FLIXBUS_DIRECTS,FRESH,KAYAK,KIWI',
        limit: '20'
      },
      headers: {
        'x-rapidapi-key': 'a0d80d9ecemshc73b7765d3728c7p10113fjsn8cb41f85170a',
        'x-rapidapi-host': 'kiwi-com-cheap-flights.p.rapidapi.com'
      }
    };

    try {
      const response = await axios.request(options);
      const data = response.data.flights || [];
      setFlights(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch flights.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Find Flights</h2>
      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-md-5">
          <label className="form-label">Source Country</label>
          <select name="source" value={form.source} onChange={handleChange} className="form-select">
            {sources.map((item) => (
              <option key={item.code} value={item.code}>{item.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-5">
          <label className="form-label">Destination City</label>
          <select name="destination" value={form.destination} onChange={handleChange} className="form-select">
            {destinations.map((item) => (
              <option key={item.code} value={item.code}>{item.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2 d-grid">
          <button type="submit" className="btn btn-primary">{loading ? 'Searching...' : 'Search'}</button>
        </div>
      </form>

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      {flights.length > 0 && (
        <div className="mt-4">
          <h4>Available Flights</h4>
          <div className="row">
            {flights.map((flight, idx) => (
              <div className="col-md-4" key={idx}>
                <div className="card mb-3 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">{flight.airline || 'Unknown Airline'}</h5>
                    <p className="card-text">
                      From: {flight.source_name} <br />
                      To: {flight.destination_name} <br />
                      Duration: {flight.duration} <br />
                      Price: {flight.price} {flight.currency}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FlightSearch;
