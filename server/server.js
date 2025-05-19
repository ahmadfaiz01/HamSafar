const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const hotelRoutes = require('./routes/hotelRoutes');  
const recommendationRoutes = require('./routes/recommendationRoutes');

// Configure CORS - Make it simpler and more permissive for development
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic security middleware - modify for development
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(morgan('dev'));

// MongoDB Atlas connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://itsahmadfaiz:lQgIw7Zus5McHvbd@hamsafar.itrl9eo.mongodb.net/hamsafar';

// Database connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Atlas successfully connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// After connecting to MongoDB
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB Atlas');
  
  // List all collections to confirm access
  mongoose.connection.db.listCollections().toArray((err, collections) => {
    if (err) {
      console.error('Error listing collections:', err);
    } else {
      console.log('Available collections:');
      collections.forEach(collection => {
        console.log(` - ${collection.name}`);
      });
    }
  });
});

// Routes
app.use('/api/hotels', hotelRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Add a simple test endpoint
app.get('/api/ping', (req, res) => {
  console.log('Ping received from client');
  res.json({ message: 'API server is working' });
});

// Add a fallback route handler
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Server error', error: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});