import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiDollarSign, FiPlus } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from '../../context/AuthContext';
import { getDestinations } from '../../services/tripService';
import { createTrip } from '../../services/tripService';
import '../../styles/CreateTripForm.css';

const CATEGORIES = [
  { value: 'adventure', label: 'Adventure' },
  { value: 'beach', label: 'Beach' },
  { value: 'city', label: 'City Tour' },
  { value: 'culture', label: 'Cultural' },
  { value: 'food', label: 'Food & Drink' },
  { value: 'nature', label: 'Nature' },
  { value: 'relaxation', label: 'Relaxation' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'skiing', label: 'Skiing/Winter' },
  { value: 'business', label: 'Business' },
  { value: 'family', label: 'Family' }
];

const CreateTripForm = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [tripData, setTripData] = useState({
    title: '',
    destination: {
      city: '',
      country: ''
    },
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days from today
    totalBudget: '',
    categories: [],
    notes: ''
  });
  
  // Get destinations for autocomplete
  useEffect(() => {
    const loadDestinations = async () => {
      try {
        const data = await getDestinations();
        setDestinations(data);
      } catch (error) {
        console.error('Error loading destinations:', error);
      }
    };
    
    loadDestinations();
  }, []);
  
  // Calculate trip duration
  const getDuration = () => {
    const diffTime = Math.abs(tripData.endDate - tripData.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setTripData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setTripData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleCategoryToggle = (category) => {
    const newCategories = [...tripData.categories];
    
    if (newCategories.includes(category)) {
      // Remove category if already selected
      const index = newCategories.indexOf(category);
      newCategories.splice(index, 1);
    } else {
      // Add category if not selected
      newCategories.push(category);
    }
    
    setTripData({
      ...tripData,
      categories: newCategories
    });
  };
  
  const handleStartDateChange = (date) => {
    setTripData({
      ...tripData,
      startDate: date,
      // If new start date is after end date, adjust end date
      endDate: date > tripData.endDate ? new Date(date.getTime() + 24 * 60 * 60 * 1000) : tripData.endDate
    });
  };
  
  const handleEndDateChange = (date) => {
    setTripData({
      ...tripData,
      endDate: date
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setErrorMsg('You must be logged in to create a trip');
      return;
    }
    
    if (!tripData.title || !tripData.destination.city || !tripData.destination.country) {
      setErrorMsg('Please fill in all required fields');
      return;
    }
    
    if (tripData.startDate > tripData.endDate) {
      setErrorMsg('End date must be after start date');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    
    try {
      // Create empty days for the trip
      const duration = getDuration();
      const days = [];
      
      for (let i = 0; i < duration; i++) {
        days.push({
          day: i + 1,
          activities: []
        });
      }
      
      // Create trip in backend
      const newTrip = await createTrip({
        userId: currentUser.uid,
        ...tripData,
        days
      });
      
      setSuccessMsg('Trip created successfully!');
      
      // Redirect to trip detail page
      setTimeout(() => {
        navigate(`/trips/${newTrip._id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error creating trip:', error);
      setErrorMsg('Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="create-trip-container">
      <h2>Plan a New Trip</h2>
      
      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      
      <form className="create-trip-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Trip Name</label>
          <input
            type="text"
            id="title"
            name="title"
            value={tripData.title}
            onChange={handleInputChange}
            placeholder="e.g., Summer Vacation 2023"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="destination.city">Destination</label>
          <div className="destination-inputs">
            <div className="city-input">
              <FiMapPin className="input-icon" />
              <input
                type="text"
                id="destination.city"
                name="destination.city"
                value={tripData.destination.city}
                onChange={handleInputChange}
                placeholder="City"
                list="cities"
                required
              />
              <datalist id="cities">
                {destinations.map((dest, index) => (
                  <option key={index} value={dest.city} />
                ))}
              </datalist>
            </div>
            
            <div className="country-input">
              <input
                type="text"
                id="destination.country"
                name="destination.country"
                value={tripData.destination.country}
                onChange={handleInputChange}
                placeholder="Country"
                list="countries"
                required
              />
              <datalist id="countries">
                {destinations.map((dest, index) => (
                  <option key={index} value={dest.country} />
                ))}
              </datalist>
            </div>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Start Date</label>
            <div className="date-picker-container">
              <FiCalendar className="input-icon" />
              <DatePicker
                selected={tripData.startDate}
                onChange={handleStartDateChange}
                selectsStart
                startDate={tripData.startDate}
                endDate={tripData.endDate}
                minDate={new Date()}
                className="date-picker"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>End Date</label>
            <div className="date-picker-container">
              <FiCalendar className="input-icon" />
              <DatePicker
                selected={tripData.endDate}
                onChange={handleEndDateChange}
                selectsEnd
                startDate={tripData.startDate}
                endDate={tripData.endDate}
                minDate={tripData.startDate}
                className="date-picker"
              />
            </div>
          </div>
        </div>
        
        <div className="trip-duration">
          Duration: <strong>{getDuration()} days</strong>
        </div>
        
        <div className="form-group">
          <label htmlFor="totalBudget">Budget (USD)</label>
          <div className="budget-input">
            <FiDollarSign className="input-icon" />
            <input
              type="number"
              id="totalBudget"
              name="totalBudget"
              value={tripData.totalBudget}
              onChange={handleInputChange}
              placeholder="Enter your budget"
              min="0"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Trip Categories</label>
          <div className="categories-container">
            {CATEGORIES.map(category => (
              <div
                key={category.value}
                className={`category-chip ${tripData.categories.includes(category.value) ? 'active' : ''}`}
                onClick={() => handleCategoryToggle(category.value)}
              >
                {category.label}
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={tripData.notes}
            onChange={handleInputChange}
            placeholder="Add any additional notes about your trip"
            rows="3"
          />
        </div>
        
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/trips')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Trip'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTripForm;