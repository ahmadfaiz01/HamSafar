import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import tripService from '../../services/tripService';
import './TripPlanner.css';

const TripPlanner = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Trip state
  const [tripData, setTripData] = useState({
    name: '',
    destination: '',
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    description: '',
    budget: 0,
    interests: [],
    isPublic: false
  });
  
  // Itinerary state
  const [itinerary, setItinerary] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const availableInterests = [
    'sightseeing', 'food', 'museums', 'shopping', 'nature', 'sports', 
    'history', 'art', 'beaches', 'hiking', 'nightlife', 'photography'
  ];
  
  // Calculate trip duration - Move outside of component or memoize
  const calculateDays = useCallback(() => {
    if (!tripData.startDate || !tripData.endDate) return 0;
    const diffTime = Math.abs(tripData.endDate - tripData.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include start day
  }, [tripData.startDate, tripData.endDate]);
  
  // Initialize itinerary when dates change
  useEffect(() => {
    const days = calculateDays();
    if (days > 0) {
      // Create empty itinerary for each day
      const newItinerary = Array(days).fill().map((_, index) => {
        const date = new Date(tripData.startDate);
        date.setDate(date.getDate() + index);
        
        return {
          day: index + 1,
          date: date,
          activities: []
        };
      });
      
      setItinerary(newItinerary);
    }
  }, [tripData.startDate, tripData.endDate, calculateDays]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTripData({
      ...tripData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle start date change
  const handleStartDateChange = (date) => {
    setTripData({
      ...tripData,
      startDate: date,
      // If new start date is after current end date, update end date
      endDate: date > tripData.endDate ? date : tripData.endDate
    });
  };
  
  // Handle end date change
  const handleEndDateChange = (date) => {
    setTripData({
      ...tripData,
      endDate: date
    });
  };
  
  // Handle interest selection
  const handleInterestToggle = (interest) => {
    setTripData(prev => {
      if (prev.interests.includes(interest)) {
        return {
          ...prev,
          interests: prev.interests.filter(i => i !== interest)
        };
      } else {
        return {
          ...prev,
          interests: [...prev.interests, interest]
        };
      }
    });
  };
  
  // Add activity to a day
  const handleAddActivity = (dayIndex) => {
    const newItinerary = [...itinerary];
    newItinerary[dayIndex].activities.push({
      id: Date.now(), // Temporary ID
      title: '',
      description: '',
      time: '',
      location: '',
      cost: 0
    });
    setItinerary(newItinerary);
  };
  
  // Update activity
  const handleActivityChange = (dayIndex, activityIndex, field, value) => {
    const newItinerary = [...itinerary];
    newItinerary[dayIndex].activities[activityIndex][field] = value;
    setItinerary(newItinerary);
  };
  
  // Remove activity
  const handleRemoveActivity = (dayIndex, activityIndex) => {
    const newItinerary = [...itinerary];
    newItinerary[dayIndex].activities.splice(activityIndex, 1);
    setItinerary(newItinerary);
  };
  
  // Save trip
  const handleSaveTrip = async () => {
    if (!tripData.name || !tripData.destination) {
      setError('Trip name and destination are required');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const tripPayload = {
        ...tripData,
        startDate: tripData.startDate.toISOString(),
        endDate: tripData.endDate.toISOString(),
        itinerary: itinerary.map(day => ({
          ...day,
          date: day.date.toISOString()
        })),
        userId: currentUser?.uid
      };
      
      const savedTrip = await tripService.createTrip(tripPayload);
      
      // Navigate to the trip detail page
      navigate(`/trips/${savedTrip._id}`);
    } catch (err) {
      console.error('Error saving trip:', err);
      setError('Failed to save trip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get recommendations for activities based on user interests
  const handleGetRecommendations = async (dayIndex) => {
    try {
      setIsLoading(true);
      
      const recommendations = await tripService.getActivityRecommendations({
        destination: tripData.destination,
        interests: tripData.interests,
        date: itinerary[dayIndex].date.toISOString()
      });
      
      // Add recommendations to the day
      const newItinerary = [...itinerary];
      recommendations.forEach(rec => {
        newItinerary[dayIndex].activities.push({
          id: Date.now() + Math.random(),
          title: rec.title,
          description: rec.description,
          time: rec.time || '',
          location: rec.location || '',
          cost: rec.cost || 0
        });
      });
      
      setItinerary(newItinerary);
    } catch (err) {
      console.error('Error getting recommendations:', err);
      setError('Failed to get recommendations');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="trip-planner-container">
      <h2 className="mb-4">Plan Your Trip</h2>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title">Trip Details</h3>
          
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="tripName" className="form-label">Trip Name</label>
              <input
                type="text"
                className="form-control"
                id="tripName"
                name="name"
                value={tripData.name}
                onChange={handleInputChange}
                placeholder="e.g., Summer Vacation 2023"
                required
              />
            </div>
            
            <div className="col-md-6">
              <label htmlFor="destination" className="form-label">Destination</label>
              <input
                type="text"
                className="form-control"
                id="destination"
                name="destination"
                value={tripData.destination}
                onChange={handleInputChange}
                placeholder="e.g., Paris, France"
                required
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Start Date</label>
              <DatePicker
                selected={tripData.startDate}
                onChange={handleStartDateChange}
                className="form-control"
                minDate={new Date()}
                required
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label">End Date</label>
              <DatePicker
                selected={tripData.endDate}
                onChange={handleEndDateChange}
                className="form-control"
                minDate={tripData.startDate}
                required
              />
            </div>
            
            <div className="col-12">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={tripData.description}
                onChange={handleInputChange}
                placeholder="What's this trip about?"
                rows="3"
              ></textarea>
            </div>
            
            <div className="col-md-6">
              <label htmlFor="budget" className="form-label">Budget (USD)</label>
              <input
                type="number"
                className="form-control"
                id="budget"
                name="budget"
                value={tripData.budget}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            
            <div className="col-md-6 d-flex align-items-end">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={tripData.isPublic}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="isPublic">
                  Make this trip public (share with community)
                </label>
              </div>
            </div>
            
            <div className="col-12">
              <label className="form-label">Interests (helps with recommendations)</label>
              <div className="interests-container">
                {availableInterests.map(interest => (
                  <div key={interest} className="interest-badge">
                    <input
                      type="checkbox"
                      id={`interest-${interest}`}
                      checked={tripData.interests.includes(interest)}
                      onChange={() => handleInterestToggle(interest)}
                      className="interest-checkbox"
                    />
                    <label
                      htmlFor={`interest-${interest}`}
                      className={`interest-label ${tripData.interests.includes(interest) ? 'selected' : ''}`}
                    >
                      {interest}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <h3 className="mb-3">Itinerary</h3>
      <div className="itinerary-container">
        {itinerary.map((day, dayIndex) => (
          <div key={day.day} className="card mb-3 day-card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                Day {day.day} - {day.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </h5>
              <div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => handleGetRecommendations(dayIndex)}
                  disabled={!tripData.destination || tripData.interests.length === 0}
                >
                  <i className="fas fa-magic me-1"></i> Get Suggestions
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => handleAddActivity(dayIndex)}
                >
                  <i className="fas fa-plus me-1"></i> Add Activity
                </button>
              </div>
            </div>
            <div className="card-body">
              {day.activities.length === 0 ? (
                <p className="text-muted">No activities planned for this day. Add some!</p>
              ) : (
                <div className="activity-timeline">
                  {day.activities.map((activity, actIndex) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-form">
                        <div className="row g-3">
                          <div className="col-md-3">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Time"
                              value={activity.time}
                              onChange={(e) => handleActivityChange(dayIndex, actIndex, 'time', e.target.value)}
                            />
                          </div>
                          <div className="col-md-9">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Activity Title"
                              value={activity.title}
                              onChange={(e) => handleActivityChange(dayIndex, actIndex, 'title', e.target.value)}
                            />
                          </div>
                          <div className="col-md-12">
                            <textarea
                              className="form-control form-control-sm"
                              placeholder="Description"
                              value={activity.description}
                              onChange={(e) => handleActivityChange(dayIndex, actIndex, 'description', e.target.value)}
                              rows="2"
                            ></textarea>
                          </div>
                          <div className="col-md-8">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Location"
                              value={activity.location}
                              onChange={(e) => handleActivityChange(dayIndex, actIndex, 'location', e.target.value)}
                            />
                          </div>
                          <div className="col-md-3">
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="Cost"
                              value={activity.cost}
                              onChange={(e) => handleActivityChange(dayIndex, actIndex, 'cost', e.target.value)}
                              min="0"
                            />
                          </div>
                          <div className="col-md-1 d-flex align-items-center">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemoveActivity(dayIndex, actIndex)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="d-flex justify-content-end mt-4">
        <button
          type="button"
          className="btn btn-secondary me-2"
          onClick={() => navigate('/dashboard')}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSaveTrip}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            <>Save Trip</>
          )}
        </button>
      </div>
    </div>
  );
};

export default TripPlanner;
