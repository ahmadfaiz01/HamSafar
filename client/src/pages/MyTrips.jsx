import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserTrips } from '../services/tripService';
import TripCard from '../components/trips/TripCard';
import CreateTripButton from '../components/trips/CreateTripButton';
import '../styles/MyTrips.css';

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState('upcoming');

  // Memoize fetchTrips with useCallback to avoid creating a new function on each render
  const fetchTrips = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const userTrips = await getUserTrips(currentUser.uid);
      setTrips(userTrips);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Failed to load your trips. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const filteredTrips = () => {
    const today = new Date();
    
    if (filter === 'upcoming') {
      return trips.filter(trip => new Date(trip.startDate) >= today);
    } else if (filter === 'past') {
      return trips.filter(trip => new Date(trip.endDate) < today);
    } else {
      return trips;
    }
  };

  const renderTrips = () => {
    const filtered = filteredTrips();
    
    if (filtered.length === 0) {
      return (
        <div className="empty-trips">
          <h3>No {filter} trips found</h3>
          <p>Create a new trip to start planning your adventure!</p>
          <CreateTripButton />
        </div>
      );
    }

    return filtered.map(trip => (
      <TripCard 
        key={trip._id} 
        trip={trip} 
        onUpdate={() => fetchTrips()}
      />
    ));
  };

  if (loading) return <div className="loading">Loading your trips...</div>;

  return (
    <div className="my-trips-container">
      <div className="trips-header">
        <h1>My Trips</h1>
        <CreateTripButton />
      </div>
      
      <div className="trip-filters">
        <button 
          className={filter === 'upcoming' ? 'active' : ''}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={filter === 'past' ? 'active' : ''}
          onClick={() => setFilter('past')}
        >
          Past
        </button>
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <div className="trips-grid">
        {renderTrips()}
      </div>
    </div>
  );
};

export default MyTrips;