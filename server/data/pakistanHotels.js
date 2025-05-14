const pakistanHotels = [
  {
    name: "Pearl Continental Hotel",
    city: "Islamabad",
    country: "Pakistan",
    address: "Club Road, Islamabad 44000",
    description: "Experience luxury in the heart of Islamabad with stunning city views and premium amenities.",
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
    mainImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
    rating: 4.5,
    userRating: 9.2,
    reviewCount: 1241,
    price: 23000,
    amenities: ["Free Wi-Fi", "Fitness Center", "Restaurant", "Pool", "Spa", "Bar", "Room Service", "Parking"],
    location: {
      type: "Point",
      coordinates: [73.0479, 33.7294]
    }
  },
  {
    name: "Serena Hotel",
    city: "Islamabad",
    country: "Pakistan",
    address: "Khayaban-e-Suharwardy, Islamabad 44000",
    description: "Luxury five-star hotel with exceptional dining and beautiful gardens in the diplomatic enclave.",
    images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"],
    mainImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",
    rating: 5,
    userRating: 9.5,
    reviewCount: 1876,
    price: 28000,
    amenities: ["Free Wi-Fi", "Fitness Center", "Restaurant", "Pool", "Spa", "Bar", "Room Service", "Airport Shuttle", "Parking"],
    location: {
      type: "Point",
      coordinates: [73.1031, 33.7215]
    }
  },
  {
    name: "Ramada by Wyndham",
    city: "Islamabad",
    country: "Pakistan",
    address: "Islamabad Club Road, Islamabad 44000",
    description: "Modern accommodation with spacious rooms, close to major attractions and business centers.",
    images: ["https://images.unsplash.com/photo-1582719508461-905c673771fd"],
    mainImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd",
    rating: 4,
    userRating: 8.7,
    reviewCount: 954,
    price: 18000,
    amenities: ["Free Wi-Fi", "Fitness Center", "Restaurant", "Air Conditioning", "Bar"],
    location: {
      type: "Point",
      coordinates: [73.0554, 33.7264]
    }
  },
  {
    name: "Marriott Hotel",
    city: "Islamabad",
    country: "Pakistan",
    address: "Agha Khan Road, Shalimar 5, Islamabad 44000",
    description: "Upscale hotel offering refined dining, an outdoor pool and a fitness center close to key attractions.",
    images: ["https://images.unsplash.com/photo-1618773928121-c32242e63f39"],
    mainImage: "https://images.unsplash.com/photo-1618773928121-c32242e63f39",
    rating: 4.5,
    userRating: 9.0,
    reviewCount: 1102,
    price: 25000,
    amenities: ["Free Wi-Fi", "Fitness Center", "Restaurant", "Pool", "Bar", "Room Service", "Parking"],
    location: {
      type: "Point",
      coordinates: [73.0904, 33.7204]
    }
  },
  {
    name: "Pearl Continental",
    city: "Lahore",
    country: "Pakistan",
    address: "Shahrah-e-Quaid-e-Azam, Lahore 54000",
    description: "Luxury hotel in the heart of Lahore with elegant rooms and premium services.",
    images: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa"],
    mainImage: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa",
    rating: 4.5,
    userRating: 9.3,
    reviewCount: 1452,
    price: 22000,
    amenities: ["Free Wi-Fi", "Fitness Center", "Restaurant", "Pool", "Spa", "Bar", "Room Service"],
    location: {
      type: "Point",
      coordinates: [74.3287, 31.5204]
    }
  },
  {
    name: "Avari Hotel",
    city: "Lahore",
    country: "Pakistan",
    address: "87 Mall Road, Lahore 54000",
    description: "Upscale hotel with multiple dining options, outdoor pool and central location.",
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
    mainImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
    rating: 4,
    userRating: 8.6,
    reviewCount: 976,
    price: 19000,
    amenities: ["Free Wi-Fi", "Fitness Center", "Restaurant", "Pool", "Bar", "Room Service"],
    location: {
      type: "Point",
      coordinates: [74.3278, 31.5602]
    }
  },
  {
    name: "Movenpick Hotel",
    city: "Karachi",
    country: "Pakistan",
    address: "Club Road, Karachi 75530",
    description: "Luxury hotel with sea views, multiple restaurants and modern business facilities.",
    images: ["https://images.unsplash.com/photo-1611892440504-42a792e24d32"],
    mainImage: "https://images.unsplash.com/photo-1611892440504-42a792e24d32",
    rating: 5,
    userRating: 9.4,
    reviewCount: 1243,
    price: 26000,
    amenities: ["Free Wi-Fi", "Fitness Center", "Restaurant", "Pool", "Spa", "Bar", "Room Service", "Airport Shuttle"],
    location: {
      type: "Point",
      coordinates: [67.0099, 24.8607]
    }
  },
  {
    name: "Marriott Hotel",
    city: "Karachi",
    country: "Pakistan",
    address: "9 Abdullah Haroon Road, Karachi 75530",
    description: "Upscale hotel with contemporary rooms, dining options and an outdoor pool.",
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
    mainImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
    rating: 4.5,
    userRating: 8.9,
    reviewCount: 1087,
    price: 24000,
    amenities: ["Free Wi-Fi", "Fitness Center", "Restaurant", "Pool", "Bar", "Room Service"],
    location: {
      type: "Point",
      coordinates: [67.0311, 24.8500]
    }
  },
  {
    name: "Pearl Continental",
    city: "Peshawar",
    country: "Pakistan",
    address: "Khyber Road, Peshawar 25000",
    description: "Luxury hotel with traditional decor, modern amenities and excellent dining options.",
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945"],
    mainImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
    rating: 4,
    userRating: 8.5,
    reviewCount: 765,
    price: 18000,
    amenities: ["Free Wi-Fi", "Fitness Center", "Restaurant", "Bar", "Room Service"],
    location: {
      type: "Point",
      coordinates: [71.5249, 34.0151]
    }
  },
  {
    name: "Serena Hotel",
    city: "Quetta",
    country: "Pakistan",
    address: "Shahrah-e-Zarghoon, Quetta 87300",
    description: "Elegant hotel with traditional architecture, modern amenities and beautiful gardens.",
    images: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa"],
    mainImage: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa",
    rating: 4,
    userRating: 8.7,
    reviewCount: 546,
    price: 20000,
    amenities: ["Free Wi-Fi", "Fitness Center", "Restaurant", "Bar", "Room Service"],
    location: {
      type: "Point",
      coordinates: [67.0104, 30.1798]
    }
  }
];

module.exports = pakistanHotels;
