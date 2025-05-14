import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import wishlistService from '../../services/wishlistService';
import WishlistItem from './WishlistItem';
import { Form, Button, InputGroup } from 'react-bootstrap';
import '../../styles/Wishlist.css';

const Wishlist = () => {
  const { currentUser } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch wishlist on component mount
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        const items = await wishlistService.getWishlist(currentUser.uid);
        setWishlistItems(items);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        toast.error('Failed to load your wishlist');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWishlist();
  }, [currentUser]);

  // Handle removing item from wishlist
  const handleRemoveItem = async (itemId) => {
    try {
      await wishlistService.removeFromWishlist(currentUser.uid, itemId);
      setWishlistItems(prevItems => prevItems.filter(item => item._id !== itemId));
      toast.success('Item removed from wishlist');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item from wishlist');
    }
  };

  // Filter and sort wishlist items
  const filteredAndSortedItems = () => {
    let filtered = [...wishlistItems];
    
    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.itemType === filterType);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(term) || 
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.location && item.location.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = (a.price || 0) - (b.price || 0);
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case 'dateAdded':
        default:
          comparison = new Date(a.addedAt) - new Date(b.addedAt);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  };

  // Get the filtered and sorted items
  const displayItems = filteredAndSortedItems();

  // Clear all filters
  const clearFilters = () => {
    setFilterType('all');
    setSearchTerm('');
    setSortBy('dateAdded');
    setSortOrder('desc');
  };

  if (!currentUser) {
    return (
      <div className="text-center my-5">
        <h4>You need to be logged in to view your wishlist</h4>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <h3>My Wishlist</h3>
        <p className="text-muted">
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>
      
      {wishlistItems.length > 0 ? (
        <>
          <div className="wishlist-filters">
            <div className="row">
              <div className="col-md-4 mb-3">
                <InputGroup>
                  <InputGroup.Text>
                    <i className="fas fa-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search wishlist..."
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
              
              <div className="col-md-3 mb-3">
                <Form.Select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="hotel">Hotels</option>
                  <option value="destination">Destinations</option>
                  <option value="trip">Trips</option>
                  <option value="attraction">Attractions</option>
                </Form.Select>
              </div>
              
              <div className="col-md-3 mb-3">
                <Form.Select 
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                  }}
                >
                  <option value="dateAdded-desc">Newest First</option>
                  <option value="dateAdded-asc">Oldest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="rating-desc">Highest Rated</option>
                </Form.Select>
              </div>
              
              <div className="col-md-2 mb-3">
                <Button 
                  variant="outline-secondary" 
                  className="w-100"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
          
          {displayItems.length === 0 ? (
            <div className="text-center my-5">
              <p>No items match your search criteria</p>
              <Button 
                variant="outline-primary"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="wishlist-items-grid">
              {displayItems.map(item => (
                <WishlistItem 
                  key={item._id} 
                  item={item} 
                  onRemove={handleRemoveItem} 
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="empty-wishlist">
          <div className="text-center my-5">
            <div className="empty-wishlist-icon">
              <i className="fas fa-heart"></i>
            </div>
            <h4>Your wishlist is empty</h4>
            <p className="text-muted">
              Start exploring and save your favorite hotels, destinations, and attractions!
            </p>
            <div className="mt-4">
              <Button 
                variant="primary" 
                onClick={() => window.location.href = '/hotels'}
              >
                Explore Hotels
              </Button>
              <Button 
                variant="outline-primary" 
                className="ms-3"
                onClick={() => window.location.href = '/destinations'}
              >
                Discover Destinations
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
