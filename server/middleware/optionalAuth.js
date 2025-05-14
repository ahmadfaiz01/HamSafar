const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Optional authentication middleware
// Attaches user to request if token is valid, but doesn't block if no token
module.exports = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    
    if (!token) {
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without attaching user
    next();
  }
};
