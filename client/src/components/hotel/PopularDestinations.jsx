import React from 'react';
import { Link } from 'react-router-dom';
import './PopularDestinations.css';

const PopularDestinations = ({ destinations = [], loading = false, onSelectDestination }) => {
  // Select the top 8 destinations instead of 6
  const topDestinations = destinations.slice(0, 8);
  
  // If we don't have enough destinations, add placeholder destinations to reach 8
  const ensureEightDestinations = () => {
    if (topDestinations.length >= 8) return topDestinations;
    
    // Fill the array with additional destinations to make it 8
    const additionalDestinations = [
      { name: 'Islamabad', properties: 2 },
      { name: 'Hunza', properties: 1 },
      { name: 'Kaghan', properties: 1 },
      { name: 'Peshawar', properties: 1 }
    ];
    
    // Only add enough to reach 8 total
    const needed = 8 - topDestinations.length;
    const fillers = additionalDestinations.slice(0, needed);
    
    return [...topDestinations, ...fillers];
  };
  
  const destinationsToShow = ensureEightDestinations();
  
  // Map destination names to image URLs
  const getDestinationImage = (name) => {
    const imageMap = {
  'default': 'https://upload.wikimedia.org/wikipedia/commons/3/36/Mohenjo-daro_Sindh.jpg',
  'Islamabad': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Faisal_Masjid_From_Damn_e_koh.jpg',
  'Lahore': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Shahi_Masjid_Lahore.jpg/960px-Shahi_Masjid_Lahore.jpg',
  'Karachi': 'https://i.pinimg.com/564x/cf/8b/2c/cf8b2cdaec2c33993aac1253d16532bc.jpg',
  'Murree': 'https://www.exploria.pk/wp-content/uploads/2023/04/shimla-christ-church-Murree-Never-Forgot-Alyan-Khan-blogger-1280x720-1.jpg.webp',
  'Swat': 'https://miro.medium.com/v2/resize:fit:1024/1*B51gK3scDM4H-dJU1tUdQA.jpeg',
  'Naran': 'https://tourism.punjab.gov.pk/system/files/naran1.jpg',
  'Hunza': 'https://www.pakistantours.pk/wp-content/uploads/2022/10/Karakoram-Highway-tours.jpg',
  'Skardu': 'https://gilgitbaltistandiscoveries.com/wp-content/uploads/2024/03/Best-Things-to-Do-in-Skardu-Gilgit-Baltistan.jpg',
  'Peshawar': 'https://www.salamair.com/images/des1/pexels-raqeeb-ahmed-5838446.jpg',
  'Multan': 'https://www.saoarchitects.com/images-o/images/shah-rukn-e-alam.jpg'
    };
    
    return imageMap[name] || `https://source.unsplash.com/400x300/?pakistan,${name.toLowerCase()},landscape`;
  };
  
  if (loading) {
    return (
      <div className="popular-destinations-section">
        <h2>Popular Destinations in Pakistan</h2>
        <div className="loading-skeleton">
          <div className="skeleton-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="popular-destinations-section">
      <h2>Popular Destinations in Pakistan</h2>
      <div className="destinations-underline"></div>
      
      <div className="destinations-grid">
        {destinationsToShow.map((destination) => (
          <div 
            key={destination.name}
            className="destination-card"
            onClick={() => onSelectDestination && onSelectDestination(destination.name)}
          >
            <div 
              className="destination-image"
              style={{
                backgroundImage: `url(${getDestinationImage(destination.name)})`
              }}
            >
              <div className="destination-overlay">
                <h3>{destination.name}</h3>
                <p>{destination.properties} properties</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularDestinations;