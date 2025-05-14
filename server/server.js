const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Import routes
const userRoutes = require('./routes/users');
const mapRoutes = require('./routes/mapRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes'); // Add this line
const recommendationRoutes = require('./routes/recommendationRoutes');
const preferenceRoutes = require('./routes/preferenceRoutes');
const itineraryRoutes = require('./routes/itineraryRoutes'); // Add this line

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const profilesDir = path.join(uploadsDir, 'profiles');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}
console.log('Uploads directories created/verified');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files - make sure this is before API routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/static', express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// API routes
app.use('/api/users', userRoutes);
app.use('/api', mapRoutes); 
app.use('/api/hotels', hotelRoutes);
app.use('/api/wishlist', wishlistRoutes); // Add this line
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/itineraries', itineraryRoutes); // Register routes

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});