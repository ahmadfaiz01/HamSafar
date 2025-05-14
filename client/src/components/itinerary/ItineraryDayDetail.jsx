import React from 'react';
import '../../styles/ItineraryDayDetail.css';

const ItineraryDayDetail = ({ day }) => {
  if (!day) {
    return (
      <div className="empty-day-detail">
        <p>Select a day to view details.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="itinerary-day-detail">
      <div className="day-header">
        <h2>Day {day.dayNumber} - {formatDate(day.date)}</h2>
        <div className="day-budget">
          Budget: PKR {day.dailyBudget?.toLocaleString() || '0'}
        </div>
      </div>
      
      {day.notes && (
        <div className="day-notes">
          <p>{day.notes}</p>
        </div>
      )}
      
      <div className="day-sections">
        {/* Accommodation Section */}
        <div className="detail-section">
          <div className="section-header">
            <h3><i className="fas fa-bed"></i> Accommodation</h3>
          </div>
          
          {day.accommodation && day.accommodation.name ? (
            <div className="accommodation-detail">
              <div className="detail-name">{day.accommodation.name}</div>
              <div className="detail-location">{day.accommodation.location}</div>
              <div className="detail-cost">PKR {day.accommodation.cost?.toLocaleString() || '0'}</div>
              {day.accommodation.notes && (
                <div className="detail-notes">{day.accommodation.notes}</div>
              )}
            </div>
          ) : (
            <div className="empty-section">No accommodation details.</div>
          )}
        </div>
        
        {/* Activities Section */}
        <div className="detail-section">
          <div className="section-header">
            <h3><i className="fas fa-hiking"></i> Activities</h3>
          </div>
          
          {day.activities && day.activities.length > 0 ? (
            <div className="activities-list">
              {day.activities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-time">{activity.time}</div>
                  <div className="activity-content">
                    <div className="detail-name">{activity.name}</div>
                    <div className="detail-location">{activity.location}</div>
                    <div className="detail-cost">PKR {activity.cost?.toLocaleString() || '0'}</div>
                    {activity.notes && (
                      <div className="detail-notes">{activity.notes}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-section">No activities planned.</div>
          )}
        </div>
        
        {/* Transportation Section */}
        <div className="detail-section">
          <div className="section-header">
            <h3><i className="fas fa-car"></i> Transportation</h3>
          </div>
          
          {day.transportation && day.transportation.type ? (
            <div className="transportation-detail">
              <div className="detail-name">{day.transportation.type}</div>
              <div className="detail-route">
                From: {day.transportation.from} → To: {day.transportation.to}
              </div>
              <div className="detail-cost">PKR {day.transportation.cost?.toLocaleString() || '0'}</div>
              {day.transportation.notes && (
                <div className="detail-notes">{day.transportation.notes}</div>
              )}
            </div>
          ) : (
            <div className="empty-section">No transportation details.</div>
          )}
        </div>
        
        {/* Meals Section */}
        <div className="detail-section">
          <div className="section-header">
            <h3><i className="fas fa-utensils"></i> Meals</h3>
          </div>
          
          {day.meals && day.meals.length > 0 ? (
            <div className="meals-list">
              {day.meals.map((meal, index) => (
                <div key={index} className="meal-item">
                  <div className="meal-type">
                    {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                  </div>
                  <div className="meal-content">
                    <div className="detail-location">{meal.location}</div>
                    <div className="detail-cost">PKR {meal.cost?.toLocaleString() || '0'}</div>
                    {meal.notes && (
                      <div className="detail-notes">{meal.notes}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-section">No meal details.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItineraryDayDetail;
