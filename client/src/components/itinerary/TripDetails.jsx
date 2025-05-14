import React, { useState, useEffect } from 'react';
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
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    const fetchTripDetails = async () => {
      try {
        const tripData = await getItineraryById(currentUser.uid, tripId);
        setTrip(tripData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching trip details:', err);
        setError('Failed to load trip details');
        setLoading(false);
      }
    };
    
    fetchTripDetails();
  }, [currentUser, tripId, navigate]);
  
  const handleBack = () => {
    navigate('/profile/trips');
  };
  
  if (loading) {
    return <div className="loading-container">Loading trip details...</div>;
  }
  
  if (error || !trip) {
    return (
      <div className="trip-details-container">
        <div className="error-message">
          {error || 'Trip not found'}
        </div>
        <button className="back-btn" onClick={handleBack}>
          Back to Trips
        </button>
      </div>
    );
  }
  
  return (
    <div className="trip-details-container">
      <div className="trip-header">
        <button className="back-btn" onClick={handleBack}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <h1>{trip.tripName}</h1>
        <div className="trip-locations">
          <span className="location">{trip.source}</span>
          <span className="arrow">→</span>
          <span className="location">{trip.destination}</span>
        </div>
        <div className="trip-meta">
          <div className="meta-item">
            <i className="fas fa-calendar-alt"></i>
            <span>{trip.numberOfDays} days</span>
          </div>
          {trip.estimatedBudget && (
            <div className="meta-item">
              <i className="fas fa-wallet"></i>
              <span>{trip.estimatedBudget}</span>
            </div>
          )}
          {trip.createdAt && (
            <div className="meta-item">
              <i className="fas fa-clock"></i>
              <span>
                Created: {trip.createdAt.toDate 
                  ? new Date(trip.createdAt.toDate()).toLocaleDateString() 
                  : new Date(trip.createdAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        {trip.notes && (
          <div className="trip-notes">
            <h3>Trip Notes</h3>
            <p>{trip.notes}</p>
          </div>
        )}
      </div>
      
      <div className="day-plans-section">
        <h2>Itinerary</h2>
        
        <div className="days-timeline">
          {trip.dayPlans.map((day) => (
            <div key={day.day} className="day-card">
              <div className="day-header">
                <h3>Day {day.day}</h3>
                <span>{day.date}</span>
              </div>
              
              <div className="day-timeline">
                {day.activities.map((activity, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-time">{activity.time}</div>
                    <div className="timeline-content">
                      <h4>{activity.description}</h4>
                      <div className="timeline-location">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{activity.location}</span>
                      </div>
                      {activity.notes && (
                        <p className="timeline-notes">{activity.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="day-details-grid">
                {day.accommodation && (
                  <div className="day-detail-card">
                    <div className="detail-icon">
                      <i className="fas fa-bed"></i>
                    </div>
                    <div className="detail-content">
                      <h4>Accommodation</h4>
                      <p>{day.accommodation}</p>
                    </div>
                  </div>
                )}
                
                {day.transportation && (
                  <div className="day-detail-card">
                    <div className="detail-icon">
                      <i className="fas fa-car"></i>
                    </div>
                    <div className="detail-content">
                      <h4>Transportation</h4>
                      <p>{day.transportation}</p>
                    </div>
                  </div>
                )}
                
                {day.notes && (
                  <div className="day-detail-card">
                    <div className="detail-icon">
                      <i className="fas fa-sticky-note"></i>
                    </div>
                    <div className="detail-content">
                      <h4>Notes</h4>
                      <p>{day.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {trip.recommendations && (
        <div className="recommendations-section">
          <h2>Recommendations</h2>
          
          <div className="recommendations-grid">
            {trip.recommendations.dining && trip.recommendations.dining.length > 0 && (
              <div className="recommendation-card">
                <div className="recommendation-icon">
                  <i className="fas fa-utensils"></i>
                </div>
                <h3>Dining</h3>
                <ul>
                  {trip.recommendations.dining.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {trip.recommendations.attractions && trip.recommendations.attractions.length > 0 && (
              <div className="recommendation-card">
                <div className="recommendation-icon">
                  <i className="fas fa-camera"></i>
                </div>
                <h3>Attractions</h3>
                <ul>
                  {trip.recommendations.attractions.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {trip.recommendations.shopping && trip.recommendations.shopping.length > 0 && (
              <div className="recommendation-card">
                <div className="recommendation-icon">
                  <i className="fas fa-shopping-bag"></i>
                </div>
                <h3>Shopping</h3>
                <ul>
                  {trip.recommendations.shopping.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {trip.recommendations.transportation && trip.recommendations.transportation.length > 0 && (
              <div className="recommendation-card">
                <div className="recommendation-icon">
                  <i className="fas fa-subway"></i>
                </div>
                <h3>Transportation Tips</h3>
                <ul>
                  {trip.recommendations.transportation.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetails;