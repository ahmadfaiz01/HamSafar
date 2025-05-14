import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItineraryById, updateItinerary } from '../services/itineraryService';
import '../styles/CreateItinerary.css'; // Reusing the same styles

const EditItinerary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    totalBudget: '',
    travelPreferences: {
      travelStyle: 'standard',
      transportationPreference: 'public',
      activityLevel: 'moderate',
      accommodationType: 'hotel'
    }
  });

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        setLoading(true);
        const itinerary = await getItineraryById(id);
        
        // Format dates for form input
        const startDate = new Date(itinerary.startDate).toISOString().split('T')[0];
        const endDate = new Date(itinerary.endDate).toISOString().split('T')[0];
        
        setFormData({
          title: itinerary.title || '',
          startDate,
          endDate,
          totalBudget: itinerary.totalBudget || '',
          travelPreferences: itinerary.travelPreferences || {
            travelStyle: 'standard',
            transportationPreference: 'public',
            activityLevel: 'moderate',
            accommodationType: 'hotel'
          }
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching itinerary:', err);
        setError('Failed to load itinerary details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItinerary();
    }
  }, [id]);

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

  // Submit the form to update itinerary
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validation
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
      
      setSaving(true);
      await updateItinerary(id, formData);
      navigate(`/itinerary/${id}`);
    } catch (err) {
      console.error('Error updating itinerary:', err);
      setError('Failed to update itinerary. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading itinerary details...</p>
      </div>
    );
  }

  return (
    <div className="create-itinerary-container">
      <div className="create-itinerary-header">
        <h1>Edit Itinerary</h1>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form className="create-itinerary-form" onSubmit={handleSubmit}>
        <div className="form-step">
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
              onClick={() => navigate(`/itinerary/${id}`)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="create-btn"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditItinerary;
