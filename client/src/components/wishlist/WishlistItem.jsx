import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../../styles/Wishlist.css';

const WishlistItem = ({ item, onRemove }) => {
  // Generate the correct link based on item type
  const getItemLink = () => {
    switch (item.itemType) {
      case 'hotel':
        return `/hotels/${item.itemId}`;
      case 'destination':
        return `/destinations/${item.itemId}`;
      case 'trip':
        return `/trips/${item.itemId}`;
      case 'attraction':
        return `/attractions/${item.itemId}`;
      default:
        return '#';
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <Card className="wishlist-item">
      <div className="wishlist-item-image">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="wishlist-item-img"
          />
        ) : (
          <div className="wishlist-item-img-placeholder">
            <i className="fas fa-image"></i>
          </div>
        )}
        <div className="wishlist-item-badge">
          {item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1)}
        </div>
      </div>
      
      <Card.Body>
        <Card.Title>{item.name}</Card.Title>
        
        {item.location && (
          <div className="wishlist-item-location">
            <i className="fas fa-map-marker-alt me-2"></i>
            {item.location}
          </div>
        )}
        
        {item.description && (
          <Card.Text className="wishlist-item-description">
            {item.description.length > 100 
              ? `${item.description.substring(0, 100)}...` 
              : item.description}
          </Card.Text>
        )}
        
        {item.price && (
          <div className="wishlist-item-price">
            <i className="fas fa-tag me-2"></i>
            Rs. {item.price.toLocaleString()}
          </div>
        )}
        
        {item.rating && (
          <div className="wishlist-item-rating">
            <i className="fas fa-star me-2"></i>
            {item.rating.toFixed(1)}
          </div>
        )}
        
        <div className="wishlist-item-added">
          Added on {formatDate(item.addedAt)}
        </div>
        
        <div className="wishlist-item-actions">
          <Link to={getItemLink()} className="btn btn-outline-primary">
            View Details
          </Link>
          <Button 
            variant="outline-danger" 
            onClick={() => onRemove(item._id)}
          >
            <i className="fas fa-trash-alt me-2"></i>
            Remove
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default WishlistItem;
