import React, { useState } from 'react';
import { FiPlus, FiClock, FiMap, FiDollarSign, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { updateTrip } from '../../services/tripService';
import { useAuth } from '../../context/AuthContext';
import '../../styles/TripDayPlanner.css';

const TripDayPlanner = ({ trip, activeDay, setTrip }) => {
  const { currentUser } = useAuth();
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [newActivity, setNewActivity] = useState({
    name: '',
    category: 'sightseeing',
    startTime: '09:00',
    endTime: '11:00',
    location: {
      type: 'Point',
      coordinates: [0, 0]
    },
    description: '',
    cost: ''
  });
  
  const activeDayData = trip.days.find(day => day.day === activeDay) || { day: activeDay, activities: [] };
  
  const categories = [
    { value: 'sightseeing', label: 'Sightseeing' },
    { value: 'food', label: 'Food & Drink' },
    { value: 'activity', label: 'Activity' },
    { value: 'transport', label: 'Transportation' },
    { value: 'accommodation', label: 'Accommodation' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'other', label: 'Other' }
  ];
  
  const handleActivityChange = (e) => {
    const { name, value } = e.target;
    setNewActivity(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddActivity = async () => {
    if (!newActivity.name) {
      alert('Activity name is required');
      return;
    }
    
    setLoading(true);
    
    try {
      const updatedDays = [...trip.days];
      const dayIndex = updatedDays.findIndex(day => day.day === activeDay);
      
      if (dayIndex === -1) {
        // Day doesn't exist, create it
        updatedDays.push({
          day: activeDay,
          activities: [{ ...newActivity, id: Date.now().toString() }]
        });
      } else {
        // Add activity to existing day
        if (editingActivityId) {
          // Update existing activity
          const activityIndex = updatedDays[dayIndex].activities.findIndex(
            act => act.id === editingActivityId
          );
          
          if (activityIndex !== -1) {
            updatedDays[dayIndex].activities[activityIndex] = {
              ...newActivity,
              id: editingActivityId
            };
          }
        } else {
          // Add new activity
          updatedDays[dayIndex].activities.push({
            ...newActivity,
            id: Date.now().toString()
          });
        }
      }
      
      // Sort days by day number
      updatedDays.sort((a, b) => a.day - b.day);
      
      // Sort activities by start time
      updatedDays.forEach(day => {
        day.activities.sort((a, b) => {
          const timeA = a.startTime.replace(':', '');
          const timeB = b.startTime.replace(':', '');
          return parseInt(timeA) - parseInt(timeB);
        });
      });
      
      const updatedTrip = {
        ...trip,
        days: updatedDays
      };
      
      // Update in backend
      await updateTrip(trip._id, {
        userId: currentUser.uid,
        days: updatedDays
      });
      
      // Update local state
      setTrip(updatedTrip);
      
      // Reset form
      setNewActivity({
        name: '',
        category: 'sightseeing',
        startTime: '09:00',
        endTime: '11:00',
        location: {
          type: 'Point',
          coordinates: [0, 0]
        },
        description: '',
        cost: ''
      });
      
      setIsAddingActivity(false);
      setEditingActivityId(null);
      
    } catch (error) {
      console.error('Error adding activity:', error);
      alert('Failed to update trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditActivity = (activity) => {
    setNewActivity({
      name: activity.name,
      category: activity.category,
      startTime: activity.startTime,
      endTime: activity.endTime,
      location: activity.location || {
        type: 'Point',
        coordinates: [0, 0]
      },
      description: activity.description || '',
      cost: activity.cost || ''
    });
    
    setEditingActivityId(activity.id);
    setIsAddingActivity(true);
  };
  
  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const updatedDays = [...trip.days];
      const dayIndex = updatedDays.findIndex(day => day.day === activeDay);
      
      if (dayIndex !== -1) {
        updatedDays[dayIndex].activities = updatedDays[dayIndex].activities.filter(
          act => act.id !== activityId
        );
        
        const updatedTrip = {
          ...trip,
          days: updatedDays
        };
        
        // Update in backend
        await updateTrip(trip._id, {
          userId: currentUser.uid,
          days: updatedDays
        });
        
        // Update local state
        setTrip(updatedTrip);
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Failed to delete activity. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const getCategoryLabel = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };
  
  return (
    <div className="day-planner">
      <div className="day-header">
        <h3>Day {activeDay} - {new Date(trip.startDate).getTime() + (activeDay - 1) * 24 * 60 * 60 * 1000}</h3>
      </div>
      
      <div className="day-timeline">
        {activeDayData.activities.length === 0 ? (
          <div className="empty-day">
            <p>No activities planned for this day yet.</p>
            <button className="btn-secondary" onClick={() => setIsAddingActivity(true)}>
              <FiPlus /> Add First Activity
            </button>
          </div>
        ) : (
          <div className="timeline">
            {activeDayData.activities.map((activity, index) => (
              <div key={activity.id || index} className="timeline-item">
                <div className="timeline-time">
                  <div>{activity.startTime}</div>
                  <div className="timeline-line"></div>
                  <div>{activity.endTime}</div>
                </div>
                
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h4>{activity.name}</h4>
                    <div className="activity-actions">
                      <button className="btn-icon small" onClick={() => handleEditActivity(activity)}>
                        <FiEdit2 />
                      </button>
                      <button className="btn-icon small delete" onClick={() => handleDeleteActivity(activity.id)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  
                  <div className="timeline-category">
                    {getCategoryLabel(activity.category)}
                  </div>
                  
                  {activity.description && (
                    <div className="timeline-description">
                      {activity.description}
                    </div>
                  )}
                  
                  <div className="timeline-details">
                    {activity.cost && (
                      <div className="detail-item">
                        <FiDollarSign /> ${activity.cost}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <button className="add-activity-btn" onClick={() => setIsAddingActivity(true)}>
              <FiPlus /> Add Activity
            </button>
          </div>
        )}
        
        {isAddingActivity && (
          <div className="activity-form-overlay">
            <div className="activity-form">
              <h3>{editingActivityId ? 'Edit Activity' : 'Add New Activity'}</h3>
              
              <div className="form-group">
                <label htmlFor="name">Activity Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newActivity.name}
                  onChange={handleActivityChange}
                  placeholder="e.g., Visit Eiffel Tower"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={newActivity.category}
                    onChange={handleActivityChange}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="cost">Cost ($)</label>
                  <input
                    type="number"
                    id="cost"
                    name="cost"
                    value={newActivity.cost}
                    onChange={handleActivityChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startTime">Start Time</label>
                  <div className="time-input">
                    <FiClock className="input-icon" />
                    <input
                      type="time"
                      id="startTime"
                      name="startTime"
                      value={newActivity.startTime}
                      onChange={handleActivityChange}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="endTime">End Time</label>
                  <div className="time-input">
                    <FiClock className="input-icon" />
                    <input
                      type="time"
                      id="endTime"
                      name="endTime"
                      value={newActivity.endTime}
                      onChange={handleActivityChange}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  value={newActivity.description}
                  onChange={handleActivityChange}
                  placeholder="Add any details about this activity"
                  rows="2"
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => {
                    setIsAddingActivity(false);
                    setEditingActivityId(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={handleAddActivity}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : editingActivityId ? 'Update Activity' : 'Add Activity'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripDayPlanner;