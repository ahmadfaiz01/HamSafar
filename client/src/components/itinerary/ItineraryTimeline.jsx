import React from 'react';
import '../../styles/ItineraryTimeline.css';

const ItineraryTimeline = ({ days, selectedDay, onSelectDay }) => {
  if (!days || days.length === 0) {
    return (
      <div className="empty-timeline">
        <p>No days in itinerary yet.</p>
      </div>
    );
  }

  return (
    <div className="itinerary-timeline">
      <h3>Itinerary Timeline</h3>
      <div className="timeline-days">
        {days.map((day, index) => (
          <div 
            key={index}
            className={`timeline-day ${selectedDay === index ? 'selected' : ''}`}
            onClick={() => onSelectDay(index)}
          >
            <div className="timeline-dot"></div>
            <div className="timeline-label">Day {index + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItineraryTimeline;
