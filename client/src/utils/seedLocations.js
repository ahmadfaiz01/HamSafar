import { seedPointsOfInterest } from '../services/locationService';

// Sample POI data for Islamabad
const islamabadPOIs = [
  {
    name: "Pakistan Monument",
    category: "Attraction",
    description: "Pakistan Monument is a national monument and heritage museum located on the western Shakarparian Hills in Islamabad, Pakistan.",
    coordinates: { latitude: 33.6936, longitude: 73.0666 },
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Pakistan_Monument_at_night.jpg/1200px-Pakistan_Monument_at_night.jpg",
    tags: ["history", "architecture", "cultural"],
    createdAt: new Date()
  },
  {
    name: "Faisal Mosque",
    category: "Attraction",
    description: "The Faisal Mosque is the national mosque of Pakistan located in the capital city of Islamabad.",
    coordinates: { latitude: 33.7295, longitude: 73.0372 },
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Faisal_Mosque_2019.jpg/1200px-Faisal_Mosque_2019.jpg",
    tags: ["architecture", "religious", "cultural"],
    createdAt: new Date()
  },
  {
    name: "Monal Restaurant",
    category: "Restaurant",
    description: "The Monal is a famous restaurant located on the Margalla Hills, offering panoramic views of Islamabad.",
    coordinates: { latitude: 33.7497, longitude: 73.0621 },
    imageUrl: "https://lh3.googleusercontent.com/p/AF1QipPQurrfTOKbMIJFYSmVN3K6x5IfLVLIiW7EeVSm=s1360-w1360-h1020",
    tags: ["food", "scenic", "dining"],
    createdAt: new Date()
  },
  {
    name: "Daman-e-Koh",
    category: "Park",
    description: "A viewing point and hill top garden north of Islamabad, located in the middle of the Margalla Hills.",
    coordinates: { latitude: 33.7482, longitude: 73.0544 },
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Daman-e-koh.jpg/1200px-Daman-e-koh.jpg",
    tags: ["nature", "photography", "scenic"],
    createdAt: new Date()
  },
  {
    name: "Lok Virsa Museum",
    category: "Museum",
    description: "A cultural museum that showcases the heritage of Pakistan, displaying artifacts, textiles, and cultural exhibits.",
    coordinates: { latitude: 33.6926, longitude: 73.0766 },
    imageUrl: "https://www.pakistantoursguide.pk/wp-content/uploads/2020/04/lok-virsa-museum-islamabad-ptg.jpg",
    tags: ["history", "cultural", "art"],
    createdAt: new Date()
  },
  {
    name: "Rawal Lake",
    category: "Attraction",
    description: "An artificial reservoir that provides the water needs for the cities of Rawalpindi and Islamabad.",
    coordinates: { latitude: 33.6998, longitude: 73.1231 },
    imageUrl: "https://i.tribune.com.pk/media/images/rawal-lake1617879667-0/rawal-lake1617879667-0.jpg",
    tags: ["nature", "water", "outdoor"],
    createdAt: new Date()
  },
  {
    name: "Centaurus Mall",
    category: "Shopping",
    description: "A luxury shopping mall in Islamabad featuring local and international brands, dining options, and entertainment.",
    coordinates: { latitude: 33.7078, longitude: 73.0498 },
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/The_Centaurus_Mall.jpg/1200px-The_Centaurus_Mall.jpg",
    tags: ["shopping", "entertainment", "food"],
    createdAt: new Date()
  },
  {
    name: "Trail 5",
    category: "Mountain",
    description: "A popular hiking trail in the Margalla Hills, offering a moderate trek with beautiful views of Islamabad.",
    coordinates: { latitude: 33.7418, longitude: 73.0654 },
    imageUrl: "https://i0.wp.com/www.brandsynario.com/wp-content/uploads/2020/06/Trail5.jpg",
    tags: ["hiking", "nature", "adventure"],
    createdAt: new Date()
  }
];

