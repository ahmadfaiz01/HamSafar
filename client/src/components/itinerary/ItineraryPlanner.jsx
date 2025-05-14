import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { generateItinerary } from '../../services/geminiService';
import { saveItinerary } from '../../services/itineraryService';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import './ItineraryPlanner.css';

const ItineraryPlanner = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [numberOfDays, setNumberOfDays] = useState(3);
  const [notes, setNotes] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedItinerary, setGeneratedItinerary] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Navigation state
  const [currentDay, setCurrentDay] = useState(1);
  
  // Add a ref for the tips section
  const tipsRef = useRef(null);
  
  // Create a function to scroll to tips
  const scrollToTips = () => {
    tipsRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Please log in to create an itinerary');
      navigate('/login', { state: { from: '/itinerary-planner' } });
      return;
    }
    
    if (!title || !destination || !source || numberOfDays < 1) {
      setError('Please fill in all required fields');
      toast.error('All fields are required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Generate AI itinerary
      console.log('Generating itinerary...');
      const itineraryData = await generateItinerary(source, destination, numberOfDays, notes);
      console.log('Generated itinerary:', itineraryData);
      
      setGeneratedItinerary(itineraryData);
      setCurrentDay(1); // Start with day 1
      
      // Show different toast based on whether fallback content was used
      if (itineraryData.fallback) {
        toast.info('Created itinerary using offline data. Some AI features are temporarily unavailable.');
      } else {
        toast.success('Itinerary created successfully!');
      }
    } catch (err) {
      console.error('Error generating itinerary:', err);
      setError(`Failed to generate itinerary: ${err.message}`);
      toast.error('Could not create itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Update your handleSaveItinerary function
  const handleSaveItinerary = async () => {
    if (!currentUser) {
      toast.error('Please log in to save this itinerary');
      navigate('/login');
      return;
    }
    
    if (!generatedItinerary) {
      toast.error('No itinerary to save');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Use a simpler flat data structure for Firestore
      const tripData = {
        tripName: title || "Unnamed Trip",
        source: source || "",
        destination: destination || "",
        numberOfDays: Number(numberOfDays) || 1,
        notes: notes || "",
        
        // Store essential itinerary data
        dayPlans: generatedItinerary.dayPlans || [],
        
        // Store recommendations data
        dining: generatedItinerary.recommendations?.dining || [],
        attractions: generatedItinerary.recommendations?.attractions || [],
        shopping: generatedItinerary.recommendations?.shopping || [],
        transportation: generatedItinerary.recommendations?.transportation || [],
        
        // Store budget info
        estimatedBudget: generatedItinerary.estimatedBudget || ""
      };
      
      console.log('Saving itinerary with auto-collection creation...');
      const savedItinerary = await saveItinerary(currentUser.uid, tripData);
      console.log('Saved itinerary response:', savedItinerary);
      
      setIsSaved(true);
      toast.success('Itinerary saved to your wishlist!');
      
      // Navigate to the saved trips after a short delay
      setTimeout(() => {
        navigate('/profile/trips');
      }, 2000);
      
    } catch (err) {
      console.error('Error saving itinerary:', err);
      toast.error(`Could not save itinerary: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Generate a day summary from activities
  const generateDaySummary = (dayPlan) => {
    if (!dayPlan) return '';
    
    const activities = dayPlan.activities || [];
    const numActivities = activities.length;
    
    if (numActivities === 0) return 'No activities planned for this day.';
    
    // Get a list of the main highlights
    const highlights = activities
      .map(activity => activity.description)
      .filter(desc => !desc.toLowerCase().includes('breakfast') && 
                     !desc.toLowerCase().includes('lunch') && 
                     !desc.toLowerCase().includes('dinner') &&
                     !desc.toLowerCase().includes('check'))
      .slice(0, 3);
    
    return `On Day ${dayPlan.day}, you'll explore ${destination} with ${numActivities} planned activities. 
    Highlights include ${highlights.join(', ')}. You'll be staying at ${dayPlan.accommodation}.`;
  };

  // Scroll to top when current day changes
  useEffect(() => {
    if (generatedItinerary) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentDay]);

  // Return statement starts here
  return (
    <div className="itinerary-creator">
      <div className="itinerary-path">
        <span className="path-item">Home</span>
        <span className="path-separator">/</span>
        <span className="path-item active">Create Itinerary</span>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {!generatedItinerary ? (
        <div className="creator-card hover-card">
          <h2>Create Your Perfect Itinerary</h2>
          <p className="subtitle">Tell us about your trip and we'll plan everything for you</p>
          
          <form onSubmit={handleSubmit} className="creator-form">
            <div className="form-field">
              <label htmlFor="title">Trip Name*</label>
              <input
                type="text"
                id="title"
                className="input-field"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Dream Vacation"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="source">Starting From*</label>
                <input
                  type="text"
                  id="source"
                  className="input-field"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g., Islamabad"
                  required
                />
              </div>
              
              <div className="form-field">
                <label htmlFor="destination">Destination*</label>
                <input
                  type="text"
                  id="destination"
                  className="input-field"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g., Karachi"
                  required
                />
              </div>
            </div>
            
            <div className="form-field">
              <label htmlFor="numberOfDays">Number of Days*</label>
              <div className="days-selector">
                {[1, 2, 3, 5, 7, 10].map((days) => (
                  <button
                    key={days}
                    type="button"
                    className={`day-option ${numberOfDays === days ? 'active' : ''}`}
                    onClick={() => setNumberOfDays(days)}
                  >
                    {days}
                  </button>
                ))}
                <input
                  type="number"
                  id="numberOfDays"
                  className="input-field days-input"
                  value={numberOfDays}
                  onChange={(e) => setNumberOfDays(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max="30"
                />
              </div>
            </div>
            
            <div className="form-field">
              <label htmlFor="notes">Special Instructions (Optional)</label>
              <textarea
                id="notes"
                className="input-field textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any preferences, interests, or special requirements?"
                rows="3"
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-accent"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Itinerary'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="itinerary-result hover-card">
          <div className="result-header">
            <button 
              className="tips-budget-button"
              onClick={scrollToTips} // Replace setShowTipsModal with scrollToTips
            >
              <span className="icon">💡</span>
              Tips & Budget
            </button>
            
            <h2>{title}: {source} to {destination}</h2>
            <p className="result-meta">{numberOfDays} days • AI-crafted itinerary</p>
            
            <div className="result-actions">
              {!isSaved ? (
                <button 
                  className="save-trip-btn"
                  onClick={handleSaveItinerary}
                  disabled={isSaving}
                >
                  <i className="fas fa-heart"></i> {isSaving ? 'Saving...' : 'Save to Wishlist'}
                </button>
              ) : (
                <button 
                  className="btn-primary"
                  onClick={() => navigate('/profile/trips')}
                >
                  <i className="fas fa-suitcase"></i> View Your Trips
                </button>
              )}
              <button 
                className="btn-primary"
                onClick={() => setGeneratedItinerary(null)}
              >
                <i className="fas fa-plus"></i> Create Another
              </button>
            </div>
          </div>
          
          <div className="days-navigation">
            <div className="days-navigation-inner">
              {generatedItinerary.dayPlans.map((day) => (
                <button
                  key={day.day}
                  className={`day-nav-button ${currentDay === day.day ? 'active' : ''}`}
                  onClick={() => setCurrentDay(day.day)}
                >
                  Day {day.day}
                </button>
              ))}
            </div>
          </div>
          
          <div className="days-timeline">
            {/* Display only the current day */}
            {generatedItinerary.dayPlans
              .filter(day => day.day === currentDay)
              .map((day) => (
                <div key={day.day} className="timeline-day">
                  <div className="day-marker">
                    <span className="day-number">{day.day}</span>
                  </div>
                  <div className="day-content">
                    <div className="day-title">
                      <h3>Day {day.day}</h3>
                    </div>
                    
                    {/* Day summary in Times New Roman */}
                    <div className="day-summary">
                      {generateDaySummary(day)}
                    </div>
                    
                    <div className="day-activities">
                      {day.activities.map((activity, idx) => (
                        <div key={idx} className="activity">
                          <div className="activity-time">{activity.time}</div>
                          <div className="activity-content">
                            <h4>{activity.description}</h4>
                            <div className="activity-location">📍 {activity.location}</div>
                            {activity.notes && (
                              <div className="activity-note">{activity.notes}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="day-details">
                      <div className="detail-card">
                        <span className="detail-label">Where to Stay</span>
                        <div className="detail-content">{day.accommodation}</div>
                      </div>
                      <div className="detail-card">
                        <span className="detail-label">Getting Around</span>
                        <div className="detail-content">{day.transportation}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          
          {/* Add the Tips section with horizontal scrolling cards */}
          <div className="tips-section" ref={tipsRef} id="tips-section">
            <h3>Travel Recommendations</h3>
            
            <div className="tips-container">
              <div className="tips-scroll">
                <div className="tip-card">
                  <div className="feature-icon">🍽️</div>
                  <h4>Where to Eat</h4>
                  <ul>
                    {generatedItinerary.recommendations?.dining?.map((item, i) => (
                      <li key={i}>{item}</li>
                    )) || <li>Restaurant recommendations not available</li>}
                  </ul>
                </div>
                
                <div className="tip-card">
                  <div className="feature-icon">🏛️</div>
                  <h4>Must-See Places</h4>
                  <ul>
                    {generatedItinerary.recommendations?.attractions?.map((item, i) => (
                      <li key={i}>{item}</li>
                    )) || <li>Attraction recommendations not available</li>}
                  </ul>
                </div>
                
                <div className="tip-card">
                  <div className="feature-icon">🛍️</div>
                  <h4>Shopping</h4>
                  <ul>
                    {generatedItinerary.recommendations?.shopping?.map((item, i) => (
                      <li key={i}>{item}</li>
                    )) || <li>Shopping recommendations not available</li>}
                  </ul>
                </div>
                
                <div className="tip-card">
                  <div className="feature-icon">🚗</div>
                  <h4>Transport Tips</h4>
                  <ul>
                    {generatedItinerary.recommendations?.transportation?.map((item, i) => (
                      <li key={i}>{item}</li>
                    )) || <li>Transportation tips not available</li>}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="budget-box">
              <div className="budget-icon">💰</div>
              <div className="budget-info">
                <h4>Estimated Budget</h4>
                <p>{generatedItinerary.estimatedBudget || "Budget information not available"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {loading && <LoadingSpinner />}
    </div>
  );
};

export default ItineraryPlanner;