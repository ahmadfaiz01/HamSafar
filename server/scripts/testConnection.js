require('dotenv').config();
const mongoose = require('mongoose');

// Get MongoDB URI from environment variables or use the direct string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://itsahmadfaiz:lQgIw7Zus5McHvbd@hamsafar.itrl9eo.mongodb.net/hamsafar?retryWrites=true&w=majority';

console.log('Attempting to connect to MongoDB Atlas...');
console.log('Using URI:', MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):[^@]+@/, 'mongodb+srv://$1:****@')); // Hide password in logs

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
    return mongoose.connection.db.admin().listDatabases();
  })
  .then(result => {
    console.log('Available databases:');
    result.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    return mongoose.disconnect();
  })
  .then(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error connecting to MongoDB Atlas:', err);
    process.exit(1);
  });