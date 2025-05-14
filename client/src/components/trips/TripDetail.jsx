import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiDollarSign, FiTrash2, FiEdit2, FiMap } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getTripById, deleteTrip } from '../../services/tripService';
import TripDayPlanner from './TripDayPlanner';
import '../../styles/TripDetail.css';

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const tripData = await getTripById(id);
        setTrip(tripData);
      } catch (error) {
        console.error('Error fetching trip:', error);
        setError('Failed to load trip details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrip();
  }, [id]);
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const calculateProgress = () => {
    if (!trip || !trip.days) return 0;
    
    let totalActivities = 0;
    let plannedActivities = 0;
    
    trip.days.forEach(day => {
      // Each day should have at least one activity morning, afternoon, evening
      totalActivities += 3;
      plannedActivities += day.activities.length;
    });
    
    return Math.min(Math.round((plannedActivities / totalActivities) * 100), 100);
  };
  
  const handleDeleteTrip = async () => {
    if (!window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteTrip(trip._id, currentUser.uid);
      navigate('/trips');
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('Failed to delete trip. Please try again.');
    }
  };
  
  const handleEditTrip = () => {
    navigate(`/trips/edit/${trip._id}`);
  };
  
  const handleViewOnMap = () => {
    // Navigate to map view with this trip's destination set
    navigate(`/map?destination=${encodeURIComponent(trip.destination.city)}`);
  };
  
  if (loading) {
    return <div className="loading-container">Loading trip details...</div>;
  }
  
  if (error) {
    return <div className="error-container">{error}</div>;
  }
  
  if (!trip) {
    return <div className="error-container">Trip not found</div>;
  }
  
  const progress = calculateProgress();
  
  return (
    <div className="trip-detail-container">
      <div className="trip-header">
        <div className="trip-title-section">
          <h1>{trip.title}</h1>
          <div className="trip-destination">
            <FiMapPin />
            <span>{trip.destination.city}, {trip.destination.country}</span>
          </div>
        </div>
        
        <div className="trip-actions">
          <button className="btn-icon" onClick={handleEditTrip}>
            <FiEdit2 /> Edit
          </button>
          <button className="btn-icon delete" onClick={handleDeleteTrip}>
            <FiTrash2 /> Delete
          </button>
        </div>
      </div>
      
      <div className="trip-info-row">
        <div className="trip-info-item">
          <FiCalendar />
          <div>
            <div className="info-label">Dates</div>
            <div className="info-value">
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              <span className="trip-duration">({trip.days.length} days)</span>
            </div>
          </div>
        </div>
        
        {trip.totalBudget && (
          <div className="trip-info-item">
            <FiDollarSign />
            <div>
              <div className="info-label">Budget</div>
              <div className="info-value">${trip.totalBudget}</div>
            </div>
          </div>
        )}
        
        <div className="trip-info-item view-map-btn" onClick={handleViewOnMap}>
          <FiMap />
          <div>View on Map</div>
        </div>
      </div>
      
      <div className="trip-planning-progress">
        <div className="progress-label">
          <span>Trip Planning Progress</span>
          <span className="progress-percentage">{progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      
      {trip.categories && trip.categories.length > 0 && (
        <div className="trip-categories">
          {trip.categories.map(category => (
            <span key={category} className="category-badge">{category}</span>
          ))}
        </div>
      )}
      
      {trip.notes && (
        <div className="trip-notes">
          <h3>Notes</h3>
          <p>{trip.notes}</p>
        </div>
      )}
      
      <div className="trip-day-navigation">
        <h3>Itinerary</h3>
        <div className="day-tabs">
          {trip.days.map(day => (
            <button
              key={day.day}
              className={`day-tab ${activeDay === day.day ? 'active' : ''}`}
              onClick={() => setActiveDay(day.day)}
            >
              Day {day.day}
            </button>
          ))}
        </div>
      </div>
      
      <TripDayPlanner 
        trip={trip} 
        activeDay={activeDay} 
        setTrip={setTrip}
      />
    </div>
  );
};

export default TripDetail;