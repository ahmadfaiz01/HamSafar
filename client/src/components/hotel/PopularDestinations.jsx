import React from 'react';
import Loading from '../common/Loading';

// Custom image mapping for Pakistani cities
const cityImages = {
  'Islamabad': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Faisal_Masjid_From_Damn_e_koh.jpg',
  'Lahore': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Shahi_Masjid_Lahore.jpg/960px-Shahi_Masjid_Lahore.jpg',
  'Karachi': 'https://i.pinimg.com/564x/cf/8b/2c/cf8b2cdaec2c33993aac1253d16532bc.jpg',
  'Murree': 'https://www.exploria.pk/wp-content/uploads/2023/04/shimla-christ-church-Murree-Never-Forgot-Alyan-Khan-blogger-1280x720-1.jpg.webp',
  'Swat': 'https://miro.medium.com/v2/resize:fit:1024/1*B51gK3scDM4H-dJU1tUdQA.jpeg',
  'Naran': 'https://tourism.punjab.gov.pk/system/files/naran1.jpg',
  'Hunza': 'https://www.pakistantours.pk/wp-content/uploads/2022/10/Karakoram-Highway-tours.jpg',
  'Skardu': 'https://gilgitbaltistandiscoveries.com/wp-content/uploads/2024/03/Best-Things-to-Do-in-Skardu-Gilgit-Baltistan.jpg',
  'Peshawar': 'https://www.salamair.com/images/des1/pexels-raqeeb-ahmed-5838446.jpg',
  'Multan': 'https://www.saoarchitects.com/images-o/images/shah-rukn-e-alam.jpg',
};

const PopularDestinations = ({ destinations, loading, onSelectDestination }) => {
  if (loading) {
    return <Loading message="Loading popular destinations..." />;
  }
  
  // Function to get the appropriate image for a city
  const getDestinationImage = (cityName) => {
    return cityImages[cityName] || cityImages.default;
  };
  
  return (
    <div className="featured-destinations">
      <div className="container">
        <h2 className="section-title">Popular Destinations in Pakistan</h2>
        <div className="row">
          {destinations.map((destination, index) => (
            <div key={index} className="col-md-4 col-lg-3 mb-4">
              <div 
                className="destination-card"
                onClick={() => onSelectDestination(destination.name)}
                style={{ 
                  backgroundImage: `url(${getDestinationImage(destination.name)})`,
                  cursor: 'pointer'
                }}
              >
                <div className="destination-content">
                  <h3>{destination.name}</h3>
                  <p>{destination.properties} properties</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularDestinations;