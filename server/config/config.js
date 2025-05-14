// Simple configuration file
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/hamsafar',
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret',
  jwtExpiration: process.env.JWT_EXPIRE || '30d'
};
