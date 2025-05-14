import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiPlusCircle, FiFilter, FiSearch } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getUserTrips } from '../../services/tripService';
import '../../styles/MyTrips.css';

const MyTrips = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const fetchTrips = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        const userTrips = await getUserTrips(currentUser.uid);
        setTrips(userTrips);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrips();
  }, [currentUser]);
  
  const getFilteredTrips = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // First apply date filter
    let filtered = trips;
    if (filter === 'upcoming') {
      filtered = trips.filter(trip => new Date(trip.startDate) >= today);
    } else if (filter === 'past') {
      filtered = trips.filter(trip => new Date(trip.endDate) < today);
    }
    
    // Then apply search filter if there is a search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(trip => 
        trip.title.toLowerCase().includes(query) ||
        trip.destination.city.toLowerCase().includes(query) ||
        trip.destination.country.toLowerCase().includes(query) ||
        (trip.categories && trip.categories.some(cat => cat.toLowerCase().includes(query)))
      );
    }
    
    return filtered;
  };
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const filteredTrips = getFilteredTrips();
  
  if (!currentUser) {
    return (
      <div className="not-logged-in">
        <h2>You need to log in to view your trips</h2>
        <button className="btn-primary" onClick={() => navigate('/login')}>
          Log In
        </button>
      </div>
    );
  }
  
  if (loading) {
    return <div className="loading-container">Loading your trips...</div>;
  }
  
  return (
    <div className="my-trips-container">
      <div className="trips-header">
        <h1>My Trips</h1>
        <Link to="/trips/new" className="create-trip-btn">
          <FiPlusCircle /> Create Trip
        </Link>
      </div>
      
      <div className="trips-toolbar">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-container">
          <FiFilter className="filter-icon" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Trips</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>
      
      {filteredTrips.length === 0 ? (
        <div className="no-trips">
          <h3>No trips found</h3>
          {searchQuery || filter !== 'all' ? (
            <p>Try adjusting your filters or search query</p>
          ) : (
            <div>
              <p>You haven't created any trips yet</p>
              <Link to="/trips/new" className="btn-primary">
                Create Your First Trip
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="trips-grid">
          {filteredTrips.map(trip => (
            <Link to={`/trips/${trip._id}`} key={trip._id} className="trip-card">
              <div className="card-date">
                <FiCalendar />
                <span>{formatDate(trip.startDate)}</span>
                {trip.days.length > 1 && <span> - {formatDate(trip.endDate)}</span>}
              </div>
              
              <h3 className="card-title">{trip.title}</h3>
              
              <div className="card-destination">
                <FiMapPin />
                <span>{trip.destination.city}, {trip.destination.country}</span>
              </div>
              
              <div className="card-details">
                <span className="card-duration">{trip.days.length} days</span>
                
                {trip.categories && trip.categories.length > 0 && (
                  <div className="card-categories">
                    {trip.categories.slice(0, 3).map(category => (
                      <span key={category} className="category-badge small">
                        {category}
                      </span>
                    ))}
                    {trip.categories.length > 3 && (
                      <span className="more-badge">+{trip.categories.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTrips;