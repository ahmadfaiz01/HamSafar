import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Form, InputGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import mapService from '../services/mapService';
import { toast } from 'react-toastify';

const SavedPlaces = () => {
  const { currentUser } = useAuth();
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Places' },
    { id: 'restaurant', name: 'Restaurants' },
    { id: 'attraction', name: 'Attractions' },
    { id: 'hotel', name: 'Hotels' },
    { id: 'shopping', name: 'Shopping' }
  ];
  
  // Fetch saved places
  useEffect(() => {
    const fetchSavedPlaces = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        const savedPlaces = await mapService.getSavedPlaces(currentUser.uid);
        setPlaces(savedPlaces);
      } catch (error) {
        console.error('Error fetching saved places:', error);
        toast.error('Failed to load your saved places');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSavedPlaces();
  }, [currentUser]);
  
  // Filter places based on search term and category
  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          place.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Remove a place from saved places
  const handleRemovePlace = async (placeId) => {
    try {
      await mapService.deleteSavedPlace(placeId);
      setPlaces(places.filter(place => place._id !== placeId));
      toast.success('Place removed from your saved places');
    } catch (error) {
      console.error('Error removing place:', error);
      toast.error('Failed to remove place');
    }
  };
  
  // Add a place to a trip (simplified, would normally open a modal to select trip)
  // eslint-disable-next-line no-unused-vars
  const handleAddToTrip = (place) => {
    toast.info('This functionality will be implemented in the next phase!');
  };
  
  if (!currentUser) {
    return (
      <div className="text-center my-5">
        <h4>You need to be logged in to view your saved places</h4>
        <Link to="/login" className="btn btn-primary mt-3">
          Log In
        </Link>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading your saved places...</p>
      </div>
    );
  }
  
  return (
    <div className="saved-places-container">
      <h2 className="mb-4">My Saved Places</h2>
      
      <div className="filter-container mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <InputGroup>
              <InputGroup.Text>
                <i className="fas fa-search"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search places..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button 
                  variant="outline-secondary"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="fas fa-times"></i>
                </Button>
              )}
            </InputGroup>
          </div>
          
          <div className="col-md-6">
            <div className="category-filter">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "primary" : "outline-primary"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="me-2 mb-2"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {places.length === 0 ? (
        <div className="text-center my-5">
          <div className="mb-4">
            <i className="fas fa-map-marker-alt fa-3x text-muted"></i>
          </div>
          <h4>No saved places yet</h4>
          <p className="text-muted">
            Explore the map to find and save interesting places for your future trips!
          </p>
          <Link to="/map" className="btn btn-primary mt-2">
            <i className="fas fa-map me-2"></i>
            Explore Map
          </Link>
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="text-center my-5">
          <p>No places match your search criteria</p>
          <Button 
            variant="outline-primary"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="row">
          {filteredPlaces.map(place => (
            <div key={place._id} className="col-md-6 col-lg-4 mb-4">
              <Card className="h-100 place-card">
                {place.photo ? (
                  <Card.Img 
                    variant="top" 
                    src={place.photo} 
                    alt={place.name} 
                    className="place-card-img"
                  />
                ) : (
                  <div className="place-card-img-placeholder">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                )}
                <Card.Body>
                  <Card.Title>{place.name}</Card.Title>
                  <div className="place-card-address">
                    <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                    {place.address}
                  </div>
                  {place.category && (
                    <div className="place-category-badge">
                      {place.category}
                    </div>
                  )}
                  {place.notes && (
                    <Card.Text className="place-notes mt-2">
                      {place.notes}
                    </Card.Text>
                  )}
                </Card.Body>
                <Card.Footer className="bg-white">
                  <div className="d-flex justify-content-between">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleAddToTrip(place)}
                    >
                      <i className="fas fa-plus me-1"></i> Add to Trip
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleRemovePlace(place._id)}
                    >
                      <i className="fas fa-trash me-1"></i> Remove
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPlaces;
