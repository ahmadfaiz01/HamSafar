import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import '../../styles/CreateTripButton.css';

const CreateTripButton = () => {
  return (
    <Link to="/trips/create" className="create-trip-button">
      <FaPlus /> Create New Trip
    </Link>
  );
};

export default CreateTripButton;