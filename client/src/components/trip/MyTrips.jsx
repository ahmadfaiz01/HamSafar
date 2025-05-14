import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import tripService from '../../services/tripService';
import './MyTrips.css';

const MyTrips = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Fetch user's trips
  useEffect(() => {
    const fetchTrips = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const userTrips = await tripService.getUserTrips(currentUser.uid);
        setTrips(userTrips);
      } catch (err) {
        console.error('Error fetching trips:', err);
        setError('Failed to load your trips. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrips();
  }, [currentUser]);
  
  // Filter trips based on status
  const getFilteredTrips = () => {
    if (filterStatus === 'all') return trips;
    
    const now = new Date();
    
    if (filterStatus === 'upcoming') {
      return trips.filter(trip => new Date(trip.startDate) > now);
    } else if (filterStatus === 'past') {
      return trips.filter(trip => new Date(trip.endDate) < now);
    } else if (filterStatus === 'ongoing') {
      return trips.filter(trip => 
        new Date(trip.startDate) <= now && new Date(trip.endDate) >= now
      );
    }
    
    return trips;
  };
  
  // Format date range
  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // If same month and year
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.getDate()}, ${end.getFullYear()}`;
    }
    
    // If same year
    if (start.getFullYear() === end.getFullYear()) {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${end.getFullYear()}`;
    }
    
    // Different years
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };
  
  // Get trip status
  const getTripStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) {
      return { label: 'Upcoming', color: 'primary' };  // Removed unused 'status' property
    } else if (now > end) {
      return { label: 'Completed', color: 'success' };  // Removed unused 'status' property
    } else {
      return { label: 'Ongoing', color: 'warning' };  // Removed unused 'status' property
    }
  };
  
  // Handle trip deletion
  const handleDeleteTrip = async (tripId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this trip?')) {
      return;
    }
    
    try {
      await tripService.deleteTrip(tripId);
      setTrips(trips.filter(trip => trip._id !== tripId));
    } catch (err) {
      console.error('Error deleting trip:', err);
      setError('Failed to delete trip. Please try again.');
    }
  };
  
  // If loading
  if (loading) {
    return (
      <div className="my-trips-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading your trips...</p>
      </div>
    );
  }
  
  // If error
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }
  
  return (
    <div className="my-trips-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Trips</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/trips/new')}
        >
          <i className="fas fa-plus me-2"></i>
          Plan New Trip
        </button>
      </div>
      
      {/* Filter buttons */}
      <div className="trip-filters mb-4">
        <button 
          className={`btn ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
          onClick={() => setFilterStatus('all')}
        >
          All Trips
        </button>
        <button 
          className={`btn ${filterStatus === 'upcoming' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
          onClick={() => setFilterStatus('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={`btn ${filterStatus === 'ongoing' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
          onClick={() => setFilterStatus('ongoing')}
        >
          Ongoing
        </button>
        <button 
          className={`btn ${filterStatus === 'past' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setFilterStatus('past')}
        >
          Completed
        </button>
      </div>
      
      {/* Trips grid */}
      {getFilteredTrips().length === 0 ? (
        <div className="no-trips">
          <img 
            src="/images/empty-trips.svg" 
            alt="No trips" 
            className="no-trips-image"
          />
          <h4>You don't have any {filterStatus !== 'all' ? filterStatus : ''} trips yet!</h4>
          <p>Plan your first adventure by clicking the "Plan New Trip" button above.</p>
        </div>
      ) : (
        <div className="row">
          {getFilteredTrips().map(trip => {
            const { label, color } = getTripStatus(trip.startDate, trip.endDate);
            
            return (
              <div key={trip._id} className="col-md-6 col-lg-4 mb-4">
                <Link to={`/trips/${trip._id}`} className="trip-card-link">
                  <div className="card trip-card h-100">
                    <div className="trip-card-image-container">
                      <div className={`trip-status-badge badge bg-${color}`}>
                        {label}
                      </div>
                      <img
                        src={trip.coverImage || `https://source.unsplash.com/featured/?${trip.destination}`}
                        className="trip-card-img"
                        alt={trip.name}
                      />
                    </div>
                    <div className="card-body">
                      <h5 className="card-title">{trip.name}</h5>
                      <p className="card-text destination">
                        <i className="fas fa-map-marker-alt"></i> {trip.destination}
                      </p>
                      <p className="card-text dates">
                        <i className="fas fa-calendar-alt"></i> {formatDateRange(trip.startDate, trip.endDate)}
                      </p>
                      {trip.budget > 0 && (
                        <p className="card-text budget">
                          <i className="fas fa-money-bill-wave"></i> Budget: ${trip.budget}
                        </p>
                      )}
                      <div className="trip-card-actions">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/trips/edit/${trip._id}`);
                          }}
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={(e) => handleDeleteTrip(trip._id, e)}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTrips;
