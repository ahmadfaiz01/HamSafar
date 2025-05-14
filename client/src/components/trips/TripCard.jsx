import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import '../../styles/TripCard.css';

const TripCard = ({ trip }) => {
  const isUpcoming = new Date(trip.startDate) > new Date();
  const isOngoing = new Date(trip.startDate) <= new Date() && new Date(trip.endDate) >= new Date();
  
  // Calculate days until trip
  const getDaysUntil = () => {
    const today = new Date();
    const tripStart = new Date(trip.startDate);
    const diffTime = Math.abs(tripStart - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (isOngoing) {
      return 'Ongoing';
    } else if (isUpcoming) {
      return `In ${diffDays} days`;
    } else {
      return 'Completed';
    }
  };
  
  const formatDate = (date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };

  return (
    <div className={`trip-card ${isOngoing ? 'ongoing' : isUpcoming ? 'upcoming' : 'past'}`}>
      <div className="trip-card-header">
        <span className="trip-status">{getDaysUntil()}</span>
        <h3>{trip.title}</h3>
        <p className="trip-destination">{trip.destination.city}, {trip.destination.country}</p>
      </div>
      
      <div className="trip-card-details">
        <div className="trip-dates">
          <div className="date">
            <span>From</span>
            <strong>{formatDate(trip.startDate)}</strong>
          </div>
          <div className="date">
            <span>To</span>
            <strong>{formatDate(trip.endDate)}</strong>
          </div>
        </div>
        
        <div className="trip-categories">
          {trip.categories?.slice(0, 3).map((category, index) => (
            <span key={index} className="category-tag">{category}</span>
          ))}
          {(trip.categories?.length || 0) > 3 && <span className="more-categories">+{trip.categories.length - 3}</span>}
        </div>
        
        {trip.totalBudget > 0 && (
          <div className="trip-budget">
            <span>Budget: ${trip.totalBudget}</span>
          </div>
        )}
      </div>
      
      <div className="trip-card-actions">
        <Link to={`/trips/${trip._id}`} className="btn-view">View Details</Link>
        <Link to={`/trips/${trip._id}/plan`} className="btn-plan">Plan Itinerary</Link>
      </div>
    </div>
  );
};

export default TripCard;