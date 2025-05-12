import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import "react-datepicker/dist/react-datepicker.css";
import './ItineraryPlanner.css';

const ItineraryPlanner = () => {
  const { currentUser } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 3)));
  const [budget, setBudget] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch available destinations (cities)
    const fetchDestinations = async () => {
      try {
        const res = await api.get('/api/hotels/cities');
        if (res.data.success) {
          setDestinations(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching destinations:', err);
        setError('Failed to load destinations');
      }
    };
    
    fetchDestinations();
  }, []);
  
  // Calculate night count
  const getNightCount = () => {
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Please log in to create a trip');
      navigate('/login');
      return;
    }
    
    try {
      setLoading(true);
      
      const tripData = {
        title,
        description,
        destination,
        startDate,
        endDate,
        budget: budget ? parseFloat(budget) : 0
      };
      
      const res = await api.post('/api/trips', tripData);
      
      toast.success('Trip created successfully!');
      navigate(`/trips/${res.data.data._id}`);
    } catch (err) {
      console.error('Error creating trip:', err);
      setError(err.response?.data?.message || 'Failed to create trip');
      toast.error(err.response?.data?.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="itinerary-planner">
      <div className="itinerary-header">
        <h2>Plan Your Trip</h2>
        <p>Create a new itinerary for your upcoming adventure</p>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit} className="itinerary-form">
        <div className="form-group">
          <label>Trip Title*</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Summer Vacation 2025"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this trip about?"
            rows="2"
          />
        </div>
        
        <div className="form-group">
          <label>Destination*</label>
          <select
            className="form-control"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          >
            <option value="">Select a destination</option>
            {destinations.map((city, index) => (
              <option key={index} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>Start Date*</label>
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                minDate={new Date()}
                className="form-control"
                dateFormat="MMMM d, yyyy"
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>End Date*</label>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                className="form-control"
                dateFormat="MMMM d, yyyy"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label>Budget (Rs.)</label>
          <input
            type="number"
            className="form-control"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Optional budget for your trip"
            min="0"
          />
        </div>
        
        <div className="trip-summary">
          <h4>Trip Summary</h4>
          <div className="summary-details">
            <div className="summary-item">
              <span className="summary-label">Duration:</span>
              <span className="summary-value">{getNightCount()} nights</span>
            </div>
            {budget && (
              <div className="summary-item">
                <span className="summary-label">Budget:</span>
                <span className="summary-value">Rs. {parseFloat(budget).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating...</>
            ) : (
              'Create Trip'
            )}
          </button>
          <button 
            type="button" 
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItineraryPlanner;