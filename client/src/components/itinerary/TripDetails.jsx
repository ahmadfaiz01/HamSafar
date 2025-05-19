import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getItineraryById } from '../../services/itineraryService';
import './TripDetails.css';

const TripDetails = () => {
  const { tripId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDay, setCurrentDay] = useState(1);
  
  // Add a ref for the recommendations section
  const tipsRef = useRef(null);
  
  // Create a function to scroll to tips/recommendations
  const scrollToTips = () => {
    tipsRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    const fetchTripDetails = async () => {
      try {
        console.log(`Fetching trip details for ID: ${tripId}`);
        const tripData = await getItineraryById(currentUser.uid, tripId);
        console.log('Retrieved trip data:', tripData);
        
        setTrip(tripData);
        if (tripData.dayPlans && tripData.dayPlans.length > 0) {
          setCurrentDay(tripData.dayPlans[0].day || 1);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching trip details:', err);
        setError(`Failed to load trip details: ${err.message}`);
        setLoading(false);
      }
    };
    
    fetchTripDetails();
  }, [currentUser, tripId, navigate]);
  
  // Scroll to top when current day changes
  useEffect(() => {
    if (trip && trip.dayPlans) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentDay]);
  
  const handleBack = () => {
    navigate('/profile/trips');
  };
  
  // Generate a day summary from activities
  const generateDaySummary = (dayPlan) => {
    if (!dayPlan) return '';
    
    const activities = dayPlan.activities || [];
    const numActivities = activities.length;
    
    if (numActivities === 0) return 'No activities planned for this day.';
    
    // Get a list of the main highlights (excluding meals and routine activities)
    const highlights = activities
      .map(activity => activity.description)
      .filter(desc => desc && !desc.toLowerCase().includes('breakfast') && 
                     !desc.toLowerCase().includes('lunch') && 
                     !desc.toLowerCase().includes('dinner') &&
                     !desc.toLowerCase().includes('check'))
      .slice(0, 3);
    
    return `On Day ${dayPlan.day}, you'll explore ${trip.destination} with ${numActivities} planned activities. 
    ${highlights.length > 0 ? `Highlights include ${highlights.join(', ')}.` : ''}
    ${dayPlan.accommodation ? `You'll be staying at ${dayPlan.accommodation}.` : ''}`;
  };
  
  // Handle rendering trip data in the same style as ItineraryPlanner
  const renderTripData = () => {
    if (!trip) return null;
    
    // Ensure dayPlans is an array
    const dayPlans = Array.isArray(trip.dayPlans) 
      ? trip.dayPlans 
      : [];
    
    // Normalize recommendations data structure
    let recommendations = {
      dining: [],
      attractions: [],
      shopping: [],
      transportation: []
    };
    
    // Check for each possible data format
    if (trip.recommendations) {
      recommendations = trip.recommendations;
    } else {
      // Check for separate properties
      if (trip.dining) recommendations.dining = trip.dining;
      if (trip.attractions) recommendations.attractions = trip.attractions;
      if (trip.shopping) recommendations.shopping = trip.shopping;
      if (trip.transportation) recommendations.transportation = trip.transportation;
    }
    
    return (
      <div className="itinerary-creator">
        <div className="itinerary-path">
          <span className="path-item" onClick={() => navigate('/')}>Home</span>
          <span className="path-separator">/</span>
          <span className="path-item" onClick={() => navigate('/profile/trips')}>My Trips</span>
          <span className="path-separator">/</span>
          <span className="path-item active">{trip.tripName || 'Trip Details'}</span>
        </div>
      
        <div className="itinerary-result hover-card">
          <div className="result-header">
            <button 
              className="tips-budget-button"
              onClick={scrollToTips}
            >
              <span className="icon">💡</span>
              Tips & Budget
            </button>
            
            <h2>{trip.tripName}: {trip.source} to {trip.destination}</h2>
            <p className="result-meta">{trip.numberOfDays} days • Saved itinerary</p>
            
            <div className="result-actions">
              <button 
                className="save-trip-btn"
                onClick={handleBack}
              >
                <i className="fas fa-arrow-left"></i> Back to Trips
              </button>
              <button 
                className="btn-primary"
                onClick={() => navigate('/itinerary-planner')}
              >
                <i className="fas fa-plus"></i> Create New Trip
              </button>
            </div>
          </div>
          
          {dayPlans.length > 0 && (
            <>
              <div className="days-navigation">
                <div className="days-navigation-inner">
                  {dayPlans.map((day) => (
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
                {dayPlans
                  .filter(day => day.day === currentDay)
                  .map((day) => (
                    <div key={day.day} className="timeline-day">
                      <div className="day-marker">
                        <span className="day-number">{day.day}</span>
                      </div>
                      <div className="day-content">
                        <div className="day-title">
                          <h3>Day {day.day}</h3>
                          {day.date && <span className="day-date">{day.date}</span>}
                        </div>
                        
                        {/* Day summary in Times New Roman */}
                        <div className="day-summary">
                          {generateDaySummary(day)}
                        </div>
                        
                        <div className="day-activities">
                          {(day.activities || []).map((activity, idx) => (
                            <div key={idx} className="activity">
                              <div className="activity-time">{activity.time}</div>
                              <div className="activity-content">
                                <h4>{activity.description || activity.name}</h4>
                                <div className="activity-location">📍 {activity.location}</div>
                                {activity.notes && (
                                  <div className="activity-note">{activity.notes}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="day-details">
                          {day.accommodation && (
                            <div className="detail-card">
                              <span className="detail-label">Where to Stay</span>
                              <div className="detail-content">{day.accommodation}</div>
                            </div>
                          )}
                          {day.transportation && (
                            <div className="detail-card">
                              <span className="detail-label">Getting Around</span>
                              <div className="detail-content">{day.transportation}</div>
                            </div>
                          )}
                          {day.notes && (
                            <div className="detail-card">
                              <span className="detail-label">Notes</span>
                              <div className="detail-content">{day.notes}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
          
          {/* Tips & Recommendations Section - Exactly like ItineraryPlanner */}
          <div className="tips-section" ref={tipsRef} id="tips-section">
            <h3>Travel Recommendations</h3>
            
            <div className="tips-container">
              <div className="tips-scroll">
                {recommendations.dining && recommendations.dining.length > 0 && (
                  <div className="tip-card">
                    <div className="feature-icon">🍽️</div>
                    <h4>Where to Eat</h4>
                    <ul>
                      {recommendations.dining.map((item, i) => (
                        <li key={i}>{typeof item === 'string' ? item : item.name || 'Restaurant recommendation'}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {recommendations.attractions && recommendations.attractions.length > 0 && (
                  <div className="tip-card">
                    <div className="feature-icon">🏛️</div>
                    <h4>Must-See Places</h4>
                    <ul>
                      {recommendations.attractions.map((item, i) => (
                        <li key={i}>{typeof item === 'string' ? item : item.name || 'Attraction recommendation'}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {recommendations.shopping && recommendations.shopping.length > 0 && (
                  <div className="tip-card">
                    <div className="feature-icon">🛍️</div>
                    <h4>Shopping</h4>
                    <ul>
                      {recommendations.shopping.map((item, i) => (
                        <li key={i}>{typeof item === 'string' ? item : item.name || 'Shopping recommendation'}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {recommendations.transportation && recommendations.transportation.length > 0 && (
                  <div className="tip-card">
                    <div className="feature-icon">🚗</div>
                    <h4>Transport Tips</h4>
                    <ul>
                      {recommendations.transportation.map((item, i) => (
                        <li key={i}>{typeof item === 'string' ? item : item.name || item.type || 'Transportation tip'}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            {trip.estimatedBudget && (
              <div className="budget-box">
                <div className="budget-icon">💰</div>
                <div className="budget-info">
                  <h4>Estimated Budget</h4>
                  <p>{trip.estimatedBudget || "Budget information not available"}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Loading and error states
  if (loading) {
    return (
      <div className="itinerary-creator">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading trip details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="itinerary-creator">
        <div className="error-container">
          <h3>Error Loading Trip</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={handleBack}>
            Back to Trips
          </button>
        </div>
      </div>
    );
  }
  
  return renderTripData();
};

export default TripDetails;