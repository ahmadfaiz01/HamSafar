const express = require('express');
const router = express.Router();
const preferenceController = require('../controllers/preferenceController');
const auth = require('../middleware/auth');

// All preference routes require authentication
router.use(auth);

// Get user preferences
router.get('/', preferenceController.getUserPreferences);

// Update user preferences
router.post('/', preferenceController.updateUserPreferences);

module.exports = router;
