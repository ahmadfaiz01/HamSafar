const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/'); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, `${req.params.firebaseUid}-${uniqueSuffix}.${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only images
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Create or update user profile - this matches the AuthContext request
router.post('/', userController.createOrUpdateUser);

// Get user profile
router.get('/:firebaseUid', userController.getUserProfile);

// Update user preferences
router.patch('/:firebaseUid/preferences', userController.updatePreferences);

// Add profile image upload route
router.post('/:firebaseUid/upload-profile-image', 
  upload.single('profileImage'), 
  userController.uploadProfileImage
);

// Add search to user history
router.post('/:firebaseUid/search-history', userController.addSearchHistory);

// Get users with similar preferences
router.get('/:firebaseUid/similar', userController.getSimilarUsers);

// Get nearby users
router.get('/nearby', userController.getNearbyUsers);

// Get user analytics
router.get('/:firebaseUid/analytics', userController.getUserAnalytics);

// Delete user account
router.delete('/:firebaseUid', userController.deleteUser);

module.exports = router;