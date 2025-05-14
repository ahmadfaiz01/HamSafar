import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createItinerary } from '../services/itineraryService';
import { generateItinerary } from '../services/geminiService';
import './CreateItinerary.css';

const CreateItinerary = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    tripName: '',
    source: '',
    destination: '',
    numberOfDays: 3,
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'numberOfDays' ? parseInt(value) : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      navigate('/login', { state: { from: '/itinerary/create' } });
      return;
    }
    
    const { tripName, source, destination, numberOfDays, notes } = formData;
    
    if (!tripName || !source || !destination) {
      setError('Trip name, source, and destination are required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Generate AI itinerary
      const generatedItinerary = await generateItinerary(source, destination, numberOfDays, notes);
      
      // Create the itinerary in the database
      const newItinerary = await createItinerary(currentUser.uid, {
        ...formData,
        ...generatedItinerary
      });
      
      setLoading(false);
      
      // Navigate to the new itinerary's details page
      navigate(`/itinerary/${newItinerary.id}`);
    } catch (err) {
      console.error('Error creating itinerary:', err);
      setError('Failed to create itinerary. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <div className="create-itinerary-container">
      <h1 className="page-title">Create New Itinerary</h1>
      
      <form onSubmit={handleSubmit} className="create-itinerary-form">
        <div className="form-group">
          <label htmlFor="tripName">Trip Name</label>
          <input
            type="text"
            id="tripName"
            name="tripName"
            value={formData.tripName}
            onChange={handleChange}
            placeholder="My Amazing Trip"
            required
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="source">Starting From</label>
            <input
              type="text"
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              placeholder="City or Location"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="destination">Going To</label>
            <input
              type="text"
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="City or Location"
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="numberOfDays">Duration (Days)</label>
          <input
            type="number"
            id="numberOfDays"
            name="numberOfDays"
            value={formData.numberOfDays}
            onChange={handleChange}
            min="1"
            max="30"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="notes">Additional Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Preferences, budget, interests, etc."
            rows="4"
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          type="submit" 
          className="create-btn"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Itinerary'}
        </button>
      </form>
    </div>
  );
};

export default CreateItinerary;
