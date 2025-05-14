import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserItineraries, deleteItinerary } from '../../services/itineraryService';
import './SavedTrips.css';

const SavedTrips = ({ isProfileTab = false, onTripsLoaded = () => {} }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  useEffect(() => {
    if (!currentUser) {
      if (!isProfileTab) {
        navigate('/login');
      }
      return;
    }
    
    const fetchTrips = async () => {
      try {
        const userTrips = await getUserItineraries(currentUser.uid);
        setTrips(userTrips);
        // Call the callback with the trip count
        onTripsLoaded(userTrips.length);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching saved trips:', err);
        setError('Failed to load your saved trips');
        setLoading(false);
        // Even on error, update the count to 0
        onTripsLoaded(0);
      }
    };
    
    fetchTrips();
  }, [currentUser, navigate, isProfileTab, onTripsLoaded]);
  
  const handleDeleteTrip = async (tripId) => {
    try {
      await deleteItinerary(currentUser.uid, tripId);
      setTrips(trips.filter(trip => trip.id !== tripId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting trip:', err);
      setError('Failed to delete trip');
    }
  };
  
  const confirmDelete = (tripId) => {
    setDeleteConfirm(tripId);
  };
  
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };
  
  if (loading) {
    return <div className="loading-container">Loading your trips...</div>;
  }
  
  // Remove the outer container when displayed in profile tab
  const containerClass = isProfileTab ? "" : "saved-trips-container";
  
  return (
    <div className={containerClass}>
      {/* Only show title when not in profile tab */}
      {!isProfileTab && <h2 className="section-title">Your Saved Trips</h2>}
      
      {error && <div className="error-message">{error}</div>}
      
      {trips.length === 0 ? (
        <div className="empty-state">
          <p>You don't have any saved trips yet.</p>
          <Link to="/itinerary-planner" className="btn btn-outline-primary">
            Plan Your First Trip
          </Link>
        </div>
      ) : (
        <div className="trips-grid">
          {trips.map((trip) => (
            <div key={trip.id} className="trip-card">
              <div className="trip-card-header">
                <h3>{trip.tripName}</h3>
                <div className="trip-actions">
                  <button 
                    className="delete-btn"
                    onClick={() => confirmDelete(trip.id)}
                    aria-label="Delete trip"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              
              <div className="trip-details">
                <div className="trip-route">
                  <div className="location">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{trip.source}</span>
                  </div>
                  <div className="route-arrow">→</div>
                  <div className="location">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{trip.destination}</span>
                  </div>
                </div>
                
                <div className="trip-meta">
                  <div className="meta-item">
                    <i className="fas fa-calendar-alt"></i>
                    <span>{trip.numberOfDays} days</span>
                  </div>
                  {trip.createdAt && (
                    <div className="meta-item">
                      <i className="fas fa-clock"></i>
                      <span>
                        {trip.createdAt.toDate 
                          ? new Date(trip.createdAt.toDate()).toLocaleDateString() 
                          : new Date(trip.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <Link 
                to={`/trip/${trip.id}`} 
                className="view-details-btn"
              >
                View Details
              </Link>
              
              {deleteConfirm === trip.id && (
                <div className="delete-confirm">
                  <p>Are you sure you want to delete this trip?</p>
                  <div className="confirm-actions">
                    <button 
                      className="confirm-yes"
                      onClick={() => handleDeleteTrip(trip.id)}
                    >
                      Yes, Delete
                    </button>
                    <button 
                      className="confirm-no"
                      onClick={cancelDelete}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedTrips;