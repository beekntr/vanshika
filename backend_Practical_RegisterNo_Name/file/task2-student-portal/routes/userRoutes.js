const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const { getProfile, getStudents } = require('../controllers/userController');

const router = express.Router();

// Any logged-in user
router.get('/profile', authMiddleware, getProfile); // GET /profile

// Admin only – students get 403
router.get('/students', authMiddleware, authorizeRoles('admin'), getStudents); // GET /students

module.exports = router;
