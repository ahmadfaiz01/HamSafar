import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTripById, updateTrip } from '../services/tripService';
import { getPointsOfInterestRecommendations } from '../services/recommendationService';
import DayPlanner from '../components/trips/DayPlanner';
import ActivityForm from '../components/trips/ActivityForm';
import PointOfInterestList from '../components/trips/PointOfInterestList';
import '../styles/TripPlanner.css';

const TripPlanner = () => {
  const { tripId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [trip, setTrip] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  
  // Calculate the number of days in the trip - Memoize with useCallback
  const calculateDayCount = useCallback((trip) => {
    if (!trip || !trip.startDate || !trip.endDate) return 0;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, []); // No dependencies because it's a pure function
  
  // Move initializeDays to useCallback with calculateDayCount in dependencies
  const initializeDays = useCallback((trip) => {
    const dayCount = calculateDayCount(trip);
    
    if (!trip.days || trip.days.length === 0) {
      const initialDays = Array.from({ length: dayCount }, (_, i) => ({
        day: i + 1,
        activities: []
      }));
      
      return { ...trip, days: initialDays };
    }
    
    // Ensure all days are present
    let updatedDays = [...trip.days];
    for (let i = 1; i <= dayCount; i++) {
      if (!updatedDays.find(d => d.day === i)) {
        updatedDays.push({
          day: i,
          activities: []
        });
      }
    }
    
    updatedDays = updatedDays.filter(d => d.day <= dayCount);
    updatedDays.sort((a, b) => a.day - b.day);
    
    return { ...trip, days: updatedDays };
  }, [calculateDayCount]); // Add calculateDayCount as dependency

  useEffect(() => {
    const loadTrip = async () => {
      try {
        setLoading(true);
        const tripData = await getTripById(tripId);
        
        if (tripData.userId !== currentUser.uid) {
          navigate('/trips');
          return;
        }
        
        const initializedTrip = initializeDays(tripData);
        setTrip(initializedTrip);
        
        // Load recommendations
        const poiRecs = await getPointsOfInterestRecommendations(currentUser.uid);
        setRecommendations(poiRecs);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading trip:', err);
        setError('Failed to load trip details. Please try again.');
        setLoading(false);
      }
    };
    
    if (currentUser) {
      loadTrip();
    }
  }, [tripId, currentUser, navigate, initializeDays]);

  const handleSaveActivity = async (activity) => {
    try {
      const updatedTrip = { ...trip };
      const dayIndex = updatedTrip.days.findIndex(d => d.day === selectedDay);
      
      if (editingActivity !== null) {
        // Edit existing activity
        updatedTrip.days[dayIndex].activities[editingActivity] = activity;
      } else {
        // Add new activity
        updatedTrip.days[dayIndex].activities.push(activity);
      }
      
      // Sort activities by start time
      updatedTrip.days[dayIndex].activities.sort((a, b) => {
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return a.startTime.localeCompare(b.startTime);
      });
      
      await updateTrip(tripId, updatedTrip);
      setTrip(updatedTrip);
      setShowActivityForm(false);
      setEditingActivity(null);
    } catch (err) {
      console.error('Error saving activity:', err);
      setError('Failed to save activity. Please try again.');
    }
  };

  const handleEditActivity = (dayIndex, activityIndex) => {
    setSelectedDay(dayIndex);
    setEditingActivity(activityIndex);
    setShowActivityForm(true);
  };

  const handleDeleteActivity = async (dayIndex, activityIndex) => {
    try {
      const updatedTrip = { ...trip };
      updatedTrip.days[dayIndex - 1].activities.splice(activityIndex, 1);
      
      await updateTrip(tripId, updatedTrip);
      setTrip(updatedTrip);
    } catch (err) {
      console.error('Error deleting activity:', err);
      setError('Failed to delete activity. Please try again.');
    }
  };

  const handleAddActivityFromPOI = (poi) => {
    const activity = {
      name: poi.name,
      category: poi.category,
      location: poi.location,
      description: poi.description || '',
      cost: 0,
    };
    
    setEditingActivity(null);
    setShowActivityForm(true);
    // Pre-fill the form
    return activity;
  };

  if (loading) return <div className="loading">Loading trip details...</div>;
  if (!trip) return <div className="not-found">Trip not found</div>;

  return (
    <div className="trip-planner-container">
      <div className="trip-planner-header">
        <h1>{trip.title}</h1>
        <h2>{trip.destination.city}, {trip.destination.country}</h2>
        <div className="trip-dates">
          {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="trip-planner-content">
        <div className="days-column">
          <h3>Your Itinerary</h3>
          <div className="day-tabs">
            {trip.days.map((day) => (
              <button 
                key={day.day}
                className={`day-tab ${selectedDay === day.day ? 'active' : ''}`}
                onClick={() => setSelectedDay(day.day)}
              >
                Day {day.day}
              </button>
            ))}
          </div>
          
          <DayPlanner 
            day={trip.days.find(d => d.day === selectedDay)} 
            onAddActivity={() => {
              setEditingActivity(null);
              setShowActivityForm(true);
            }}
            onEditActivity={(activityIndex) => handleEditActivity(selectedDay, activityIndex)}
            onDeleteActivity={(activityIndex) => handleDeleteActivity(selectedDay, activityIndex)}
          />
        </div>
        
        <div className="recommendations-column">
          <h3>Recommendations</h3>
          <PointOfInterestList 
            pointsOfInterest={recommendations.filter(poi => 
              poi.city.toLowerCase() === trip.destination.city.toLowerCase() ||
              poi.country.toLowerCase() === trip.destination.country.toLowerCase()
            )}
            onSelect={handleAddActivityFromPOI}
          />
        </div>
      </div>
      
      {showActivityForm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <ActivityForm 
              day={selectedDay}
              activity={editingActivity !== null ? trip.days[selectedDay - 1].activities[editingActivity] : null}
              onSave={handleSaveActivity}
              onCancel={() => {
                setShowActivityForm(false);
                setEditingActivity(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TripPlanner;