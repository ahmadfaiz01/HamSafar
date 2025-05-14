import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserPreferences, updateUserPreferences } from '../services/recommendationApi';
import '../styles/PreferencesPage.css';

const PreferencesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [preferences, setPreferences] = useState({
    travelStyles: [],
    activities: [],
    budgetRange: 'moderate',
    preferredSeasons: [],
    tripDuration: 'week',
    destinationTypes: []
  });

  // Available options for each preference category
  const options = {
    travelStyles: ['adventure', 'relaxation', 'cultural', 'family', 'budget', 'luxury'],
    activities: ['hiking', 'swimming', 'sightseeing', 'shopping', 'food', 'photography', 'wildlife'],
    budgetRanges: ['budget', 'moderate', 'luxury'],
    seasons: ['spring', 'summer', 'autumn', 'winter'],
    durations: ['weekend', 'week', 'twoWeeks', 'month'],
    destinationTypes: ['beach', 'mountain', 'city', 'historical', 'rural']
  };

  useEffect(() => {
    const fetchPreferences = async () => {
      setLoading(true);
      try {
        const data = await getUserPreferences();
        if (data) {
          setPreferences(data);
        }
      } catch (err) {
        console.error('Error loading preferences:', err);
        setMessage({
          text: 'Failed to load your preferences. You can still create new ones.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleCheckboxChange = (e, category) => {
    const { value, checked } = e.target;
    
    setPreferences(prev => ({
      ...prev,
      [category]: checked
        ? [...prev[category], value]
        : prev[category].filter(item => item !== value)
    }));
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    
    try {
      await updateUserPreferences(preferences);
      setMessage({
        text: 'Your preferences have been saved successfully!',
        type: 'success'
      });
      
      // Navigate to recommendations page after short delay
      setTimeout(() => {
        navigate('/recommendations');
      }, 1500);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setMessage({
        text: 'Failed to save your preferences. Please try again.',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="preferences-loading">
        <div className="spinner"></div>
        <p>Loading your preferences...</p>
      </div>
    );
  }

  return (
    <div className="preferences-container">
      <div className="preferences-header">
        <h1>Your Travel Preferences</h1>
        <p>Tell us what you like so we can recommend destinations that match your interests.</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="preferences-form">
        <div className="preference-section">
          <h2>Travel Styles</h2>
          <p>What kind of travel experience do you prefer?</p>
          <div className="options-grid">
            {options.travelStyles.map(style => (
              <label key={style} className="option-checkbox">
                <input
                  type="checkbox"
                  value={style}
                  checked={preferences.travelStyles.includes(style)}
                  onChange={(e) => handleCheckboxChange(e, 'travelStyles')}
                />
                <span className="checkbox-label">{style.charAt(0).toUpperCase() + style.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="preference-section">
          <h2>Activities</h2>
          <p>What activities do you enjoy while traveling?</p>
          <div className="options-grid">
            {options.activities.map(activity => (
              <label key={activity} className="option-checkbox">
                <input
                  type="checkbox"
                  value={activity}
                  checked={preferences.activities.includes(activity)}
                  onChange={(e) => handleCheckboxChange(e, 'activities')}
                />
                <span className="checkbox-label">{activity.charAt(0).toUpperCase() + activity.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="preference-section">
          <h2>Budget Range</h2>
          <p>What's your typical travel budget?</p>
          <div className="options-grid">
            {options.budgetRanges.map(budget => (
              <label key={budget} className="option-radio">
                <input
                  type="radio"
                  name="budgetRange"
                  value={budget}
                  checked={preferences.budgetRange === budget}
                  onChange={handleRadioChange}
                />
                <span className="radio-label">{budget.charAt(0).toUpperCase() + budget.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="preference-section">
          <h2>Preferred Seasons</h2>
          <p>When do you prefer to travel?</p>
          <div className="options-grid">
            {options.seasons.map(season => (
              <label key={season} className="option-checkbox">
                <input
                  type="checkbox"
                  value={season}
                  checked={preferences.preferredSeasons.includes(season)}
                  onChange={(e) => handleCheckboxChange(e, 'preferredSeasons')}
                />
                <span className="checkbox-label">{season.charAt(0).toUpperCase() + season.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="preference-section">
          <h2>Trip Duration</h2>
          <p>How long are your typical trips?</p>
          <div className="options-grid">
            {options.durations.map(duration => (
              <label key={duration} className="option-radio">
                <input
                  type="radio"
                  name="tripDuration"
                  value={duration}
                  checked={preferences.tripDuration === duration}
                  onChange={handleRadioChange}
                />
                <span className="radio-label">
                  {duration === 'weekend' ? 'Weekend (1-3 days)' :
                   duration === 'week' ? 'Week (4-7 days)' :
                   duration === 'twoWeeks' ? 'Two Weeks (8-14 days)' :
                   'Month or longer'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="preference-section">
          <h2>Destination Types</h2>
          <p>What kinds of destinations interest you?</p>
          <div className="options-grid">
            {options.destinationTypes.map(type => (
              <label key={type} className="option-checkbox">
                <input
                  type="checkbox"
                  value={type}
                  checked={preferences.destinationTypes.includes(type)}
                  onChange={(e) => handleCheckboxChange(e, 'destinationTypes')}
                />
                <span className="checkbox-label">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="save-button"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigate('/recommendations')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PreferencesPage;
