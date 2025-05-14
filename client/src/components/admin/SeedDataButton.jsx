import React, { useState } from 'react';
import { seedAttractions } from '../../services/seedAttractions';
import { toast } from 'react-toastify';
import './SeedDataButton.css';

const SeedDataButton = () => {
  const [loading, setLoading] = useState(false);
  
  const handleSeed = async () => {
    try {
      setLoading(true);
      await seedAttractions();
      toast.success('Sample attractions added successfully!');
    } catch (error) {
      console.error('Error seeding data:', error);
      toast.error('Failed to seed sample data');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button 
      className="seed-data-button"
      onClick={handleSeed}
      disabled={loading}
    >
      {loading ? 'Adding Sample Data...' : 'Add Sample Attractions'}
    </button>
  );
};

export default SeedDataButton;