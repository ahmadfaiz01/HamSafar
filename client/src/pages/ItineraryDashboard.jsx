import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserItineraries, deleteItinerary } from '../services/itineraryService';
import '../styles/ItineraryDashboard.css';

const ItineraryDashboard = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        setLoading(true);
        const data = await getUserItineraries();
        setItineraries(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching itineraries:', err);
        setError('Failed to load your itineraries. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchItineraries();
  }, []);

  const handleCreateItinerary = () => {
    navigate('/itinerary/create');
  };

  const handleDeleteItinerary = async (id, event) => {
    event.stopPropagation(); // Prevent navigation to itinerary details
    
    if (window.confirm('Are you sure you want to delete this itinerary? This action cannot be undone.')) {
      try {
        await deleteItinerary(id);
        // Remove the deleted itinerary from state
        setItineraries(prevItineraries => prevItineraries.filter(item => item._id !== id));
      } catch (err) {
        console.error('Error deleting itinerary:', err);
        alert('Failed to delete itinerary. Please try again.');
      }
    }
  };

  const navigateToItinerary = (id) => {
    navigate(`/itinerary/${id}`);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate trip duration
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end days
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'draft':
        return 'status-draft';
      case 'planned':
        return 'status-planned';
      case 'ongoing':
        return 'status-ongoing';
      case 'completed':
        return 'status-completed';
      default:
        return '';
    }
  };

  return (
    <div className="itinerary-dashboard">
      <div className="dashboard-header">
        <h1>Your Travel Itineraries</h1>
        <button 
          className="create-itinerary-btn"
          onClick={handleCreateItinerary}
        >
          Create New Itinerary
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your itineraries...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : itineraries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="fas fa-route"></i>
          </div>
          <h2>No Itineraries Yet</h2>
          <p>Plan your first adventure by creating a new itinerary.</p>
          <button 
            className="create-first-itinerary-btn"
            onClick={handleCreateItinerary}
          >
            Create Your First Itinerary
          </button>
        </div>
      ) : (
        <div className="itineraries-grid">
          {itineraries.map(itinerary => (
            <div 
              key={itinerary._id} 
              className="itinerary-card"
              onClick={() => navigateToItinerary(itinerary._id)}
            >
              <div className="itinerary-card-header">
                <h3>{itinerary.title}</h3>
                <span className={`status-badge ${getStatusClass(itinerary.status)}`}>
                  {itinerary.status.charAt(0).toUpperCase() + itinerary.status.slice(1)}
                </span>
              </div>
              
              <div className="itinerary-card-dates">
                <div className="date-range">
                  <i className="far fa-calendar-alt"></i>
                  <span>{formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}</span>
                </div>
                <div className="duration">
                  <i className="far fa-clock"></i>
                  <span>{calculateDuration(itinerary.startDate, itinerary.endDate)} days</span>
                </div>
              </div>
              
              <div className="itinerary-card-destinations">
                <i className="fas fa-map-marker-alt"></i>
                <span>
                  {itinerary.destinations && itinerary.destinations.length > 0
                    ? itinerary.destinations.map(d => d.name).join(' → ')
                    : 'No destinations added yet'}
                </span>
              </div>
              
              <div className="itinerary-card-budget">
                <i className="fas fa-wallet"></i>
                <span>Budget: PKR {itinerary.totalBudget.toLocaleString()}</span>
              </div>
              
              <div className="itinerary-card-actions">
                <button 
                  className="edit-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/itinerary/edit/${itinerary._id}`);
                  }}
                >
                  <i className="fas fa-edit"></i> Edit
                </button>
                <button 
                  className="delete-btn"
                  onClick={(e) => handleDeleteItinerary(itinerary._id, e)}
                >
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItineraryDashboard;
