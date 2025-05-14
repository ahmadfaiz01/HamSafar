import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItineraryById, generateAIItinerary } from '../services/itineraryService';
import ItineraryTimeline from '../components/itinerary/ItineraryTimeline';
import ItineraryDayDetail from '../components/itinerary/ItineraryDayDetail';
import ItineraryMap from '../components/itinerary/ItineraryMap';
import ItineraryAIRecommendations from '../components/itinerary/ItineraryAIRecommendations';
import '../styles/ItineraryDetail.css';

const ItineraryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline');
  const [selectedDay, setSelectedDay] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getItineraryById(id);
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
  }, [id]);

  const handleGenerateAIItinerary = async () => {
    try {
      setGeneratingAI(true);
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
      <div className="not-found-container">
        <h2>Itinerary Not Found</h2>
        <p>The itinerary you're looking for doesn't exist or has been deleted.</p>
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
      <div className="itinerary-detail-header">
        <div className="header-info">
          <h1>{itinerary.title}</h1>
          <div className="itinerary-meta">
            <div className="meta-item">
              <i className="far fa-calendar-alt"></i>
              <span>{formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}</span>
            </div>
            <div className="meta-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>
                {itinerary.destinations && itinerary.destinations.length > 0
                  ? itinerary.destinations.map(d => d.name).join(' → ')
                  : 'No destinations added'}
              </span>
            </div>
            <div className="meta-item">
              <i className="fas fa-wallet"></i>
              <span>Budget: PKR {itinerary.totalBudget?.toLocaleString()}</span>
            </div>
            <div className="meta-item">
              <i className="fas fa-tag"></i>
              <span className={`status ${itinerary.status}`}>
                {itinerary.status.charAt(0).toUpperCase() + itinerary.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          {itinerary.days && itinerary.days.length > 0 ? (
            <button 
              className="ai-generate-btn"
              onClick={handleGenerateAIItinerary}
              disabled={generatingAI}
            >
              {generatingAI ? 'Generating...' : 'Regenerate with AI'}
            </button>
          ) : (
            <button 
              className="ai-generate-btn primary"
              onClick={handleGenerateAIItinerary}
              disabled={generatingAI}
            >
              {generatingAI ? 'Generating...' : 'Generate Itinerary with AI'}
            </button>
          )}
          <button 
            className="edit-btn"
            onClick={() => navigate(`/itinerary/edit/${id}`)}
          >
            Edit Itinerary
          </button>
          <button 
            className="back-btn"
            onClick={() => navigate('/itinerary')}
          >
            Back to All Itineraries
          </button>
        </div>
      </div>
      
      <div className="itinerary-detail-tabs">
        <button 
          className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline
        </button>
        <button 
          className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          Map View
        </button>
        <button 
          className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          AI Recommendations
        </button>
      </div>
      
      <div className="itinerary-detail-content">
        {activeTab === 'timeline' && (
          <div className="timeline-view">
            {itinerary.days && itinerary.days.length > 0 ? (
              <div className="timeline-layout">
                <div className="timeline-sidebar">
                  <ItineraryTimeline 
                    days={itinerary.days} 
                    selectedDay={selectedDay}
                    onDaySelect={setSelectedDay}
                  />
                </div>
                <div className="timeline-main">
                  <ItineraryDayDetail 
                    day={itinerary.days.find(d => d.dayNumber === selectedDay)}
                    destinations={itinerary.destinations}
                  />
                </div>
              </div>
            ) : (
              <div className="no-itinerary-days">
                <h3>No Itinerary Details Yet</h3>
                <p>Generate an AI-powered itinerary to see a day-by-day breakdown of your trip.</p>
                <button 
                  className="generate-btn"
                  onClick={handleGenerateAIItinerary}
                  disabled={generatingAI}
                >
                  {generatingAI ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'map' && (
          <ItineraryMap 
            destinations={itinerary.destinations}
            days={itinerary.days}
          />
        )}
        
        {activeTab === 'recommendations' && (
          <ItineraryAIRecommendations 
            recommendations={itinerary.aiRecommendations}
            isGenerating={generatingAI}
            onGenerateRecommendations={handleGenerateAIItinerary}
          />
        )}
      </div>
    </div>
  );
};

export default ItineraryDetail;