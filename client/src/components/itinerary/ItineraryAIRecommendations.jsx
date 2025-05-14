import React, { useState } from 'react';
import '../../styles/ItineraryAIRecommendations.css';

const ItineraryAIRecommendations = ({ itinerary, onGenerateRecommendations }) => {
  const [loading, setLoading] = useState(false);

  const handleGenerateRecommendations = async () => {
    if (!itinerary) return;
    
    setLoading(true);
    try {
      await onGenerateRecommendations();
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ai-loading">
        <div className="spinner"></div>
        <h3>Generating AI Recommendations</h3>
        <p>Our AI is analyzing your itinerary to suggest optimizations, attractions, and budget tips...</p>
      </div>
    );
  }

  if (!itinerary.aiRecommendations) {
    return (
      <div className="empty-recommendations">
        <h3>Get AI-Powered Recommendations</h3>
        <p>Use our AI to get personalized suggestions for your itinerary, including route optimization, attraction recommendations, and budget tips.</p>
        <button 
          className="generate-recommendations-btn"
          onClick={handleGenerateRecommendations}
        >
          Generate Recommendations
        </button>
      </div>
    );
  }

  return (
    <div className="ai-recommendations-container">
      <h2>AI Recommendations</h2>
      
      {itinerary.aiRecommendations.routeOptimization && (
        <div className="recommendation-section">
          <h3>Route Optimization</h3>
          <p>{itinerary.aiRecommendations.routeOptimization}</p>
        </div>
      )}
      
      {itinerary.aiRecommendations.attractions && (
        <div className="recommendation-section">
          <h3>Recommended Attractions</h3>
          <ul className="attractions-list">
            {itinerary.aiRecommendations.attractions.map((attraction, index) => (
              <li key={index}>{attraction}</li>
            ))}
          </ul>
        </div>
      )}
      
      {itinerary.aiRecommendations.budgetTips && (
        <div className="recommendation-section">
          <h3>Budget Tips</h3>
          <ul className="budget-tips-list">
            {itinerary.aiRecommendations.budgetTips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="ai-disclaimer">
        Note: These recommendations are AI-generated suggestions. Please verify details before making final plans.
      </div>
    </div>
  );
};

export default ItineraryAIRecommendations;
