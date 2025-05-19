import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faLocationDot, faHeart } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const RecommendationSlider = ({ title, type = 'personalized', category, limit = 10 }) => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        let endpoint = '/api/recommendations/personalized';
        
        if (type === 'category' && category) {
          endpoint = `/api/recommendations/category/${category}`;
        } else if (type === 'all') {
          endpoint = '/api/recommendations/destinations';
        }
        
        const response = await axios.get(endpoint, {
          params: { limit }
        });
        
        if (response.data && response.data.success) {
          setPlaces(response.data.data);
        } else {
          throw new Error('Failed to fetch recommendations');
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Unable to load recommendations');
        // Use fallback data
        setPlaces(getFallbackPlaces());
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [type, category, limit]);

  // Fallback data if API fails
  const getFallbackPlaces = () => {
    return [
      {
        id: '1',
        name: 'Faisal Mosque',
        category: 'Historical',
        city: 'Islamabad',
        rating: 4.8,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Faisal_Mosque_%28full_view%29.jpg/1280px-Faisal_Mosque_%28full_view%29.jpg'
      },
      {
        id: '2',
        name: 'Badshahi Mosque',
        category: 'Historical',
        city: 'Lahore',
        rating: 4.7,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Badshahi_Mosque_front_picture.jpg/1280px-Badshahi_Mosque_front_picture.jpg'
      }
    ];
  };

  if (loading) {
    return (
      <div className="recommendation-slider-container">
        <h2>{title || 'Recommended Places'}</h2>
        <div className="d-flex justify-content-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendation-slider-container">
        <h2>{title || 'Recommended Places'}</h2>
        <div className="alert alert-warning">{error}</div>
      </div>
    );
  }

  return (
    <div className="recommendation-slider-container mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="m-0">{title || 'Recommended Places'}</h2>
        <Link to="/recommendations" className="btn btn-outline-primary btn-sm">View All</Link>
      </div>
      
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          640: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 30,
          },
        }}
      >
        {places.map((place) => (
          <SwiperSlide key={place.id}>
            <div className="recommendation-card">
              <div 
                className="recommendation-image"
                style={{ backgroundImage: `url(${place.imageUrl})` }}
              >
                <div className="recommendation-category">
                  {place.category}
                </div>
                <button className="wishlist-btn">
                  <FontAwesomeIcon icon={faHeart} />
                </button>
              </div>
              <div className="recommendation-content">
                <h5>{place.name}</h5>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="location">
                    <FontAwesomeIcon icon={faLocationDot} className="me-1" />
                    {place.city}
                  </div>
                  <div className="rating">
                    <FontAwesomeIcon icon={faStar} className="me-1 text-warning" />
                    {place.rating}
                  </div>
                </div>
                <Link to={`/destinations/${place.id}`} className="stretched-link"></Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default RecommendationSlider;