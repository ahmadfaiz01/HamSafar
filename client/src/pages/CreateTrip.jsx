import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createTrip } from '../services/tripService';
import { getPopularDestinations } from '../services/hotelService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/CreateTrip.css';

const CreateTrip = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [popularDestinations, setPopularDestinations] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    city: '',
    country: '',
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    totalBudget: '',
    notes: '',
    categories: []
  });

  const categories = [
    'beach', 'mountains', 'city', 'cultural', 'adventure', 
    'relaxation', 'food', 'family', 'romantic', 'budget'
  ];

  React.useEffect(() => {
    const loadDestinations = async () => {
      try {
        const data = await getPopularDestinations();
        setPopularDestinations(data);
      } catch (err) {
        console.error('Failed to load popular destinations', err);
      }
    };
    
    loadDestinations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => {
      const updatedCategories = [...prev.categories];
      
      if (updatedCategories.includes(category)) {
        return {
          ...prev,
          categories: updatedCategories.filter(c => c !== category)
        };
      } else {
        return {
          ...prev,
          categories: [...updatedCategories, category]
        };
      }
    });
  };

  const handleDestinationSelect = (destination) => {
    setFormData(prev => ({
      ...prev,
      city: destination.city,
      country: destination.country
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      if (!formData.title || !formData.city || !formData.country) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      const tripData = {
        userId: currentUser.uid,
        title: formData.title,
        destination: {
          city: formData.city,
          country: formData.country
        },
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalBudget: parseFloat(formData.totalBudget) || 0,
        notes: formData.notes,
        categories: formData.categories,
        days: []
      };
      
      const newTrip = await createTrip(tripData);
      navigate(`/trips/${newTrip._id}/plan`);
    } catch (err) {
      console.error('Failed to create trip:', err);
      setError('Failed to create trip. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="create-trip-container">
      <h1>Create New Trip</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="create-trip-form">
        <div className="form-group">
          <label htmlFor="title">Trip Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Summer Vacation 2023"
            required
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">City *</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Paris"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="country">Country *</label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="France"
              required
            />
          </div>
        </div>
        
        {popularDestinations.length > 0 && (
          <div className="popular-destinations">
            <h3>Popular Destinations</h3>
            <div className="destinations-grid">
              {popularDestinations.slice(0, 6).map((dest, index) => (
                <div 
                  key={index}
                  className="destination-item"
                  onClick={() => handleDestinationSelect(dest)}
                >
                  <span>{dest.city}, {dest.country}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <DatePicker
              selected={formData.startDate}
              onChange={date => setFormData(prev => ({ ...prev, startDate: date }))}
              selectsStart
              startDate={formData.startDate}
              endDate={formData.endDate}
              minDate={new Date()}
              className="date-picker"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <DatePicker
              selected={formData.endDate}
              onChange={date => setFormData(prev => ({ ...prev, endDate: date }))}
              selectsEnd
              startDate={formData.startDate}
              endDate={formData.endDate}
              minDate={formData.startDate}
              className="date-picker"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="totalBudget">Total Budget</label>
          <input
            type="number"
            id="totalBudget"
            name="totalBudget"
            value={formData.totalBudget}
            onChange={handleChange}
            placeholder="Enter your budget"
          />
        </div>
        
        <div className="form-group">
          <label>Trip Categories</label>
          <div className="categories-grid">
            {categories.map(category => (
              <div 
                key={category}
                className={`category-tag ${formData.categories.includes(category) ? 'selected' : ''}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional notes about your trip..."
            rows={4}
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => navigate('/trips')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Trip'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTrip;