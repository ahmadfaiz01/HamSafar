import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItinerary, getRecommendedDestinations } from '../services/itineraryService';
import '../styles/CreateItinerary.css';

const CreateItinerary = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendedDestinations, setRecommendedDestinations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    totalBudget: '',
    destinations: [],
    travelPreferences: {
      travelStyle: 'standard',
      transportationPreference: 'public',
      activityLevel: 'moderate',
      accommodationType: 'hotel'
    }
  });

  // Handle basic input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle preference changes
  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      travelPreferences: {
        ...formData.travelPreferences,
        [name]: value
      }
    });
  };

  // Get destination recommendations
  const getDestinationRecommendations = async () => {
    try {
      setLoading(true);
      
      // Extract start and end dates to calculate duration
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const diffTime = Math.abs(endDate - startDate);
      const tripDuration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      // Prepare preferences for recommendation
      const preferences = {
        budget: formData.travelPreferences.travelStyle,
        tripDuration,
        interests: ['beach', 'mountain', 'city'] // Default interests
      };
      
      const destinations = await getRecommendedDestinations(preferences);
      setRecommendedDestinations(destinations);
      setShowRecommendations(true);
      setError(null);
    } catch (err) {
      console.error('Error getting recommendations:', err);
      setError('Failed to get destination recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add destination to itinerary
  const addDestination = (destination) => {
    // Check if destination is already added
    if (formData.destinations.some(d => d.destinationId === destination._id)) {
      return;
    }
    
    // Add destination to the list
    setFormData({
      ...formData,
      destinations: [
        ...formData.destinations,
        {
          destinationId: destination._id,
          name: destination.name,
          location: destination.location.province,
          order: formData.destinations.length + 1
        }
      ]
    });
  };

  // Remove destination from itinerary
  const removeDestination = (index) => {
    const newDestinations = [...formData.destinations];
    newDestinations.splice(index, 1);
    
    // Update order for remaining destinations
    const updatedDestinations = newDestinations.map((dest, idx) => ({
      ...dest,
      order: idx + 1
    }));
    
    setFormData({
      ...formData,
      destinations: updatedDestinations
    });
  };

  // Move to next step
  const nextStep = () => {
    if (step === 1) {
      // Validate basic details
      if (!formData.title || !formData.startDate || !formData.endDate || !formData.totalBudget) {
        setError('Please fill in all required fields.');
        return;
      }
      
      // Validate dates
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate < startDate) {
        setError('End date cannot be before start date.');
        return;
      }
      
      // Validate budget
      if (parseInt(formData.totalBudget) <= 0) {
        setError('Budget must be greater than zero.');
        return;
      }
    }
    
    if (step === 2) {
      // Validate destinations
      if (formData.destinations.length === 0) {
        setError('Please add at least one destination.');
        return;
      }
    }
    
    setError(null);
    setStep(step + 1);
  };

  // Go back to previous step
  const prevStep = () => {
    setStep(step - 1);
  };

  // Submit the form to create itinerary
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Create the itinerary
      const itinerary = await createItinerary(formData);
      
      // Navigate to the new itinerary
      navigate(`/itinerary/${itinerary._id}`);
    } catch (err) {
      console.error('Error creating itinerary:', err);
      setError('Failed to create itinerary. Please try again.');
      setLoading(false);
    }
  };

  // Render step 1 - Basic Details
  const renderStep1 = () => (
    <div className="form-step">
      <h2>Basic Details</h2>
      <div className="form-group">
        <label>Itinerary Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="E.g., Northern Pakistan Adventure"
          required
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      
      <div className="form-group">
        <label>Total Budget (PKR)</label>
        <input
          type="number"
          name="totalBudget"
          value={formData.totalBudget}
          onChange={handleInputChange}
          placeholder="Enter your total budget in PKR"
          min="1"
          required
        />
      </div>
      
      <div className="form-actions">
        <button
          type="button"
          className="next-btn"
          onClick={nextStep}
        >
          Next: Add Destinations
        </button>
      </div>
    </div>
  );

  // Render step 2 - Add Destinations
  const renderStep2 = () => (
    <div className="form-step">
      <h2>Add Destinations</h2>
      
      <div className="selected-destinations">
        <h3>Your Selected Destinations</h3>
        {formData.destinations.length === 0 ? (
          <p className="no-destinations">No destinations added yet. Use the recommendations below to add destinations.</p>
        ) : (
          <div className="destinations-list">
            {formData.destinations.map((dest, index) => (
              <div key={index} className="selected-destination-item">
                <span className="destination-order">{index + 1}</span>
                <span className="destination-name">{dest.name}</span>
                <span className="destination-location">{dest.location}</span>
                <button
                  type="button"
                  className="remove-destination-btn"
                  onClick={() => removeDestination(index)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="recommendations-section">
        <div className="recommendations-header">
          <h3>Recommended Destinations</h3>
          <button
            type="button"
            className="get-recommendations-btn"
            onClick={getDestinationRecommendations}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Get Recommendations'}
          </button>
        </div>
        
        {showRecommendations && (
          <div className="recommendations-grid">
            {recommendedDestinations.length === 0 ? (
              <p>No recommendations found. Try adjusting your preferences.</p>
            ) : (
              recommendedDestinations.map(destination => (
                <div
                  key={destination._id}
                  className="recommendation-card"
                  onClick={() => addDestination(destination)}
                >
                  <div className="recommendation-image">
                    <img 
                      src={destination.images && destination.images.length > 0 
                        ? destination.images[0] 
                        : `https://via.placeholder.com/300x200?text=${destination.name}`} 
                      alt={destination.name} 
                    />
                  </div>
                  <div className="recommendation-details">
                    <h4>{destination.name}</h4>
                    <p>{destination.location.province}</p>
                    <div className="recommendation-categories">
                      {destination.categories && destination.categories.map(category => (
                        <span key={category} className={`category-tag ${category}`}>{category}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      <div className="form-actions">
        <button
          type="button"
          className="back-btn"
          onClick={prevStep}
        >
          Back
        </button>
        <button
          type="button"
          className="next-btn"
          onClick={nextStep}
        >
          Next: Travel Preferences
        </button>
      </div>
    </div>
  );

  // Render step 3 - Travel Preferences
  const renderStep3 = () => (
    <div className="form-step">
      <h2>Travel Preferences</h2>
      <p className="preferences-intro">These preferences help our AI generate better recommendations for your itinerary.</p>
      
      <div className="form-group">
        <label>Travel Style</label>
        <select
          name="travelStyle"
          value={formData.travelPreferences.travelStyle}
          onChange={handlePreferenceChange}
        >
          <option value="budget">Budget-friendly</option>
          <option value="standard">Standard</option>
          <option value="luxury">Luxury</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>Transportation Preference</label>
        <select
          name="transportationPreference"
          value={formData.travelPreferences.transportationPreference}
          onChange={handlePreferenceChange}
        >
          <option value="public">Public Transportation</option>
          <option value="rental">Rental Car</option>
          <option value="private">Private Transportation</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>Activity Level</label>
        <select
          name="activityLevel"
          value={formData.travelPreferences.activityLevel}
          onChange={handlePreferenceChange}
        >
          <option value="relaxed">Relaxed (minimal physical activity)</option>
          <option value="moderate">Moderate (some walking and activities)</option>
          <option value="active">Active (hiking, adventure activities)</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>Accommodation Type</label>
        <select
          name="accommodationType"
          value={formData.travelPreferences.accommodationType}
          onChange={handlePreferenceChange}
        >
          <option value="hotel">Hotels</option>
          <option value="hostel">Hostels</option>
          <option value="resort">Resorts</option>
          <option value="guesthouse">Guesthouses</option>
          <option value="camping">Camping</option>
        </select>
      </div>
      
      <div className="form-actions">
        <button
          type="button"
          className="back-btn"
          onClick={prevStep}
        >
          Back
        </button>
        <button
          type="submit"
          className="create-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Itinerary'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="create-itinerary-container">
      <div className="create-itinerary-header">
        <h1>Create New Itinerary</h1>
        <div className="steps-indicator">
          <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Basic Details</div>
          </div>
          <div className="step-line"></div>
          <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Destinations</div>
          </div>
          <div className="step-line"></div>
          <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Preferences</div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form className="create-itinerary-form">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </form>
    </div>
  );
};

export default CreateItinerary;
