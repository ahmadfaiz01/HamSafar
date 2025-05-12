const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hamsafar')
  .then(() => console.log('MongoDB connected for data collection'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Pakistani hotel data with real information
const pakistaniHotels = {
  'Islamabad': [
    {
      name: 'Serena Hotel',
      address: 'Khayaban-e-Suhrawardy, G-5/1, Islamabad',
      description: 'Experience ultimate luxury at Serena Hotel Islamabad, offering top-notch amenities, spacious rooms, and beautiful views of Margalla Hills.',
      rating: 5,
      userRating: 9.3,
      reviewCount: 487,
      price: 25000,
      amenities: ['Free Wi-Fi', 'Swimming Pool', 'Spa', 'Fitness Center', 'Restaurant', 'Room Service', 'Airport Shuttle', 'Conference Facilities'],
      mainImage: 'https://lh3.googleusercontent.com/p/AF1QipOYaVb35jURKF8KuH61Jnz9bCxd9JuTgA3SpLb9=s1360-w1360-h1020-rw',
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        'https://images.unsplash.com/photo-1615460549969-36fa19521a4f',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39'
      ],
      location: {
        coordinates: [33.7294, 73.0931]
      }
    },
    {
      name: 'Marriott Hotel',
      address: 'Agha Khan Road, Shalimar 5, Islamabad',
      description: 'Located in the heart of the diplomatic enclave, Islamabad Marriott Hotel offers luxurious accommodation with modern amenities and exceptional service.',
      rating: 5,
      userRating: 9.1,
      reviewCount: 423,
      price: 22000,
      amenities: ['Free Wi-Fi', 'Swimming Pool', 'Fitness Center', 'Restaurant', 'Room Service', 'Business Center', 'Concierge', 'Laundry Service'],
      mainImage: 'https://cache.marriott.com/is/image/marriotts7prod/mc-isbpk-islamabad-marriott-h33236-73715:Feature-Hor?wid=1920&fit=constrain',
      images: [
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        'https://images.unsplash.com/photo-1615460549969-36fa19521a4f'
      ],
      location: {
        coordinates: [33.7369, 73.0841]
      }
    }
  ],
  'Lahore': [
    {
      name: 'Pearl Continental Lahore',
      address: 'Shahrah-e-Quaid-e-Azam, Lahore',
      description: 'Pearl Continental Lahore offers a perfect blend of luxury and comfort with exceptional dining options and facilities in the cultural heart of Pakistan.',
      rating: 5,
      userRating: 9.2,
      reviewCount: 512,
      price: 24000,
      amenities: ['Free Wi-Fi', 'Swimming Pool', 'Spa', 'Fitness Center', 'Restaurant', 'Room Service', 'Business Center', 'Concierge'],
      mainImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/55/63/30/pearl-continental-lahore.jpg?w=500&h=-1&s=1',
      images: [
        'https://images.unsplash.com/photo-1615460549969-36fa19521a4f',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945'
      ],
      location: {
        coordinates: [31.5546, 74.3572]
      }
    },
    {
      name: 'Avari Hotel Lahore',
      address: '87 Shahrah-e-Quaid-e-Azam, Lahore',
      description: 'Avari Hotel offers world-class accommodation in Lahore with rich cultural heritage and modern amenities for business and leisure travelers.',
      rating: 4.5,
      userRating: 8.9,
      reviewCount: 378,
      price: 19000,
      amenities: ['Free Wi-Fi', 'Swimming Pool', 'Fitness Center', 'Restaurant', 'Room Service', 'Business Center', 'Laundry Service'],
      mainImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/27/16/b5/28/avari-hotel-lahore.jpg?w=900&h=500&s=1',
      images: [
        'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa',
        'https://images.unsplash.com/photo-1595576508898-0ad5c879a061',
        'https://images.unsplash.com/photo-1568084680786-a84f91d1153c'
      ],
      location: {
        coordinates: [31.5604, 74.3288]
      }
    }
  ],
  'Karachi': [
    {
      name: 'Pearl Continental Karachi',
      address: 'Dr Ziauddin Ahmed Road, Civil Lines, Karachi',
      description: 'A luxury hotel in the heart of Karachi offering excellent amenities and exceptional service for business and leisure travelers.',
      rating: 5,
      userRating: 9.0,
      reviewCount: 498,
      price: 23000,
      amenities: ['Free Wi-Fi', 'Swimming Pool', 'Spa', 'Fitness Center', 'Restaurant', 'Room Service', 'Business Center', 'Concierge'],
      mainImage: 'https://www.pchotels.com/assets/images/1_facade-2.png',
      images: [
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa'
      ],
      location: {
        coordinates: [24.8607, 67.0011]
      }
    },
    {
      name: 'Movenpick Hotel Karachi',
      address: 'Club Road, Karachi',
      description: 'Sophisticated hotel with stylish rooms, international cuisine, outdoor pool, and extensive conference facilities in central Karachi.',
      rating: 5,
      userRating: 8.9,
      reviewCount: 421,
      price: 21000,
      amenities: ['Free Wi-Fi', 'Swimming Pool', 'Fitness Center', 'Restaurant', 'Room Service', 'Business Center', 'Airport Shuttle'],
      mainImage: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/376266891.jpg?k=ee7ece24f0d0ce98dee9fa3766c00ef761b2e303df8c3b0de7809a1682e048b6&o=&hp=1',
      images: [
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
        'https://images.unsplash.com/photo-1615460549969-36fa19521a4f',
        'https://images.unsplash.com/photo-1568084680786-a84f91d1153c'
      ],
      location: {
        coordinates: [24.8650, 67.0099]
      }
    }
  ],
  'Murree': [
    {
      name: 'Pearl Continental Bhurban',
      address: 'Murree Hills, Bhurban',
      description: 'Nestled in the pine-covered Murree Hills, PC Bhurban offers panoramic mountain views, luxury accommodations, and recreational activities.',
      rating: 5,
      userRating: 9.1,
      reviewCount: 324,
      price: 20000,
      amenities: ['Free Wi-Fi', 'Swimming Pool', 'Spa', 'Fitness Center', 'Restaurant', 'Room Service', 'Tennis Court'],
      mainImage: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/634251735.jpg?k=b8ea850c464ac9bbfe8a6bda311b4545fa0e6b3661ed250b29a774ede8900c60&o=&hp=1',
      images: [
        'https://images.unsplash.com/photo-1445019980597-93fa8acb246c',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945'
      ],
      location: {
        coordinates: [33.9570, 73.4519]
      }
    },
    {
      name: 'Hotel One Murree',
      address: 'The Mall, Murree',
      description: 'Modern hotel in the heart of Murree offering comfortable rooms with mountain views, restaurant, and easy access to local attractions.',
      rating: 4,
      userRating: 8.3,
      reviewCount: 187,
      price: 14000,
      amenities: ['Free Wi-Fi', 'Restaurant', 'Room Service', 'Heating', 'Family Rooms'],
      mainImage: 'https://imgcy.trivago.com/c_fill,d_dummy.jpeg,e_sharpen:60,f_auto,h_267,q_40,w_400/hotelier-images/cb/46/b207da3a8eda0b79af4ea1b6a8d9343f312174c33a6202ae3cac8655f6c0.jpeg',
      images: [
        'https://images.unsplash.com/photo-1615460549969-36fa19521a4f',
        'https://images.unsplash.com/photo-1595576508898-0ad5c879a061',
        'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa'
      ],
      location: {
        coordinates: [33.9070, 73.3943]
      }
    }
  ],
  'Swat': [
    {
      name: 'Serena Swat',
      address: 'Saidu Sharif, Swat',
      description: 'Luxury hotel in the picturesque Swat Valley offering comfortable accommodations, garden views, and traditional Pakistani hospitality.',
      rating: 4.5,
      userRating: 8.9,
      reviewCount: 187,
      price: 18000,
      amenities: ['Free Wi-Fi', 'Garden', 'Restaurant', 'Room Service', 'Meeting Rooms', 'Laundry Service'],
      mainImage: 'https://image-tc.galaxy.tf/wijpeg-ntftxb8f8u2yon71kc4oe1ae/img-1679.jpg?width=1600&height=1066',
      images: [
        'https://images.unsplash.com/photo-1561501878-aabd62634533',
        'https://images.unsplash.com/photo-1615460549969-36fa19521a4f',
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'
      ],
      location: {
        coordinates: [34.7456, 72.3556]
      }
    },
    {
      name: 'Swat Continental Hotel',
      address: 'Mingora, Swat',
      description: 'Comfortable hotel in Mingora with well-appointed rooms, restaurant serving local cuisine, and friendly service.',
      rating: 3,
      userRating: 7.8,
      reviewCount: 98,
      price: 7500,
      amenities: ['Free Wi-Fi', 'Restaurant', 'Room Service', 'Parking', '24-hour Front Desk'],
      mainImage: 'https://q-xx.bstatic.com/xdata/images/hotel/840x460/318183745.jpg?k=a04393186b67de3957ef0f5d0b08a1ac1d1fc1ea8d968b2cd1bbc5f5bc311112&o=',
      images: [
        'https://images.unsplash.com/photo-1568084680786-a84f91d1153c',
        'https://images.unsplash.com/photo-1595576508898-0ad5c879a061',
        'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa'
      ],
      location: {
        coordinates: [34.7812, 72.3602]
      }
    }
  ],
  'Naran': [
    {
      name: 'Hotel One Naran',
      address: 'Main Naran Road, Naran',
      description: 'Modern hotel offering comfortable accommodations with stunning views of the surrounding mountains and Kunhar River.',
      rating: 4,
      userRating: 8.4,
      reviewCount: 156,
      price: 16000,
      amenities: ['Free Wi-Fi', 'Restaurant', 'Room Service', 'Heating', 'Mountain View'],
      mainImage: 'https://images.trvl-media.com/lodging/65000000/64930000/64923400/64923370/e9cea000.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill',
      images: [
        'https://images.unsplash.com/photo-1554254648-2d58a1bc3fd5',
        'https://images.unsplash.com/photo-1615460549969-36fa19521a4f',
        'https://images.unsplash.com/photo-1561501878-aabd62634533'
      ],
      location: {
        coordinates: [34.9110, 73.6466]
      }
    },
    {
      name: 'Pine Park Hotel',
      address: 'Jheel Road, Naran',
      description: 'Cozy hotel surrounded by pine trees offering comfortable rooms with river and mountain views and traditional Pakistani cuisine.',
      rating: 3.5,
      userRating: 8.0,
      reviewCount: 123,
      price: 12000,
      amenities: ['Free Wi-Fi', 'Restaurant', 'Room Service', 'Garden', 'Laundry Service'],
      mainImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/c5/10/cf/20150929-094601-largejpg.jpg?w=900&h=-1&s=1',
      images: [
        'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa',
        'https://images.unsplash.com/photo-1595576508898-0ad5c879a061',
        'https://images.unsplash.com/photo-1554254648-2d58a1bc3fd5'
      ],
      location: {
        coordinates: [34.9072, 73.6501]
      }
    }
  ],
  'Hunza': [
    {
      name: 'Serena Hunza',
      address: 'Main Karimabad Road, Hunza',
      description: 'Luxury hotel offering spectacular views of Hunza Valley and the surrounding mountains with traditional Hunza architecture.',
      rating: 4.5,
      userRating: 9.2,
      reviewCount: 165,
      price: 17000,
      amenities: ['Free Wi-Fi', 'Restaurant', 'Garden', 'Mountain View', 'Room Service', 'Tour Desk'],
      mainImage: 'https://image-tc.galaxy.tf/wijpeg-45txkyb8skkvljmca5nmkeo0i/1.jpg?width=1600&height=1066',
      images: [
        'https://images.unsplash.com/photo-1542259009477-d625272157b7',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39',
        'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa'
      ],
      location: {
        coordinates: [36.3167, 74.6667]
      }
    },
    {
      name: 'Eagle Nest Hotel',
      address: 'Duikar, Hunza Valley',
      description: 'Perched on a hill overlooking Hunza Valley, this hotel offers breathtaking panoramic views and comfortable accommodations.',
      rating: 4,
      userRating: 8.7,
      reviewCount: 132,
      price: 14000,
      amenities: ['Free Wi-Fi', 'Restaurant', 'Mountain View', 'Terrace', 'Hiking'],
      mainImage: 'https://www.xplorepakistan.net/wp-content/uploads/2020/05/Eagle-Nest-Hunza-04.jpg',
      images: [
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa',
        'https://images.unsplash.com/photo-1561501878-aabd62634533',
        'https://images.unsplash.com/photo-1542259009477-d625272157b7'
      ],
      location: {
        coordinates: [36.3207, 74.6727]
      }
    }
  ],
  'Skardu': [
    {
      name: 'Shangrila Resort',
      address: 'Lower Kachura Lake, Skardu',
      description: 'Iconic resort on the shore of Lower Kachura Lake (Shangrila Lake) with stunning views and traditional wooden architecture.',
      rating: 4.5,
      userRating: 9.3,
      reviewCount: 201,
      price: 19000,
      amenities: ['Free Wi-Fi', 'Restaurant', 'Lake View', 'Garden', 'Boating', 'Room Service'],
      mainImage: 'https://www.xplorepakistan.net/wp-content/uploads/2020/05/Eagle-Nest-Hunza-04.jpg',
      images: [
        'https://images.unsplash.com/photo-1542321993-8fc36217e26d',
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa',
        'https://images.unsplash.com/photo-1542259009477-d625272157b7'
      ],
      location: {
        coordinates: [35.4167, 75.5167]
      }
    },
    {
      name: 'K2 Hotel Skardu',
      address: 'Main Skardu Road, Skardu',
      description: 'Comfortable hotel with modern amenities and excellent views of surrounding mountains in the heart of Skardu.',
      rating: 4,
      userRating: 8.5,
      reviewCount: 145,
      price: 15000,
      amenities: ['Free Wi-Fi', 'Restaurant', 'Mountain View', 'Room Service', 'Airport Shuttle'],
      mainImage: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/657247975.jpg?k=0a794ec4362ef6968288048cd5d2d643c80f4cc783619d83b561e993240961db&o=&hp=1',
      images: [
        'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa',
        'https://images.unsplash.com/photo-1542321993-8fc36217e26d',
        'https://images.unsplash.com/photo-1595576508898-0ad5c879a061'
      ],
      location: {
        coordinates: [35.3049, 75.6315]
      }
    }
  ],
  'Peshawar': [
    {
      name: 'Pearl Continental Peshawar',
      address: 'Khyber Road, Peshawar',
      description: 'Luxury hotel in Peshawar offering comfortable accommodations, excellent dining options, and modern business facilities.',
      rating: 4.5,
      userRating: 8.8,
      reviewCount: 263,
      price: 20000,
      amenities: ['Free Wi-Fi', 'Swimming Pool', 'Fitness Center', 'Restaurant', 'Room Service', 'Business Center', 'Spa'],
      mainImage: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/278604045.jpg?k=b25a652ecb2d6401734fbbdf52bf971cc2ccb713f7991f2aba5d9f68b69ed8ce&o=',
      images: [
        'https://images.unsplash.com/photo-1561501878-aabd62634533',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39',
        'https://images.unsplash.com/photo-1615460549969-36fa19521a4f'
      ],
      location: {
        coordinates: [34.0041, 71.5506]
      }
    },
    {
      name: 'Shelton\s Rezidor Peshawar',
      address: 'University Road, Peshawar',
      description: 'Modern hotel offering comfortable rooms, restaurant serving international cuisine, and convenient location near main attractions.',
      rating: 4,
      userRating: 8.1,
      reviewCount: 187,
      price: 14000,
      amenities: ['Free Wi-Fi', 'Restaurant', 'Room Service', 'Meeting Rooms', '24-hour Front Desk'],
      mainImage: 'https://tripako.com/wp-content/uploads/2021/02/70942584.jpg',
      images: [
        'https://images.unsplash.com/photo-1568084680786-a84f91d1153c',
        'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa',
        'https://images.unsplash.com/photo-1615460549969-36fa19521a4f'
      ],
      location: {
        coordinates: [34.0107, 71.5696]
      }
    }
  ],
  'Multan': [
    {
      name: 'Avari Xpress Multan',
      address: 'Abdali Road, Multan',
      description: 'Modern hotel in the heart of Multan offering comfortable accommodations, restaurant, and excellent service.',
      rating: 4,
      userRating: 8.2,
      reviewCount: 176,
      price: 13000,
      amenities: ['Free Wi-Fi', 'Restaurant', 'Room Service', 'Meeting Rooms', '24-hour Front Desk'],
      mainImage: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/211202950.jpg?k=41b8b6bb2c95e17412b182fbe18e567da5ff645befb5a9702b13ec2f3c7152cc&o=&hp=1',
      images: [
        'https://images.unsplash.com/photo-1615460549969-36fa19521a4f',
        'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945'
      ],
      location: {
        coordinates: [30.1984, 71.4687]
      }
    },
    {
      name: 'Hotel One Multan',
      address: 'Bahawalpur Road, Multan',
      description: 'Contemporary hotel offering comfortable rooms, excellent dining, and convenient location near business and shopping areas.',
      rating: 3.5,
      userRating: 7.9,
      reviewCount: 152,
      price: 11000,
      amenities: ['Free Wi-Fi', 'Restaurant', 'Room Service', 'Conference Room', 'Laundry Service'],
      mainImage: 'https://www.hotelone.com.pk/upload_new/gallery/tariq_road_multan_ex_2.jpg',
      images: [
        'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa',
        'https://images.unsplash.com/photo-1595576508898-0ad5c879a061',
        'https://images.unsplash.com/photo-1568084680786-a84f91d1153c'
      ],
      location: {
        coordinates: [30.1688, 71.4253]
      }
    }
  ]
};

// Function to seed database with hotel data
async function seedHotelDatabase() {
  try {
    // Clear existing data
    await Hotel.deleteMany({});
    console.log('Cleared existing hotel data');
    
    // Insert hotel data for each city
    for (const city in pakistaniHotels) {
      const hotels = pakistaniHotels[city];
      
      for (const hotel of hotels) {
        const newHotel = new Hotel({
          name: hotel.name,
          city: city,
          address: hotel.address,
          description: hotel.description,
          images: hotel.images,
          mainImage: hotel.mainImage,
          rating: hotel.rating,
          userRating: hotel.userRating,
          reviewCount: hotel.reviewCount,
          price: hotel.price,
          amenities: hotel.amenities,
          location: {
            type: 'Point',
            coordinates: hotel.location.coordinates
          }
        });
        
        await newHotel.save();
        console.log(`Added ${hotel.name} in ${city}`);
      }
    }
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.disconnect();
    console.log('Database connection closed');
  }
}

// Execute seeding
seedHotelDatabase();