// Sample POI data for Rahim Yar Khan
const rahimYarKhanPOIs = [
  {
    name: "Sadiq Palace",
    category: "Historical",
    description: "Sadiq Palace is a historical building and the former residence of the Nawab of Bahawalpur. It features impressive architecture and beautiful gardens.",
    coordinates: { latitude: 28.4200, longitude: 70.2989 },
    imageUrl: "https://i.dawn.com/primary/2015/07/55a8d443d1e8f.jpg",
    tags: ["history", "architecture", "cultural", "heritage"],
    createdAt: new Date()
  },
  {
    name: "Noor Mahal",
    category: "Historical",
    description: "Noor Mahal is a palace in Bahawalpur near Rahim Yar Khan, built in 1875 during the reign of Nawab Sir Muhammad Sadiq. It combines Italian and Mughal architectural styles.",
    coordinates: { latitude: 28.4183, longitude: 70.3015 },
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Noor_Mahal_Bahawalpur.jpg/1200px-Noor_Mahal_Bahawalpur.jpg",
    tags: ["palace", "history", "architecture", "heritage"],
    createdAt: new Date()
  },
  {
    name: "Darbar Mahal",
    category: "Historical",
    description: "Darbar Mahal is a historic palace in Bahawalpur near Rahim Yar Khan. It was built by the Nawabs of Bahawalpur and showcases stunning architectural features.",
    coordinates: { latitude: 28.4155, longitude: 70.3039 },
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Darbar_Mahal.JPG/1200px-Darbar_Mahal.JPG",
    tags: ["history", "palace", "architecture", "heritage"],
    createdAt: new Date()
  },
  {
    name: "Derawar Fort",
    category: "Historical",
    description: "Derawar Fort is a large square fortress near Rahim Yar Khan in Punjab, Pakistan. The massive structure has 40 bastions and stands in the Cholistan Desert.",
    coordinates: { latitude: 28.7678, longitude: 71.3317 },
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Derawar_fort_1.jpg",
    tags: ["fort", "desert", "history", "architecture"],
    createdAt: new Date()
  },
  {
    name: "Cholistan Desert",
    category: "Attraction",
    description: "Cholistan Desert, locally known as Rohi, is a large desert in Pakistan's Punjab province near Rahim Yar Khan. It's known for its unique landscape and cultural heritage.",
    coordinates: { latitude: 28.2500, longitude: 71.0000 },
    imageUrl: "https://i.tribune.com.pk/media/images/cholistan-desert-beautiful-pakistan1630925686-0/cholistan-desert-beautiful-pakistan1630925686-0.jpg",
    tags: ["nature", "desert", "adventure", "outdoor"],
    createdAt: new Date()
  },
  {
    name: "Abbasia Cricket Stadium",
    category: "Entertainment",
    description: "Abbasia Cricket Stadium is a multi-purpose stadium in Bahawalpur near Rahim Yar Khan, primarily used for cricket matches and other sporting events.",
    coordinates: { latitude: 28.3893, longitude: 70.3356 },
    imageUrl: "https://pbs.twimg.com/media/FlxTQ_wX0AIRxJ9?format=jpg&name=large",
    tags: ["sports", "cricket", "entertainment", "outdoor"],
    createdAt: new Date()
  },
  {
    name: "Lal Sohanra National Park",
    category: "Park",
    description: "Lal Sohanra is a national park in Pakistan's Punjab province near Rahim Yar Khan. It's home to diverse wildlife including blackbucks, wild boars, and various bird species.",
    coordinates: { latitude: 28.9190, longitude: 70.9019 },
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d2/Blackbuck_in_Lal_Suhanra_National_Park_Bahawalpur_Punjab.jpg",
    tags: ["nature", "wildlife", "park", "outdoor"],
    createdAt: new Date()
  },
  {
    name: "DHA Bahawalpur",
    category: "Shopping",
    description: "DHA Bahawalpur is a modern residential and commercial development near Rahim Yar Khan, featuring shopping centers, restaurants, and entertainment facilities.",
    coordinates: { latitude: 28.4058, longitude: 70.3122 },
    imageUrl: "https://i0.wp.com/www.brandsynario.com/wp-content/uploads/2020/06/dha-bahawalpur-1.jpg",
    tags: ["shopping", "dining", "modern", "entertainment"],
    createdAt: new Date()
  },
  {
    name: "Central Library Bahawalpur",
    category: "Cultural",
    description: "The Central Library in Bahawalpur near Rahim Yar Khan houses a vast collection of books, manuscripts, and historical documents, some dating back several centuries.",
    coordinates: { latitude: 28.4012, longitude: 70.3022 },
    imageUrl: "https://i.dawn.com/primary/2014/12/5486283cb9f4b.jpg",
    tags: ["education", "books", "history", "culture"],
    createdAt: new Date()
  },
  {
    name: "One Unit Chowk",
    category: "Attraction",
    description: "One Unit Chowk is a prominent landmark and junction in Rahim Yar Khan, featuring monuments and structures symbolizing Pakistan's unity.",
    coordinates: { latitude: 28.4367, longitude: 70.2996 },
    imageUrl: "https://mapio.net/images-p/79005874.jpg",
    tags: ["landmark", "city", "history"],
    createdAt: new Date()
  },
  {
    name: "Sheikh Zayed International Airport",
    category: "Transportation",
    description: "Sheikh Zayed International Airport serves Rahim Yar Khan and surrounding areas, connecting the region to major cities in Pakistan.",
    coordinates: { latitude: 28.3839, longitude: 70.2796 },
    imageUrl: "https://airport-authority.com/img/RYK.jpg",
    tags: ["travel", "transportation", "airport"],
    createdAt: new Date()
  },
  {
    name: "Khanum's Restaurant",
    category: "Restaurant",
    description: "Popular restaurant in Rahim Yar Khan known for its authentic Pakistani cuisine, particularly its BBQ dishes and traditional curries.",
    coordinates: { latitude: 28.4354, longitude: 70.2967 },
    imageUrl: "https://lh3.googleusercontent.com/p/AF1QipMJTzs1Ox7QXJ5FyM1h_K5TOftGMvUqnv7QrhOP=s1360-w1360-h1020",
    tags: ["food", "dining", "bbq", "local"],
    createdAt: new Date()
  }
];

// Function to seed the database with all sample POIs
export const seedSamplePOIs = async (region = 'all') => {
  try {
    let poisToSeed = [];
    
    // Determine which POIs to seed based on the region parameter
    if (region === 'all' || region === 'islamabad') {
      poisToSeed = [...poisToSeed, ...islamabadPOIs];
    }
    
    if (region === 'all' || region === 'rahimyarkhan') {
      poisToSeed = [...poisToSeed, ...rahimYarKhanPOIs];
    }
    
    await seedPointsOfInterest(poisToSeed);
    console.log(`Successfully seeded ${poisToSeed.length} points of interest`);
    return true;
  } catch (error) {
    console.error('Error seeding sample POIs:', error);
    return false;
  }
};

// Function to seed only Islamabad POIs
export const seedIslamabadPOIs = async () => {
  return seedSamplePOIs('islamabad');
};

// Function to seed only Rahim Yar Khan POIs
export const seedRahimYarKhanPOIs = async () => {
  return seedSamplePOIs('rahimyarkhan');
};