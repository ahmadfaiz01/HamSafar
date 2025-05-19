const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
require('dotenv').config();

// Sample hotel data for Pakistan
const hotelData = [
  {
    name: 'Pearl Continental Lahore',
    address: 'Shahrah-e-Quaid-e-Azam',
    city: 'Lahore',
    description: 'Luxury 5-star hotel with excellent amenities and service.',
    images: [
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/d9/fb/c1/pearl-continental-hotel.jpg?w=700&h=-1&s=1',
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-s/03/80/67/11/pearl-continental-hotel.jpg?w=600&h=-1&s=1'
    ],
    amenities: ['Pool', 'Spa', 'Gym', 'Free Wifi', 'Restaurant', 'Room Service', 'Parking'],
    rating: 4.7,
    pricePerNight: 25000,
    rooms: [
      { type: 'Deluxe Room', price: 25000, amenities: ['King Bed', 'Free Wifi', 'TV', 'Air Conditioning'] },
      { type: 'Executive Suite', price: 40000, amenities: ['King Bed', 'Separate Living Room', 'Free Wifi', 'TV'] }
    ],
    latitude: 31.5546,
    longitude: 74.3572,
    contactInfo: {
      phone: '+92-42-111-505-505',
      email: 'reservations.lhr@pchotels.com',
      website: 'https://www.pchotels.com'
    },
    reviews: [
      { user: 'Ahmed Khan', rating: 5, comment: 'Excellent service and beautiful rooms.', date: new Date('2023-04-15') },
      { user: 'Sarah Ali', rating: 4, comment: 'Great location and amenities.', date: new Date('2023-03-22') }
    ]
  },
  {
    name: 'Serena Hotel Islamabad',
    address: 'Khayaban-e-Suhrawardy',
    city: 'Islamabad',
    description: 'Elegant hotel featuring traditional Pakistani architecture and luxury rooms.',
    images: [
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/d3/44/69/islamabad-serena-hotel.jpg?w=700&h=-1&s=1',
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-s/01/bd/80/e7/islamabad-serena-hotel.jpg?w=600&h=-1&s=1'
    ],
    amenities: ['Pool', 'Spa', 'Gym', 'Free Wifi', 'Restaurant', 'Room Service', 'Parking', 'Business Center'],
    rating: 4.8,
    pricePerNight: 30000,
    rooms: [
      { type: 'Deluxe Room', price: 30000, amenities: ['King Bed', 'Free Wifi', 'TV', 'Air Conditioning'] },
      { type: 'Executive Suite', price: 50000, amenities: ['King Bed', 'Separate Living Room', 'Free Wifi', 'TV'] }
    ],
    latitude: 33.7115,
    longitude: 73.1037,
    contactInfo: {
      phone: '+92-51-111-133-133',
      email: 'reservations@serena.com.pk',
      website: 'https://www.serenahotels.com'
    },
    reviews: [
      { user: 'Ali Raza', rating: 5, comment: 'World-class service and beautiful architecture.', date: new Date('2023-05-10') },
      { user: 'Fatima Khan', rating: 5, comment: 'Amazing experience, loved the traditional decor.', date: new Date('2023-02-15') }
    ]
  },
  {
    name: 'Avari Towers Karachi',
    address: 'Fatima Jinnah Road',
    city: 'Karachi',
    description: 'Upscale hotel offering city views, multiple dining options and a rooftop pool.',
    images: [
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/9c/cc/04/avari-towers-karachi.jpg?w=700&h=-1&s=1',
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-s/10/44/21/64/avari-towers-karachi.jpg?w=600&h=-1&s=1'
    ],
    amenities: ['Pool', 'Gym', 'Free Wifi', 'Restaurant', 'Room Service', 'Parking', 'Airport Shuttle'],
    rating: 4.6,
    pricePerNight: 22000,
    rooms: [
      { type: 'Deluxe Room', price: 22000, amenities: ['King Bed', 'Free Wifi', 'TV', 'Air Conditioning'] },
      { type: 'Executive Suite', price: 35000, amenities: ['King Bed', 'Separate Living Room', 'Free Wifi', 'TV'] }
    ],
    latitude: 24.8608,
    longitude: 67.0104,
    contactInfo: {
      phone: '+92-21-35661566',
      email: 'reservations@avari.com',
      website: 'https://www.avari.com'
    },
    reviews: [
      { user: 'Imran Ahmed', rating: 4, comment: 'Great city views and convenient location.', date: new Date('2023-03-05') },
      { user: 'Nadia Malik', rating: 5, comment: 'Excellent service and delicious breakfast.', date: new Date('2023-01-20') }
    ]
  },
  {
    name: 'Shangrila Resort Skardu',
    address: 'Shangrila Road',
    city: 'Skardu',
    description: 'Beautiful resort nestled in the mountains with stunning views of Shangrila Lake.',
    images: [
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0b/74/77/fd/shangrila-resort-hotel.jpg?w=700&h=-1&s=1',
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-s/05/df/7c/e4/shangrila-resort.jpg?w=600&h=-1&s=1'
    ],
    amenities: ['Lake View', 'Restaurant', 'Free Wifi', 'Room Service', 'Parking', 'Garden'],
    rating: 4.7,
    pricePerNight: 18000,
    rooms: [
      { type: 'Standard Room', price: 18000, amenities: ['Queen Bed', 'Free Wifi', 'Mountain View'] },
      { type: 'Deluxe Room', price: 25000, amenities: ['King Bed', 'Free Wifi', 'Lake View', 'Balcony'] }
    ],
    latitude: 35.3355,
    longitude: 75.5589,
    contactInfo: {
      phone: '+92-5815-450300',
      email: 'info@shangrila.com.pk',
      website: 'https://www.shangrila.com.pk'
    },
    reviews: [
      { user: 'Omar Khan', rating: 5, comment: 'Breathtaking views and peaceful atmosphere.', date: new Date('2023-06-10') },
      { user: 'Ayesha Ali', rating: 4, comment: 'Beautiful location but rooms need updating.', date: new Date('2023-05-15') }
    ]
  },
  {
    name: 'Cosmopolitan Hotel Murree',
    address: 'The Mall',
    city: 'Murree',
    description: 'Comfortable hotel in the heart of Murree with easy access to main attractions.',
    images: [
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1c/59/05/bf/the-most-beautiful-hotel.jpg?w=700&h=-1&s=1',
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/23/5c/ce/73/the-cosmopolitan.jpg?w=600&h=-1&s=1'
    ],
    amenities: ['Free Wifi', 'Restaurant', 'Room Service', 'Parking', 'Mountain View'],
    rating: 4.3,
    pricePerNight: 15000,
    rooms: [
      { type: 'Standard Room', price: 15000, amenities: ['Queen Bed', 'Free Wifi', 'TV'] },
      { type: 'Deluxe Room', price: 20000, amenities: ['King Bed', 'Free Wifi', 'TV', 'Mountain View'] }
    ],
    latitude: 33.9042,
    longitude: 73.3933,
    contactInfo: {
      phone: '+92-321-5311188',
      email: 'info@cosmopolitanmurree.com',
      website: 'https://www.cosmopolitanmurree.com'
    },
    reviews: [
      { user: 'Saad Ahmed', rating: 4, comment: 'Great location near Mall Road.', date: new Date('2023-02-20') },
      { user: 'Hina Malik', rating: 3, comment: 'Decent hotel but noisy during peak season.', date: new Date('2023-01-05') }
    ]
  },
  {
    name: 'Luxus Hunza',
    address: 'Karimabad',
    city: 'Hunza',
    description: 'Modern hotel offering stunning views of Hunza Valley and surrounding mountains.',
    images: [
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1d/64/5c/90/luxus-hunza.jpg?w=700&h=-1&s=1',
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1d/64/5c/82/luxus-hunza.jpg?w=600&h=-1&s=1'
    ],
    amenities: ['Mountain View', 'Restaurant', 'Free Wifi', 'Room Service', 'Terrace'],
    rating: 4.7,
    pricePerNight: 17000,
    rooms: [
      { type: 'Standard Room', price: 17000, amenities: ['Queen Bed', 'Free Wifi', 'Mountain View'] },
      { type: 'Deluxe Room', price: 22000, amenities: ['King Bed', 'Free Wifi', 'Balcony', 'Mountain View'] }
    ],
    latitude: 36.3156,
    longitude: 74.6544,
    contactInfo: {
      phone: '+92-343-5551777',
      email: 'info@luxushunza.com',
      website: 'https://www.luxushunza.com'
    },
    reviews: [
      { user: 'Zainab Khan', rating: 5, comment: 'Stunning views of Hunza Valley and excellent service.', date: new Date('2023-07-05') },
      { user: 'Hassan Ali', rating: 4, comment: 'Beautiful location, friendly staff, but limited food options.', date: new Date('2023-06-20') }
    ]
  },
  {
    name: 'Sambara Inn Naran',
    address: 'Main Road',
    city: 'Naran',
    description: 'Charming hotel with riverside location and beautiful views of the Kunhar River.',
    images: [
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/25/3a/16/41/sambara-inn-naran.jpg?w=700&h=-1&s=1',
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/25/3a/16/33/sambara-inn-naran.jpg?w=600&h=-1&s=1'
    ],
    amenities: ['River View', 'Restaurant', 'Free Wifi', 'Room Service', 'Parking'],
    rating: 4.2,
    pricePerNight: 12000,
    rooms: [
      { type: 'Standard Room', price: 12000, amenities: ['Queen Bed', 'Free Wifi', 'TV'] },
      { type: 'Deluxe Room', price: 16000, amenities: ['King Bed', 'Free Wifi', 'River View'] }
    ],
    latitude: 34.9043,
    longitude: 73.6519,
    contactInfo: {
      phone: '+92-345-5551234',
      email: 'info@sambarainn.com',
      website: 'https://www.sambarainn.com'
    },
    reviews: [
      { user: 'Ahmed Shah', rating: 4, comment: 'Beautiful location by the river, comfortable rooms.', date: new Date('2023-08-10') },
      { user: 'Sana Malik', rating: 3, comment: 'Great views but service can be improved.', date: new Date('2023-07-25') }
    ]
  },
  {
    name: 'PC Hotel Peshawar',
    address: 'Khyber Road',
    city: 'Peshawar',
    description: 'Elegant hotel offering comfortable rooms and excellent dining options in Peshawar.',
    images: [
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/c7/a6/38/pearl-continental-hotel.jpg?w=700&h=-1&s=1',
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/c7/a6/2a/pearl-continental-hotel.jpg?w=600&h=-1&s=1'
    ],
    amenities: ['Pool', 'Gym', 'Free Wifi', 'Restaurant', 'Room Service', 'Parking', 'Business Center'],
    rating: 4.5,
    pricePerNight: 20000,
    rooms: [
      { type: 'Deluxe Room', price: 20000, amenities: ['King Bed', 'Free Wifi', 'TV', 'Air Conditioning'] },
      { type: 'Executive Suite', price: 30000, amenities: ['King Bed', 'Separate Living Room', 'Free Wifi', 'TV'] }
    ],
    latitude: 34.0055,
    longitude: 71.5400,
    contactInfo: {
      phone: '+92-91-111-505-505',
      email: 'reservations.pew@pchotels.com',
      website: 'https://www.pchotels.com'
    },
    reviews: [
      { user: 'Khalid Khan', rating: 5, comment: 'Excellent security and top-notch service.', date: new Date('2023-04-05') },
      { user: 'Aisha Durrani', rating: 4, comment: 'Comfortable stay and helpful staff.', date: new Date('2023-03-15') }
    ]
  },
  {
    name: 'Avari Hotel Multan',
    address: 'Abdali Road',
    city: 'Multan',
    description: 'Modern hotel in the heart of Multan offering comfortable accommodations and excellent amenities.',
    images: [
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/b8/4a/87/avari-hotel.jpg?w=700&h=-1&s=1',
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/b8/4a/70/avari-hotel.jpg?w=600&h=-1&s=1'
    ],
    amenities: ['Pool', 'Gym', 'Free Wifi', 'Restaurant', 'Room Service', 'Parking', 'Business Center'],
    rating: 4.4,
    pricePerNight: 18000,
    rooms: [
      { type: 'Deluxe Room', price: 18000, amenities: ['King Bed', 'Free Wifi', 'TV', 'Air Conditioning'] },
      { type: 'Executive Suite', price: 28000, amenities: ['King Bed', 'Separate Living Room', 'Free Wifi', 'TV'] }
    ],
    latitude: 30.1981,
    longitude: 71.4688,
    contactInfo: {
      phone: '+92-61-111-282-747',
      email: 'reservations.mul@avari.com',
      website: 'https://www.avari.com'
    },
    reviews: [
      { user: 'Bilal Ahmed', rating: 4, comment: 'Good location and comfortable rooms.', date: new Date('2023-05-25') },
      { user: 'Mariam Shah', rating: 4, comment: 'Clean hotel with friendly staff.', date: new Date('2023-04-30') }
    ]
  },
  {
    name: 'Swat Serena Hotel',
    address: 'Saidu Sharif',
    city: 'Swat',
    description: 'Elegant hotel surrounded by lush gardens with beautiful mountain views in the Swat Valley.',
    images: [
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/49/69/1c/swat-serena-hotel.jpg?w=700&h=-1&s=1',
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/49/69/1a/swat-serena-hotel.jpg?w=600&h=-1&s=1'
    ],
    amenities: ['Garden', 'Restaurant', 'Free Wifi', 'Room Service', 'Parking', 'Mountain View'],
    rating: 4.6,
    pricePerNight: 19000,
    rooms: [
      { type: 'Standard Room', price: 19000, amenities: ['Queen Bed', 'Free Wifi', 'Garden View'] },
      { type: 'Deluxe Room', price: 24000, amenities: ['King Bed', 'Free Wifi', 'Mountain View', 'Balcony'] }
    ],
    latitude: 34.7448,
    longitude: 72.3552,
    contactInfo: {
      phone: '+92-946-811531',
      email: 'reservations.swat@serena.com.pk',
      website: 'https://www.serenahotels.com'
    },
    reviews: [
      { user: 'Faisal Khan', rating: 5, comment: 'Beautiful hotel in a stunning location.', date: new Date('2023-06-15') },
      { user: 'Saima Malik', rating: 4, comment: 'Peaceful setting and excellent hospitality.', date: new Date('2023-05-20') }
    ]
  }
];

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://itsahmadfaiz:lQgIw7Zus5McHvbd@hamsafar.itrl9eo.mongodb.net/hamsafar')
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to seed the database
async function seedHotels() {
  try {
    // Check if hotels already exist
    const existingCount = await Hotel.countDocuments();
    
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} hotels. Do you want to clear and reseed?`);
      console.log('If you want to proceed, delete the existing collection and run again.');
      mongoose.connection.close();
      return;
    }
    
    // If no hotels exist, seed the database
    const result = await Hotel.insertMany(hotelData);
    console.log(`Successfully seeded ${result.length} hotels into the database!`);
    
    // Create necessary indexes
    await Hotel.collection.createIndex({ city: 1 });
    await Hotel.collection.createIndex({ name: 'text', description: 'text' });
    
    console.log('Created indexes for faster querying');
    
    // Close the connection
    mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error seeding hotels:', error);
    mongoose.connection.close();
  }
}

// Run the seeding function
seedHotels();
