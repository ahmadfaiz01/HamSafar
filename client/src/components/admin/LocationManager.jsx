import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createPointOfInterest } from '../../services/locationService';
import { seedSamplePOIs } from '../../utils/seedLocations';
import { toast } from 'react-toastify';

const LocationManager = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Attraction',
    description: '',
    latitude: '',
    longitude: '',
    imageUrl: '',
    tags: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const poiData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        coordinates: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        },
        imageUrl: formData.imageUrl,
        tags: formData.tags.split(',').map(tag => tag.trim().toLowerCase()),
        createdAt: new Date()
      };
      
      await createPointOfInterest(poiData);
      
      toast.success(`Added ${formData.name} to locations`);
      
      // Reset form
      setFormData({
        name: '',
        category: 'Attraction',
        description: '',
        latitude: '',
        longitude: '',
        imageUrl: '',
        tags: ''
      });
      
    } catch (error) {
      console.error('Error adding location:', error);
      toast.error('Failed to add location');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    try {
      setLoading(true);
      const result = await seedSamplePOIs();
      
      if (result) {
        toast.success('Successfully added sample locations');
      } else {
        toast.error('Failed to add sample locations');
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      toast.error('Failed to seed data');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin
  // This assumes you have admin field in your user's custom claims
  const isAdmin = currentUser?.claims?.admin === true;

  if (!currentUser || !isAdmin) {
    return (
      <div className="admin-unauthorized">
        <h2>Unauthorized</h2>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="admin-location-manager">
      <h2>Manage Locations</h2>

      <div className="admin-controls">
        <button 
          className="seed-data-btn" 
          onClick={handleSeedData} 
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Seed Sample Locations'}
        </button>
      </div>

      <div className="add-location-form">
        <h3>Add New Location</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input 
              type="text" 
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select 
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="Attraction">Attraction</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Cafe">Cafe</option>
              <option value="Park">Park</option>
              <option value="Museum">Museum</option>
              <option value="Shopping">Shopping</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Beach">Beach</option>
              <option value="Mountain">Mountain</option>
              <option value="Historical">Historical</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea 
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="latitude">Latitude</label>
              <input 
                type="number" 
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                required
                step="any" 
              />
            </div>

            <div className="form-group">
              <label htmlFor="longitude">Longitude</label>
              <input 
                type="number" 
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                required
                step="any" 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">Image URL</label>
            <input 
              type="url" 
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma separated)</label>
            <input 
              type="text" 
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g. nature,hiking,family" 
            />
          </div>

          <button 
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Location'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LocationManager;