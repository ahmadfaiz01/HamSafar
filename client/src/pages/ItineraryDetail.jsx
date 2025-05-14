import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth to get currentUser
import { getItineraryById } from '../services/itineraryService'; // Import from itineraryService
import { generateAIItinerary } from '../services/geminiService'; // Import from geminiService
import ItineraryTimeline from '../components/itinerary/ItineraryTimeline';
import ItineraryDayDetail from '../components/itinerary/ItineraryDayDetail';
import ItineraryMap from '../components/itinerary/ItineraryMap';
import ItineraryAIRecommendations from '../components/itinerary/ItineraryAIRecommendations';
import '../styles/ItineraryDetail.css';

const ItineraryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Get currentUser from AuthContext
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline');
  const [selectedDay, setSelectedDay] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        navigate('/login', { state: { from: `/itinerary/${id}` } });
        return;
      }
      
      try {
        // Pass both userId and itineraryId to the function
        const data = await getItineraryById(currentUser.uid, id);
        setItinerary(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching itinerary:', err);
        setError('Failed to load itinerary details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentUser, navigate]);

  const handleGenerateAIItinerary = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/itinerary/${id}` } });
      return;
    }
    
    try {
      setGeneratingAI(true);
      // Call generateAIItinerary with the itinerary ID
      const updatedItinerary = await generateAIItinerary(id);
      setItinerary(updatedItinerary);
      setError(null);
      alert('AI-powered itinerary has been generated successfully!');
    } catch (err) {
      console.error('Error generating AI itinerary:', err);
      setError('Failed to generate AI itinerary. Please try again.');
    } finally {
      setGeneratingAI(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading itinerary details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button 
          onClick={() => navigate('/itinerary')}
          className="back-btn"
        >
          Back to Itineraries
        </button>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="error-container">
        <div className="error-message">Itinerary not found.</div>
        <button 
          onClick={() => navigate('/itinerary')}
          className="back-btn"
        >
          Back to Itineraries
        </button>
      </div>
    );
  }

  return (
    <div className="itinerary-detail-container">
      <div className="itinerary-header">
        <div className="itinerary-title-section">
          <button 
            onClick={() => navigate('/itinerary')}
            className="back-btn"
          >
            <i className="fas fa-arrow-left"></i> Back
          </button>
          <h1>{itinerary.tripName}</h1>
        </div>
        <div className="itinerary-meta">
          <div className="itinerary-locations">
            <span className="location">{itinerary.source}</span>
            <i className="fas fa-long-arrow-alt-right"></i>
            <span className="location">{itinerary.destination}</span>
          </div>
          <div className="itinerary-dates">
            {itinerary.startDate && (
              <>
                <i className="far fa-calendar-alt"></i>
                <span>{formatDate(itinerary.startDate)}</span>
                {itinerary.endDate && (
                  <>
                    <span> - </span>
                    <span>{formatDate(itinerary.endDate)}</span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        <div className="itinerary-actions">
          <button 
            className="edit-btn"
            onClick={() => navigate(`/itinerary/edit/${id}`)}
          >
            <i className="fas fa-edit"></i> Edit
          </button>
          <button 
            className="ai-btn"
            onClick={handleGenerateAIItinerary}
            disabled={generatingAI}
          >
            {generatingAI ? (
              <>
                <div className="spinner-small"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <i className="fas fa-magic"></i>
                <span>Generate AI Suggestions</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="itinerary-tabs">
        <button 
          className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          <i className="fas fa-calendar-alt"></i>
          <span>Timeline</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          <i className="fas fa-map-marked-alt"></i>
          <span>Map</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          <i className="fas fa-lightbulb"></i>
          <span>Recommendations</span>
        </button>
      </div>

      <div className="itinerary-content">
        {activeTab === 'timeline' && (
          <div className="timeline-view">
            <div className="day-selector">
              {itinerary.dayPlans?.map((day) => (
                <button 
                  key={day.day}
                  className={`day-btn ${selectedDay === day.day ? 'active' : ''}`}
                  onClick={() => setSelectedDay(day.day)}
                >
                  Day {day.day}
                </button>
              ))}
            </div>
            <div className="day-details">
              {itinerary.dayPlans?.find(day => day.day === selectedDay) ? (
                <ItineraryDayDetail 
                  day={itinerary.dayPlans.find(day => day.day === selectedDay)} 
                />
              ) : (
                <div className="no-data-message">No details available for this day.</div>
              )}
            </div>
            <ItineraryTimeline 
              dayPlans={itinerary.dayPlans || []} 
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
          </div>
        )}

        {activeTab === 'map' && (
          <ItineraryMap 
            itinerary={itinerary}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
          />
        )}

        {activeTab === 'recommendations' && (
          <ItineraryAIRecommendations 
            itinerary={itinerary}
            onGenerateRecommendations={handleGenerateAIItinerary}
            loading={generatingAI}
          />
        )}
      </div>
    </div>
  );
};

export default ItineraryDetail;